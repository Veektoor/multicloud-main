'use client';

import { useState } from 'react';
import {
  Building2,
  Check,
  Copy,
  Link2,
  Mail,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
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
      icon: Copy,
      onClick: copyToClipboard,
    },
    {
      name: 'Email',
      icon: Mail,
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
      icon: MessageCircle,
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
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <Building2 size={14} />
              MoMEET invite
            </div>
            <h2 className="text-2xl font-bold">Share Meeting</h2>
            <p className="mt-2 text-sm text-slate-400">
              {meetingTitle}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.88))] p-4 shadow-2xl shadow-black/20">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-cyan-100">
                <Link2 size={16} />
                Invitation link
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck size={14} className="text-green-300" />
                Secure access
              </div>
            </div>
            <div className="flex items-center gap-3 max-sm:flex-col">
              <input
                type="text"
                value={meetingLink}
                readOnly
                className="h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2 font-mono text-xs text-cyan-100 outline-none max-sm:w-full"
              />
              <Button
                onClick={copyToClipboard}
                className="h-11 shrink-0 gap-2 bg-blue-1 px-4 py-2 max-sm:w-full"
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
            {shareOptions.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-dark-2 p-4 transition hover:border-cyan-300/30 hover:bg-white/5"
                >
                  <Icon size={22} className="text-cyan-200" />
                  <span className="text-xs text-slate-400">{option.name}</span>
                </button>
              );
            })}
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
