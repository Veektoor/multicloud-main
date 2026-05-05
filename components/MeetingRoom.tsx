'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  OwnCapability,
  PaginatedGridLayout,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutList, MessageCircle, Users, Share2 } from 'lucide-react';

import { getAppBaseUrl } from '@/lib/browser';
import { formatNairobiDateTime } from '@/lib/datetime';
import {
  archiveMeeting,
  archiveProcessingRecording,
  archiveRecordings,
} from '@/lib/meeting-archive';
import { type MeetingDocument, getMeetingMetadata, isMeetingModerator } from '@/lib/meeting';
import { mergeMeetingDocuments, saveStoredMinuteFiles } from '@/lib/minute-files';
import { useToast } from './ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import ChatComponent from './ChatComponent';
import ShareMeetingModal from './ShareMeetingModal';
import RecordingIndicator from './RecordingIndicator';
import MeetingInfo from './MeetingInfo';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const wait = (durationMs: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const areMeetingDocumentsEqual = (
  left: MeetingDocument[],
  right: MeetingDocument[],
) => {
  if (left === right) return true;
  if (left.length !== right.length) return false;

  return left.every((item, index) => {
    const nextItem = right[index];

    return (
      item.name === nextItem.name &&
      item.mimeType === nextItem.mimeType &&
      item.size === nextItem.size &&
      item.uploadedBy === nextItem.uploadedBy &&
      item.uploadedAt === nextItem.uploadedAt &&
      item.dataUrl === nextItem.dataUrl &&
      item.meetingDate === nextItem.meetingDate &&
      item.meetingAgenda === nextItem.meetingAgenda
    );
  });
};

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const call = useCall();
  const { user } = useUser();
  const { toast } = useToast();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isRecordingActionPending, setIsRecordingActionPending] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isUploadingMinutes, setIsUploadingMinutes] = useState(false);
  const { useCallCallingState, useIsCallRecordingInProgress, useHasPermissions } =
    useCallStateHooks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const minuteFileInputRef = useRef<HTMLInputElement>(null);

  const callingState = useCallCallingState();
  const isRecording = useIsCallRecordingInProgress();
  const canStartRecording = useHasPermissions(OwnCapability.START_RECORD_CALL);
  const canStopRecording = useHasPermissions(OwnCapability.STOP_RECORD_CALL);
  const metadata = getMeetingMetadata(call);
  const isModerator = isMeetingModerator(call, user?.id);
  const recordingMode = call.state.settings?.recording?.mode;
  const isRecordingConfigured =
    recordingMode === 'available' || recordingMode === 'auto-on';
  const canManageRecording = isRecording ? canStopRecording : canStartRecording;
  const [documents, setDocuments] = useState<MeetingDocument[]>(metadata.documents);
  const [minuteFiles, setMinuteFiles] = useState<MeetingDocument[]>(metadata.minuteFiles);
  const meetingLink = `${getAppBaseUrl()}/meeting/${call?.id}`;
  const meetingTitle = metadata.description || 'Meeting';

  useEffect(() => {
    if (!call || callingState !== CallingState.JOINED) return;

    setDocuments((currentDocuments) =>
      areMeetingDocumentsEqual(currentDocuments, metadata.documents)
        ? currentDocuments
        : metadata.documents,
    );
    setMinuteFiles((currentMinuteFiles) =>
      areMeetingDocumentsEqual(currentMinuteFiles, metadata.minuteFiles)
        ? currentMinuteFiles
        : metadata.minuteFiles,
    );
  }, [call, callingState, metadata.documents, metadata.minuteFiles]);

  if (!call || callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  const toggleRecording = async () => {
    try {
      setIsRecordingActionPending(true);
      setRecordingError(null);
      if (isRecording) {
        await call.stopRecording();
        archiveMeeting(call, `${getAppBaseUrl()}/meeting/${call.id}`);
        archiveProcessingRecording(call);
        try {
          let savedRecordings = false;

          for (let attempt = 0; attempt < 5; attempt += 1) {
            const response = await call.queryRecordings();

            if (response.recordings.length > 0) {
              archiveRecordings(call, response.recordings);
              savedRecordings = true;
              break;
            }

            await wait(2000);
          }

          if (!savedRecordings) {
            toast({ title: 'Recording is processing and will appear shortly' });
          }
        } catch (recordingError) {
          console.error('Failed to archive recordings after stopping:', recordingError);
        }
        toast({ title: 'Recording stopped' });
      } else {
        await call.startRecording();
        toast({ title: 'Recording started' });
      }
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : 'Recording action failed';
      const normalizedMessage = message.toLowerCase();
      const details = normalizedMessage.includes('storage')
        ? 'Stream recording storage is not configured yet.'
        : normalizedMessage.includes('permission') ||
            normalizedMessage.includes('capability')
          ? 'Your Stream role for this call cannot start recordings.'
          : normalizedMessage.includes('recording disabled') ||
              normalizedMessage.includes('recording is disabled')
            ? 'Recording is disabled for this call type.'
            : normalizedMessage.includes('inactive call')
              ? 'Join the call before starting the recording.'
              : message;

      setRecordingError(details);
      toast({ title: details });
    } finally {
      setIsRecordingActionPending(false);
    }
  };

  const uploadMeetingFile = async ({
    event,
    target,
    busySetter,
    currentFiles,
    setFiles,
    successMessage,
  }: {
    event: ChangeEvent<HTMLInputElement>;
    target: 'documents' | 'minute_files';
    busySetter: (value: boolean) => void;
    currentFiles: MeetingDocument[];
    setFiles: (files: MeetingDocument[]) => void;
    successMessage: string;
  }) => {
    const file = event.target.files?.[0];

    if (!file || !isModerator) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Use files under 2MB' });
      event.target.value = '';
      return;
    }

    try {
      busySetter(true);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const nextFiles = mergeMeetingDocuments(currentFiles, [
        {
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          uploadedBy: user?.fullName || user?.firstName || user?.username || user?.id || 'Moderator',
          uploadedAt: new Date().toISOString(),
          dataUrl,
          meetingDate:
            target === 'minute_files'
              ? formatNairobiDateTime(call.state.startsAt || new Date())
              : undefined,
          meetingAgenda: target === 'minute_files' ? metadata.agenda : undefined,
        },
      ]);

      if (target === 'minute_files') {
        saveStoredMinuteFiles(call.id, nextFiles);
      }

      try {
        await call.update({
          custom: {
            ...call.state.custom,
            [target]: nextFiles,
          },
        });
      } catch (syncError) {
        console.error('Failed to sync file upload to call metadata:', syncError);
      }

      setFiles(nextFiles);
      toast({ title: successMessage });
    } catch (error) {
      console.error(error);
      toast({ title: 'Upload failed' });
    } finally {
      busySetter(false);
      event.target.value = '';
    }
  };

  const handleDocumentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadMeetingFile({
      event,
      target: 'documents',
      busySetter: setIsUploadingDocument,
      currentFiles: documents,
      setFiles: setDocuments,
      successMessage: 'Document uploaded',
    });
  };

  const handleMinutesUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadMeetingFile({
      event,
      target: 'minute_files',
      busySetter: setIsUploadingMinutes,
      currentFiles: minuteFiles,
      setFiles: setMinuteFiles,
      successMessage: 'Minutes uploaded',
    });
  };

  return (
    <section className="flex h-screen flex-col bg-[#060b16] text-white">
      {/* Header with Meeting Info and Share Button */}
      <div className="border-b border-white/10 bg-[#0b1020]/95 px-4 py-3 backdrop-blur-xl lg:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <h1 className="truncate text-lg font-semibold lg:text-xl">{meetingTitle}</h1>
            <RecordingIndicator isRecording={isRecording} />
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 sm:flex"
          >
            <Share2 size={16} />
            <span className="text-sm">Share</span>
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-2 transition hover:bg-white/10 sm:hidden"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid h-full gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-4 lg:p-4">
          {/* Video Area */}
          <div className="flex min-h-0 flex-col gap-3 lg:gap-4">
            {/* Meeting Title Card - Mobile */}
            <div className="hidden max-lg:block rounded-2xl border border-white/10 bg-[#0f1729] px-4 py-3">
              <MeetingInfo meetingLink={meetingLink} meetingTitle={meetingTitle} />
            </div>

            {/* Video Stream */}
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1322] p-2">
              <CallLayout />
            </div>

            {/* Participants List - Mobile */}
            {showParticipants && (
              <div className="hidden max-lg:block rounded-2xl border border-white/10 bg-[#0f1729] p-4">
                <CallParticipantsList onClose={() => setShowParticipants(false)} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden min-h-0 flex-col gap-4 lg:flex">
            {/* Meeting Info */}
            <MeetingInfo meetingLink={meetingLink} meetingTitle={meetingTitle} />

            {/* Recording Controls */}
            <div className="rounded-2xl border border-white/10 bg-[#0f1729] p-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-400">Recording</p>
                <button
                  disabled={
                    !canManageRecording || !isRecordingConfigured || isRecordingActionPending
                  }
                  onClick={toggleRecording}
                  className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition disabled:cursor-not-allowed disabled:bg-slate-600 hover:bg-white/90"
                >
                  {isRecordingActionPending
                    ? 'Updating...'
                    : isRecording
                      ? 'Stop recording'
                      : 'Start recording'}
                </button>
                {!isRecordingConfigured && (
                  <p className="text-xs text-amber-300">
                    Recording is disabled for this call. New meetings created from now on will
                    have recording enabled.
                  </p>
                )}
                {isRecordingConfigured && !canManageRecording && (
                  <p className="text-xs text-slate-400">
                    Stream has not granted this user permission to manage recordings for this call.
                  </p>
                )}
                {recordingError && (
                  <p className="text-xs text-red-300">{recordingError}</p>
                )}
              </div>
            </div>

            {/* Minutes Section */}
            <div className="rounded-2xl border border-white/10 bg-[#0f1729] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-400">Minutes</p>
                {isModerator && (
                  <>
                    <input
                      ref={minuteFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleMinutesUpload}
                    />
                    <button
                      onClick={() => minuteFileInputRef.current?.click()}
                      disabled={isUploadingMinutes}
                      className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
                    >
                      {isUploadingMinutes ? 'Uploading...' : 'Upload'}
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {minuteFiles.length > 0 ? (
                  minuteFiles.map((document, index) => (
                    <a
                      key={`${document.name}-${index}`}
                      href={document.dataUrl}
                      download={document.name}
                      className="block rounded-lg border border-white/10 p-2 text-xs transition hover:bg-white/5"
                    >
                      <p className="truncate text-white font-medium">{document.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {document.uploadedBy}
                      </p>
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No minutes uploaded</p>
                )}
              </div>
            </div>

            {/* Documents Section */}
            <div className="rounded-2xl border border-white/10 bg-[#0f1729] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-400">Documents</p>
                {isModerator && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingDocument}
                      className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
                    >
                      {isUploadingDocument ? 'Uploading...' : 'Upload'}
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {documents.length > 0 ? (
                  documents.map((document, index) => (
                    <a
                      key={`${document.name}-${index}`}
                      href={document.dataUrl}
                      download={document.name}
                      className="block rounded-lg border border-white/10 p-2 text-xs transition hover:bg-white/5"
                    >
                      <p className="truncate text-white font-medium">{document.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {document.uploadedBy}
                      </p>
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No documents</p>
                )}
              </div>
            </div>

            {/* Chat */}
            {showChat && <ChatComponent meetingId={call.id} onClose={() => setShowChat(false)} />}
          </aside>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="border-t border-white/10 bg-[#08101d] p-3 lg:p-4">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-2 lg:gap-3">
          <CallControls onLeave={() => router.push(`/`)} />

          {/* Layout Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-lg border border-white/10 bg-[#19232d] p-2 transition hover:bg-white/5">
              <LayoutList size={18} className="text-white" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-white/10 bg-[#0b1020] text-white">
              <DropdownMenuItem onClick={() => setLayout('grid')}>
                Grid Layout
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-white/10" />
              <DropdownMenuItem onClick={() => setLayout('speaker-left')}>
                Speaker Left
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-white/10" />
              <DropdownMenuItem onClick={() => setLayout('speaker-right')}>
                Speaker Right
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CallStatsButton />

          {/* Participants Button */}
          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
              showParticipants
                ? 'border-cyan-400/40 bg-cyan-500/10'
                : 'border-white/10 bg-[#19232d] hover:bg-white/5'
            }`}
          >
            <Users size={18} />
            <span className="hidden text-sm sm:inline">People</span>
          </button>

          {/* Messages Button */}
          <button
            onClick={() => setShowChat((prev) => !prev)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
              showChat
                ? 'border-cyan-400/40 bg-cyan-500/10'
                : 'border-white/10 bg-[#19232d] hover:bg-white/5'
            }`}
          >
            <MessageCircle size={18} />
            <span className="hidden text-sm sm:inline">Chat</span>
          </button>

          {/* Recording Status */}
          <div className="rounded-lg border border-white/10 bg-[#19232d] px-3 py-2 text-xs text-slate-300">
            {isRecording ? '🔴 Recording' : '⚪ Idle'}
          </div>

          {!isPersonalRoom && <EndCallButton />}
        </div>
      </div>

      {/* Share Meeting Modal */}
      <ShareMeetingModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        meetingLink={meetingLink}
        meetingTitle={meetingTitle}
      />
    </section>
  );
};

export default MeetingRoom;
