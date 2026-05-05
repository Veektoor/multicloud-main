'use client';

import { useMemo } from 'react';

import { formatNairobiDate, formatNairobiDateTime } from '@/lib/datetime';
import { ArchivedMeeting } from '@/lib/meeting-archive';
import { getMeetingMetadata } from '@/lib/meeting';
import { useGetCalls } from '@/hooks/useGetCalls';
import Loader from './Loader';

type MinuteEntry = {
  id: string;
  title: string;
  meetingDate: string;
  meetingAgenda: string;
  uploadedAt: string;
  uploadedBy: string;
  filename: string;
  dataUrl: string;
};

const MinutesArchive = () => {
  const { callRecordings, archivedMeetings, isLoading } = useGetCalls();

  const groupedEntries = useMemo(() => {
    const liveEntries =
      callRecordings?.flatMap((call) => {
        const metadata = getMeetingMetadata(call);

        return metadata.minuteFiles.map((file) => ({
          id: `${call.id}-${file.name}-${file.uploadedAt}`,
          title: metadata.description,
          meetingDate:
            file.meetingDate ||
            formatNairobiDateTime(call.state.startsAt || file.uploadedAt),
          meetingAgenda: file.meetingAgenda || metadata.agenda,
          uploadedAt: file.uploadedAt,
          uploadedBy: file.uploadedBy,
          filename: file.name,
          dataUrl: file.dataUrl,
        }));
      }) || [];

    const archivedEntries = archivedMeetings.flatMap((meeting: ArchivedMeeting) =>
      meeting.minuteFiles.map((file) => ({
        id: `${meeting.callId}-${file.name}-${file.uploadedAt}`,
        title: meeting.description,
        meetingDate:
          file.meetingDate ||
          (formatNairobiDateTime(meeting.startsAt || file.uploadedAt)),
        meetingAgenda: file.meetingAgenda || meeting.agenda || '',
        uploadedAt: file.uploadedAt,
        uploadedBy: file.uploadedBy,
        filename: file.name,
        dataUrl: file.dataUrl,
      })),
    );

    const entries = [...liveEntries, ...archivedEntries].filter(
      (entry, index, currentEntries) =>
        currentEntries.findIndex((candidate) => candidate.id === entry.id) === index,
    );

    const sortedEntries = entries.sort(
      (left, right) =>
        new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime(),
    );

    return sortedEntries.reduce<Record<string, MinuteEntry[]>>((groups, entry) => {
      const label = formatNairobiDate(entry.uploadedAt, { dateStyle: 'medium' });

      groups[label] = groups[label] || [];
      groups[label].push(entry);

      return groups;
    }, {});
  }, [archivedMeetings, callRecordings]);

  if (isLoading) return <Loader />;

  const sections = Object.entries(groupedEntries);

  if (sections.length === 0) {
    return <p className="text-sm text-slate-400">No minutes</p>;
  }

  return (
    <div className="space-y-6">
      {sections.map(([date, entries]) => (
        <section key={date} className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-300">{date}</h2>
          <div className="grid gap-3">
            {entries.map((entry) => (
              <a
                key={entry.id}
                href={entry.dataUrl}
                download={entry.filename}
                className="rounded-2xl border border-white/10 bg-[#0f1729] p-4 text-white transition hover:bg-white/5"
              >
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{entry.filename}</p>
                  </div>
                  <div className="text-xs text-slate-400 md:text-right">
                    <p>{entry.uploadedBy}</p>
                    <p>{formatNairobiDateTime(entry.uploadedAt)}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">{entry.meetingDate}</p>
                <p className="mt-1 text-xs text-slate-400">{entry.meetingAgenda}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default MinutesArchive;

