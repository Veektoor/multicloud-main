'use client';

import { useState } from 'react';
import { useCall } from '@stream-io/video-react-sdk';
import { Share2, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import ShareMeetingModal from './ShareMeetingModal';

interface MeetingInfoProps {
  meetingLink: string;
  meetingTitle?: string;
}

const MeetingInfo = ({ meetingLink, meetingTitle = 'Meeting' }: MeetingInfoProps) => {
  const call = useCall();
  const [showShareModal, setShowShareModal] = useState(false);

  const participantCount = call?.state.members?.length || 0;
  const startedAt = call?.state.createdAt ? new Date(call.state.createdAt) : null;
  const duration = startedAt ? Math.floor((Date.now() - startedAt.getTime()) / 1000) : 0;
  const durationMinutes = Math.floor(duration / 60);
  const durationSeconds = duration % 60;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-dark-2 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-400">
              Meeting Title
            </h3>
            <p className="truncate text-lg font-bold">{meetingTitle}</p>
          </div>
          <Button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 bg-blue-1 px-4 py-2"
          >
            <Share2 size={18} />
            <span className="max-sm:hidden">Share</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 max-sm:grid-cols-1">
          <div className="flex items-center gap-3 rounded-lg bg-dark-1 p-3">
            <Users size={20} className="text-blue-1" />
            <div>
              <p className="text-xs text-slate-400">Participants</p>
              <p className="text-lg font-semibold">{participantCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-dark-1 p-3">
            <Clock size={20} className="text-green-500" />
            <div>
              <p className="text-xs text-slate-400">Duration</p>
              <p className="text-lg font-semibold">
                {durationMinutes}:{String(durationSeconds).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ShareMeetingModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        meetingLink={meetingLink}
        meetingTitle={meetingTitle}
      />
    </>
  );
};

export default MeetingInfo;
