'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Copy } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

interface ShareMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingLink: string;
  meetingTitle?: string;
}

const ShareMeetingModal = ({
  isOpen,
  onClose,
  meetingLink,
  meetingTitle = 'Meeting',
}: ShareMeetingModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Meeting link has been copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please try again.',
      });
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: '📋',
      onClick: copyToClipboard,
    },
    {
      name: 'Email',
      icon: '📧',
      onClick: () => {
        const subject = `Join my ${meetingTitle}`;
        const body = `Join me for ${meetingTitle}:\n\n${meetingLink}`;
        window.open(
          `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        );
      },
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      onClick: () => {
        const text = `Join me for ${meetingTitle}: ${meetingLink}`;
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text)}`,
          '_blank'
        );
      },
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex w-full max-w-[520px] flex-col gap-6 border-none bg-dark-1 px-6 py-9 text-white">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold">Share Meeting</h2>

          <div className="rounded-lg border border-white/10 bg-dark-2 p-4">
            <p className="mb-3 text-sm text-slate-400">Meeting Link</p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={meetingLink}
                readOnly
                className="flex-1 rounded-lg border border-white/10 bg-dark-2 px-4 py-2 text-sm text-white outline-none"
              />
              <Button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-blue-1 px-4 py-2"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.onClick}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-dark-2 p-4 transition hover:bg-white/5"
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="text-xs text-slate-400">{option.name}</span>
              </button>
            ))}
          </div>

          <Button
            onClick={onClose}
            className="mt-2 bg-slate-700 hover:bg-slate-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareMeetingModal;
