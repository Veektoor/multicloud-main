import type { Call } from '@stream-io/video-react-sdk';
import { getStoredMinuteFiles, mergeMeetingDocuments } from './minute-files';

export type MeetingDocument = {
  name: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  dataUrl: string;
  meetingDate?: string;
  meetingAgenda?: string;
};

type MeetingCustomData = {
  description?: string;
  agenda?: string;
  minutes?: string;
  minutes_owner?: string;
  moderator_ids?: string[];
  recording_storage_label?: string;
  recording_storage_path?: string;
  recording_provider?: string;
  documents?: MeetingDocument[];
  minute_files?: MeetingDocument[];
};

const DEFAULT_STORAGE_LABEL =
  process.env.NEXT_PUBLIC_GCS_RECORDING_BUCKET || 'Configure GCS bucket';

export function buildMeetingCustomData({
  description,
  agenda,
  minutes,
  minutesOwner,
  moderatorIds,
  meetingId,
}: {
  description: string;
  agenda: string;
  minutes: string;
  minutesOwner: string;
  moderatorIds: string[];
  meetingId: string;
}) {
  return {
    description,
    agenda,
    minutes,
    minutes_owner: minutesOwner,
    moderator_ids: moderatorIds,
    recording_provider: 'Google Cloud Storage',
    recording_storage_label: DEFAULT_STORAGE_LABEL,
    recording_storage_path: `gs://${DEFAULT_STORAGE_LABEL}/meetings/${meetingId}`,
    documents: [],
    minute_files: [],
  };
}

export function getMeetingMetadata(call?: Call) {
  const custom = (call?.state.custom || {}) as MeetingCustomData;
  const storedMinuteFiles = getStoredMinuteFiles(call?.id);
  const minuteFiles = mergeMeetingDocuments(custom.minute_files || [], storedMinuteFiles);

  return {
    description: custom.description || 'Team sync',
    agenda: custom.agenda || 'Review agenda, blockers, and next actions.',
    minutes: custom.minutes || 'Minutes will appear here once the moderator saves them.',
    minutesOwner: custom.minutes_owner || 'Moderator',
    moderatorIds: custom.moderator_ids || [],
    storageLabel: custom.recording_storage_label || DEFAULT_STORAGE_LABEL,
    storagePath:
      custom.recording_storage_path ||
      `gs://${DEFAULT_STORAGE_LABEL}/meetings/${call?.id || 'meeting-id'}`,
    storageProvider: custom.recording_provider || 'Google Cloud Storage',
    documents: custom.documents || [],
    minuteFiles,
  };
}

export function isMeetingModerator(call: Call | undefined, userId: string | undefined) {
  if (!call || !userId) return false;

  const metadata = getMeetingMetadata(call);
  const member = call.state.members.find((item) => item.user_id === userId);

  return (
    metadata.moderatorIds.includes(userId) ||
    member?.role === 'admin' ||
    call.state.createdBy?.id === userId
  );
}
