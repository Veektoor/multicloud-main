'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Call, CallRecording } from '@stream-io/video-react-sdk';

import { getAppBaseUrl } from '@/lib/browser';
import { formatNairobiDateTime } from '@/lib/datetime';
import {
  ArchivedMeeting,
  ArchivedRecording,
  archiveMeeting,
  archiveRecordings,
} from '@/lib/meeting-archive';
import { MeetingDocument, getMeetingMetadata, isMeetingModerator } from '@/lib/meeting';
import { mergeMeetingDocuments, saveStoredMinuteFiles } from '@/lib/minute-files';
import Loader from './Loader';
import { useGetCalls } from '@/hooks/useGetCalls';
import MeetingCard from './MeetingCard';
import { useToast } from './ui/use-toast';

type RecordingWithCall = {
  call: Call;
  recording: CallRecording;
};

const CallList = ({ type }: { type: 'ended' | 'upcoming' | 'recordings' }) => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const {
    endedCalls,
    upcomingCalls,
    callRecordings,
    archivedMeetings,
    archivedRecordings,
    isLoading,
  } = useGetCalls();
  const [recordings, setRecordings] = useState<RecordingWithCall[]>([]);
  const [uploadingMinutesCallId, setUploadingMinutesCallId] = useState<string | null>(null);
  const [, setMinuteFilesVersion] = useState(0);
  const hasProcessingRecordings = archivedRecordings.some(
    (recording) => recording.status === 'processing',
  );

  const downloadRecording = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to download recording: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
      toast({ title: 'Download started' });
    } catch (error) {
      console.error('Falling back to direct recording download:', error);
      window.open(url, '_blank', 'noopener,noreferrer');
      toast({ title: 'Opened recording in a new tab' });
    }
  };

  const fetchRecordings = useCallback(async () => {
    const responses = await Promise.allSettled(
      (callRecordings || []).map(async (meeting) => {
        const response = await meeting.queryRecordings();
        if (response.recordings.length > 0) {
          archiveRecordings(meeting, response.recordings);
        }

        return response.recordings.map((recording) => ({
          call: meeting,
          recording,
        }));
      }),
    );

    const nextRecordings = responses.flatMap((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }

      console.error('Failed to load call recordings:', result.reason);
      return [];
    });

    setRecordings(nextRecordings);
  }, [callRecordings]);

  useEffect(() => {
    if (type !== 'recordings') return;

    fetchRecordings().catch((error) => {
      console.error('Failed to fetch recordings:', error);
    });
  }, [type, fetchRecordings]);

  useEffect(() => {
    if (type !== 'recordings' || !hasProcessingRecordings) return;

    const intervalId = window.setInterval(() => {
      fetchRecordings().catch((error) => {
        console.error('Failed to poll recordings:', error);
      });
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [type, hasProcessingRecordings, fetchRecordings]);

  const calls = useMemo(() => {
    if (type === 'ended') {
      const liveCalls = endedCalls || [];
      const archivedOnlyMeetings = archivedMeetings.filter(
        (meeting) => !liveCalls.some((call) => call.id === meeting.callId),
      );

      return [...liveCalls, ...archivedOnlyMeetings];
    }

    if (type === 'recordings') {
      const liveRecordings = recordings;
      const archivedOnlyRecordings = archivedRecordings.filter(
        (recording) =>
          !liveRecordings.some(
            (currentRecording) =>
              `${currentRecording.call.id}-${currentRecording.recording.filename}-${currentRecording.recording.start_time}` ===
              recording.id,
          ),
      );

      return [...liveRecordings, ...archivedOnlyRecordings];
    }

    if (type === 'upcoming') {
      return upcomingCalls || [];
    }

    return [];
  }, [type, endedCalls, upcomingCalls, recordings, archivedMeetings, archivedRecordings]);

  const noCallsMessage =
    type === 'ended'
      ? 'No past'
      : type === 'upcoming'
        ? 'No next'
        : 'No recordings';

  const uploadMinutesForCall =
    (call: Call, existingFiles: MeetingDocument[]) =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;
      if (!isMeetingModerator(call, user?.id)) {
        toast({ title: 'Only moderators can upload minutes' });
        event.target.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Use files under 2MB' });
        event.target.value = '';
        return;
      }

      try {
        setUploadingMinutesCallId(call.id);

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        const metadata = getMeetingMetadata(call);
        const nextMinuteFiles = mergeMeetingDocuments(existingFiles, [
          {
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            uploadedBy:
              user?.fullName || user?.firstName || user?.username || user?.id || 'Moderator',
            uploadedAt: new Date().toISOString(),
            dataUrl,
            meetingDate:
              formatNairobiDateTime(call.state.startsAt || new Date()),
            meetingAgenda: metadata.agenda,
          },
        ]);

        saveStoredMinuteFiles(call.id, nextMinuteFiles);

        try {
          await call.update({
            custom: {
              ...call.state.custom,
              minute_files: nextMinuteFiles,
            },
          });
        } catch (syncError) {
          console.error('Failed to sync minutes to call metadata:', syncError);
        }

        archiveMeeting(call, `${getAppBaseUrl()}/meeting/${call.id}`);
        toast({ title: 'Minutes uploaded' });
        setMinuteFilesVersion((currentVersion) => currentVersion + 1);
      } catch (error) {
        console.error('Failed to upload minutes:', error);
        toast({ title: 'Upload failed' });
      } finally {
        setUploadingMinutesCallId(null);
        event.target.value = '';
      }
    };

  if (isLoading) return <Loader />;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls.length > 0 ? (
        calls.map((meeting) => {
          if (type === 'recordings') {
            if ('recording' in (meeting as RecordingWithCall)) {
              const item = meeting as RecordingWithCall;
              const metadata = getMeetingMetadata(item.call);
              const moderatorNames = item.call.state.members
                .filter(
                  (member) =>
                    member.role === 'admin' ||
                    metadata.moderatorIds.includes(member.user_id),
                )
                .map((member) => member.user.name || member.user_id);

              return (
                <MeetingCard
                  key={`${item.call.id}-${item.recording.filename}`}
                  icon="/icons/recordings.svg"
                  title={item.call.state.custom.description || item.recording.filename || 'Recording'}
                  date={formatNairobiDateTime(item.recording.start_time)}
                  link={item.recording.url}
                  buttonIcon1="/icons/play.svg"
                  buttonText="Play"
                  handleClick={() =>
                    window.open(item.recording.url, '_blank', 'noopener,noreferrer')
                  }
                  secondaryActionLabel="Download"
                  onSecondaryAction={() =>
                    downloadRecording(
                      item.recording.url,
                      item.recording.filename || `${item.call.id}-recording.mp4`,
                    )
                  }
                  hideCopyLink
                  agenda={metadata.agenda}
                  minutes={undefined}
                  storage={`${metadata.storageProvider}: ${metadata.storageLabel}`}
                  storagePath={metadata.storagePath}
                  moderators={moderatorNames}
                  minutesOwner={undefined}
                  minuteFiles={metadata.minuteFiles}
                />
              );
            }

            const archivedRecording = meeting as ArchivedRecording;

            return (
                <MeetingCard
                  key={archivedRecording.id}
                  icon="/icons/recordings.svg"
                  title={archivedRecording.title}
                  date={formatNairobiDateTime(archivedRecording.startTime)}
                  link={archivedRecording.url || '#'}
                  buttonIcon1="/icons/play.svg"
                  buttonText={archivedRecording.status === 'ready' ? 'Play' : undefined}
                  handleClick={() => {
                    if (archivedRecording.url) {
                      window.open(archivedRecording.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  secondaryActionLabel={
                    archivedRecording.status === 'ready' ? 'Download' : undefined
                  }
                  onSecondaryAction={
                    archivedRecording.status === 'ready' && archivedRecording.url
                      ? () => downloadRecording(archivedRecording.url!, archivedRecording.filename)
                      : undefined
                  }
                hideCopyLink={archivedRecording.status !== 'ready'}
                isPreviousMeeting={archivedRecording.status !== 'ready'}
                isProcessing={archivedRecording.status === 'processing'}
                statusNote={
                  archivedRecording.status === 'processing'
                    ? 'Recording is processing and will appear here once it is ready.'
                      : undefined
                  }
                  agenda={archivedRecording.agenda}
                  minutes={undefined}
                  storage={archivedRecording.storage}
                storagePath={archivedRecording.storagePath}
                moderators={archivedRecording.moderators}
                minutesOwner={undefined}
                minuteFiles={archivedRecording.minuteFiles}
              />
            );
          }

          if ('state' in (meeting as Call)) {
            const call = meeting as Call;
            const metadata = getMeetingMetadata(call);
            const moderatorNames = call.state.members
              .filter(
                (member) =>
                  member.role === 'admin' || metadata.moderatorIds.includes(member.user_id),
              )
              .map((member) => member.user.name || member.user_id);

            return (
              <MeetingCard
                key={call.id}
                icon={
                  type === 'ended'
                    ? '/icons/previous.svg'
                    : '/icons/upcoming.svg'
                }
                title={metadata.description}
                date={formatNairobiDateTime(call.state?.startsAt)}
                isPreviousMeeting={type === 'ended'}
                link={`${getAppBaseUrl()}/meeting/${call.id}`}
                buttonText="Start"
                handleClick={() => router.push(`/meeting/${call.id}`)}
                agenda={type === 'ended' ? undefined : metadata.agenda}
                minutes={type === 'ended' ? undefined : metadata.minutes}
                storage={
                  type === 'ended'
                    ? undefined
                    : `${metadata.storageProvider}: ${metadata.storageLabel}`
                }
                storagePath={type === 'ended' ? undefined : metadata.storagePath}
                moderators={type === 'ended' ? undefined : moderatorNames}
                minutesOwner={type === 'ended' ? undefined : metadata.minutesOwner}
                minuteFiles={metadata.minuteFiles}
                canUploadMinutes={type === 'ended' && isMeetingModerator(call, user?.id)}
                isUploadingMinutes={uploadingMinutesCallId === call.id}
                onUploadMinutes={
                  type === 'ended'
                    ? uploadMinutesForCall(call, metadata.minuteFiles)
                    : undefined
                }
              />
            );
          }

          const archivedMeeting = meeting as ArchivedMeeting;

          return (
            <MeetingCard
              key={archivedMeeting.callId}
              icon="/icons/previous.svg"
              title={archivedMeeting.description}
              date={
                formatNairobiDateTime(archivedMeeting.startsAt)
              }
              isPreviousMeeting
              link={archivedMeeting.link}
              buttonText="Start"
              handleClick={() => router.push(`/meeting/${archivedMeeting.callId}`)}
              minuteFiles={archivedMeeting.minuteFiles}
            />
          );
        })
      ) : (
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
