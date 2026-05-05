'use client';

import { Dot } from 'lucide-react';

interface RecordingIndicatorProps {
  isRecording: boolean;
  onRecordingClick?: () => void;
}

const RecordingIndicator = ({ isRecording, onRecordingClick }: RecordingIndicatorProps) => {
  if (!isRecording) return null;

  return (
    <button
      onClick={onRecordingClick}
      className="flex animate-pulse items-center gap-2 rounded-full bg-red-600/20 px-3 py-1.5 text-red-500 transition hover:bg-red-600/30"
    >
      <Dot size={16} className="fill-red-500" />
      <span className="text-xs font-semibold">Recording</span>
    </button>
  );
};

export default RecordingIndicator;
