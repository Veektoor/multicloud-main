'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { Link2, ShieldCheck, UserRound } from 'lucide-react';

import { useGetCallById } from '@/hooks/useGetCallById';
import { copyTextToClipboard, getAppBaseUrl } from '@/lib/browser';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Table = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-start gap-2 xl:flex-row">
      <h1 className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">
        {title}:
      </h1>
      <h1 className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">
        {description}
      </h1>
    </div>
  );
};

const PersonalRoomPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const { toast } = useToast();

  const meetingId = user?.id;

  const { call } = useGetCallById(meetingId!);

  const startRoom = async () => {
    if (!client || !user) return;

    const newCall = client.call('default', meetingId!);

    if (!call) {
      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          settings_override: {
            recording: {
              mode: 'available',
              quality: '720p',
            },
          },
        },
      });
    }

    router.push(`/meeting/${meetingId}?personal=true`);
  };

  const meetingLink = `${getAppBaseUrl()}/meeting/${meetingId}?personal=true`;
  const hostName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Your host';

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-xl font-bold lg:text-3xl">Personal Meeting Room</h1>
      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        <Table title="Topic" description={`${user?.firstName || 'User'}'s Meeting Room`} />
        <Table title="Meeting ID" description={meetingId!} />
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.88))] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <Link2 size={17} />
                Personal invitation link
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-green-400/25 bg-green-400/10 px-2.5 py-1 text-xs font-medium text-green-200">
                <ShieldCheck size={14} />
                Secure access
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
            <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <UserRound className="mt-0.5 shrink-0 text-cyan-200" size={18} />
              <div>
                <p className="text-xs text-slate-500">Host</p>
                <p className="mt-0.5 text-sm font-medium text-slate-100">
                  {hostName}
                </p>
              </div>
            </div>

            <p className="min-w-0 break-all rounded-lg border border-cyan-300/20 bg-slate-950/50 px-4 py-3 font-mono text-xs leading-5 text-cyan-100">
              {meetingLink}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-5">
        <Button className="bg-blue-1" onClick={startRoom}>
          Start Meeting
        </Button>
        <Button
          className="bg-dark-3"
          onClick={async () => {
            try {
              await copyTextToClipboard(meetingLink);
              toast({
                title: 'Link copied',
              });
            } catch (error) {
              console.error('Failed to copy invitation link:', error);
              toast({
                title: 'Copy failed',
              });
            }
          }}
        >
          Copy Invitation
        </Button>
      </div>
    </section>
  );
};

export default PersonalRoomPage;
