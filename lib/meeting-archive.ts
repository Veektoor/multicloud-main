'use client';

import type { Call, CallRecording } from '@stream-io/video-react-sdk';

import type { MeetingDocument } from './meeting';
import { getMeetingMetadata } from './meeting';
import { mergeMeetingDocuments } from './minute-files';

const MEETING_ARCHIVE_STORAGE_KEY = 'momeet-meeting-archive';
const ARCHIVE_UPDATED_EVENT = 'momeet-archive-updated';

export type ArchivedMeeting = {
  callId: string;
  description: string;
  startsAt?: string;
  endedAt?: string;
  link: string;
  agenda?: string;
  minutes?: string;
  storage?: string;
  storagePath?: string;
  moderators?: string[];
  minutesOwner?: string;
  minuteFiles: MeetingDocument[];
};

export type ArchivedRecording = {
  id: string;
  callId: string;
  filename: string;
  url?: string;
  startTime: string;
  title: string;
  status: 'processing' | 'ready';
  agenda?: string;
  storage?: string;
  storagePath?: string;
  moderators?: string[];
  minuteFiles: MeetingDocument[];
};

type MeetingArchiveStore = {
  meetings: ArchivedMeeting[];
  recordings: ArchivedRecording[];
};

function emitArchiveUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ARCHIVE_UPDATED_EVENT));
  }
}

function readArchiveStore(): MeetingArchiveStore {
  if (typeof window === 'undefined') {
    return { meetings: [], recordings: [] };
  }

  try {
    const raw = window.localStorage.getItem(MEETING_ARCHIVE_STORAGE_KEY);

    if (!raw) {
      return { meetings: [], recordings: [] };
    }

    const parsed = JSON.parse(raw) as Partial<MeetingArchiveStore>;

    return {
      meetings: parsed.meetings || [],
      recordings: parsed.recordings || [],
    };
  } catch (error) {
    console.error('Failed to read meeting archive:', error);
    return { meetings: [], recordings: [] };
  }
}

function writeArchiveStore(store: MeetingArchiveStore) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(MEETING_ARCHIVE_STORAGE_KEY, JSON.stringify(store));
    emitArchiveUpdated();
  } catch (error) {
    console.error('Failed to save meeting archive:', error);
  }
}

function upsertMeeting(meetings: ArchivedMeeting[], nextMeeting: ArchivedMeeting) {
  const existingMeeting = meetings.find((meeting) => meeting.callId === nextMeeting.callId);

  if (!existingMeeting) {
    return [nextMeeting, ...meetings];
  }

  return meetings.map((meeting) =>
    meeting.callId === nextMeeting.callId
      ? {
          ...meeting,
          ...nextMeeting,
          minuteFiles: mergeMeetingDocuments(meeting.minuteFiles, nextMeeting.minuteFiles),
        }
      : meeting,
  );
}

function upsertRecordings(
  recordings: ArchivedRecording[],
  nextRecordings: ArchivedRecording[],
) {
  return nextRecordings.reduce((currentRecordings, nextRecording) => {
    const existingRecording = currentRecordings.find(
      (recording) => recording.id === nextRecording.id,
    );

    if (!existingRecording) {
      return [nextRecording, ...currentRecordings];
    }

    return currentRecordings.map((recording) =>
      recording.id === nextRecording.id
        ? {
            ...recording,
            ...nextRecording,
            minuteFiles: mergeMeetingDocuments(recording.minuteFiles, nextRecording.minuteFiles),
          }
        : recording,
    );
  }, recordings);
}

export function getArchivedMeetings() {
  return readArchiveStore().meetings;
}

export function getArchivedRecordings() {
  return readArchiveStore().recordings;
}

export function archiveMeeting(call: Call, meetingLink: string) {
  const metadata = getMeetingMetadata(call);
  const moderators = call.state.members
    .filter(
      (member) =>
        member.role === 'admin' || metadata.moderatorIds.includes(member.user_id),
    )
    .map((member) => member.user.name || member.user_id);

  const archivedMeeting: ArchivedMeeting = {
    callId: call.id,
    description: metadata.description,
    startsAt: call.state.startsAt?.toISOString(),
    endedAt: call.state.endedAt?.toISOString() || new Date().toISOString(),
    link: meetingLink,
    agenda: metadata.agenda,
    minutes: metadata.minutes,
    storage: `${metadata.storageProvider}: ${metadata.storageLabel}`,
    storagePath: metadata.storagePath,
    moderators,
    minutesOwner: metadata.minutesOwner,
    minuteFiles: metadata.minuteFiles,
  };

  const store = readArchiveStore();
  writeArchiveStore({
    ...store,
    meetings: upsertMeeting(store.meetings, archivedMeeting),
  });
}

export function archiveRecordings(call: Call, recordings: CallRecording[]) {
  if (recordings.length === 0) return;

  const metadata = getMeetingMetadata(call);
  const moderators = call.state.members
    .filter(
      (member) =>
        member.role === 'admin' || metadata.moderatorIds.includes(member.user_id),
    )
    .map((member) => member.user.name || member.user_id);

  const archivedRecordings = recordings.map((recording) => ({
    id: `${call.id}-${recording.filename}-${recording.start_time}`,
    callId: call.id,
    filename: recording.filename || `${call.id}-recording.mp4`,
    url: recording.url,
    startTime: recording.start_time,
    title: metadata.description,
    status: 'ready' as const,
    agenda: metadata.agenda,
    storage: `${metadata.storageProvider}: ${metadata.storageLabel}`,
    storagePath: metadata.storagePath,
    moderators,
    minuteFiles: metadata.minuteFiles,
  }));

  const store = readArchiveStore();
  const filteredRecordings = store.recordings.filter(
    (recording) => !(recording.callId === call.id && recording.status === 'processing'),
  );
  writeArchiveStore({
    ...store,
    recordings: upsertRecordings(filteredRecordings, archivedRecordings),
  });
}

export function archiveProcessingRecording(call: Call) {
  const metadata = getMeetingMetadata(call);
  const moderators = call.state.members
    .filter(
      (member) =>
        member.role === 'admin' || metadata.moderatorIds.includes(member.user_id),
    )
    .map((member) => member.user.name || member.user_id);

  const processingRecording: ArchivedRecording = {
    id: `processing-${call.id}`,
    callId: call.id,
    filename: `${call.id}-recording.mp4`,
    startTime: new Date().toISOString(),
    title: metadata.description,
    status: 'processing',
    agenda: metadata.agenda,
    storage: `${metadata.storageProvider}: ${metadata.storageLabel}`,
    storagePath: metadata.storagePath,
    moderators,
    minuteFiles: metadata.minuteFiles,
  };

  const store = readArchiveStore();
  writeArchiveStore({
    ...store,
    recordings: upsertRecordings(store.recordings, [processingRecording]),
  });
}

export function subscribeToMeetingArchive(onUpdate: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener(ARCHIVE_UPDATED_EVENT, onUpdate);

  return () => {
    window.removeEventListener(ARCHIVE_UPDATED_EVENT, onUpdate);
  };
}
