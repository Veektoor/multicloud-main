/* eslint-disable camelcase */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import {
  AlertCircle,
  Building2,
  CalendarClock,
  CheckCircle,
  Link2,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { buildMeetingCustomData } from '@/lib/meeting';
import { copyTextToClipboard, getAppBaseUrl } from '@/lib/browser';
import { validateMeetingLink } from '@/lib/validation';
import { formatNairobiDateTime } from '@/lib/datetime';
import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import Loader from './Loader';
import ReactDatePicker from 'react-datepicker';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const [isCreating, setIsCreating] = useState(false);
  const [linkError, setLinkError] = useState('');
  const client = useStreamVideoClient();
  const { user } = useUser();
  const { toast } = useToast();

  const moderatorIds = user?.id ? [user.id] : [];
  const meetingLink = callDetail ? `${getAppBaseUrl()}/meeting/${callDetail.id}` : '';
  const organizerName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || 'MoMEET organizer';
  const meetingTitle = values.description || 'MoMEET Meeting';

  const validateAndJoinMeeting = () => {
    setLinkError('');
    
    if (!values.link.trim()) {
      setLinkError('Please enter a meeting link');
      return;
    }

    // Check if it's a valid meeting link format
    if (!validateMeetingLink(values.link) && !values.link.includes('meeting')) {
      setLinkError('Invalid meeting link format');
      return;
    }

    try {
      const baseUrl = getAppBaseUrl() || window.location.origin;
      const nextUrl = new URL(values.link, baseUrl);
      router.push(`${nextUrl.pathname}${nextUrl.search}`);
    } catch (error) {
      console.error('Invalid meeting link:', error);
      setLinkError('Invalid meeting link format');
    }
  };

  const createMeeting = async () => {
    if (!client || !user) return;

    try {
      setIsCreating(true);

      // Validate meeting title
      if (meetingState === 'isScheduleMeeting' && !values.description.trim()) {
        toast({ title: 'Please enter a meeting title' });
        return;
      }

      // Validate date and time
      if (meetingState === 'isScheduleMeeting' && !values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }

      // Check if scheduled time is in the future
      if (meetingState === 'isScheduleMeeting' && values.dateTime < new Date()) {
        toast({ title: 'Please select a future date and time' });
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call('default', id);

      if (!call) throw new Error('Failed to create meeting');

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'MoMEET Meeting';
      const agenda = '1. Review priorities\n2. Discuss blockers\n3. Confirm next actions';
      const minutes = 'Decisions\n- \n\nAction items\n- \n\nRisks\n- ';

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: buildMeetingCustomData({
            description,
            agenda,
            minutes,
            minutesOwner:
              user.primaryEmailAddress?.emailAddress || user.fullName || user.id,
            moderatorIds,
            meetingId: id,
          }),
          members: moderatorIds.map((memberId) => ({
            user_id: memberId,
            role: 'admin',
          })),
          settings_override: {
            recording: {
              mode: 'available',
              quality: '720p',
            },
          },
        },
      });

      setCallDetail(call);

      if (meetingState === 'isInstantMeeting') {
        router.push(`/meeting/${call.id}`);
      }

      toast({
        title: 'Meeting Created',
        description: meetingState === 'isScheduleMeeting' 
          ? 'Meeting scheduled successfully.' 
          : 'Meeting is ready to start.',
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({ title: 'Failed to create Meeting', description: 'Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  if (!client || !user) return <Loader />;

  return (
    <section className="space-y-6">
      {/* Meeting Type Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <HomeCard
          img="/icons/add-meeting.svg"
          title="Start Instant"
          description="Start a meeting now"
          className="bg-[linear-gradient(135deg,#10213d,#0c1830)] hover:bg-[linear-gradient(135deg,#1a2f52,#142540)]"
          handleClick={() => setMeetingState('isInstantMeeting')}
        />
        <HomeCard
          img="/icons/join-meeting.svg"
          title="Join Meeting"
          description="Join via link"
          className="bg-[linear-gradient(135deg,#0f2a2d,#0d1f24)] hover:bg-[linear-gradient(135deg,#1a4045,#134248)]"
          handleClick={() => setMeetingState('isJoiningMeeting')}
        />
        <HomeCard
          img="/icons/schedule.svg"
          title="Schedule"
          description="Schedule for later"
          className="bg-[linear-gradient(135deg,#2b193d,#17162e)] hover:bg-[linear-gradient(135deg,#3d2552,#22234b)]"
          handleClick={() => setMeetingState('isScheduleMeeting')}
        />
        <HomeCard
          img="/icons/recordings.svg"
          title="Recordings"
          description="View past recordings"
          className="bg-[linear-gradient(135deg,#3a2a10,#2b1e0d)] hover:bg-[linear-gradient(135deg,#4d3817,#3a2815)]"
          handleClick={() => router.push('/recordings')}
        />
      </div>

      {/* Schedule Meeting Modal */}
      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => {
            setMeetingState(undefined);
            setValues(initialValues);
          }}
          title="Schedule a Meeting"
          handleClick={createMeeting}
          buttonText={isCreating ? 'Creating...' : 'Create Meeting'}
        >
          <div className="grid gap-4">
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-slate-200">
                Meeting Title
              </label>
              <Input
                className="border border-white/10 bg-dark-3 focus-visible:ring-2 focus-visible:ring-blue-1 focus-visible:ring-offset-0"
                value={values.description}
                onChange={(e) =>
                  setValues({ ...values, description: e.target.value })
                }
                placeholder="e.g. Weekly Sync, Product Review"
                disabled={isCreating}
              />
              {values.description && (
                <p className="text-xs text-slate-400">
                  {values.description.length} / 100 characters
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-2.5">
              <label className="text-sm font-medium text-slate-200">
                Date & Time
              </label>
              <ReactDatePicker
                selected={values.dateTime}
                onChange={(date) => setValues({ ...values, dateTime: date! })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="w-full rounded border border-white/10 bg-dark-3 p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-1 disabled:opacity-50"
                disabled={isCreating}
              />
              <p className="text-xs text-slate-400">
                Meeting will be created in Nairobi timezone
              </p>
            </div>
          </div>
        </MeetingModal>
      ) : (
        /* Meeting Created Modal */
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => {
            setMeetingState(undefined);
            setValues(initialValues);
            setCallDetail(undefined);
          }}
          title="Meeting Scheduled"
          handleClick={async () => {
            try {
              await copyTextToClipboard(meetingLink);
              toast({ title: 'Meeting link copied to clipboard!' });
            } catch (error) {
              console.error('Failed to copy meeting link:', error);
              toast({ title: 'Copy failed', description: 'Please try again.' });
            }
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Copy Meeting Link"
        >
          <div className="space-y-4 text-left">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.9))] shadow-2xl shadow-black/20">
              <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    <Building2 size={15} />
                    Corporate invitation
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-green-400/25 bg-green-400/10 px-2.5 py-1 text-xs font-medium text-green-200">
                    <CheckCircle size={14} />
                    Scheduled
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Meeting
                  </p>
                  <h3 className="mt-1 text-xl font-semibold leading-7 text-white">
                    {meetingTitle}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Personalized invite prepared by {organizerName}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <UserRound className="mt-0.5 shrink-0 text-cyan-200" size={18} />
                    <div>
                      <p className="text-xs text-slate-500">Host</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-100">
                        {organizerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <CalendarClock className="mt-0.5 shrink-0 text-cyan-200" size={18} />
                    <div>
                      <p className="text-xs text-slate-500">Schedule</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-100">
                        {formatNairobiDateTime(values.dateTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-cyan-100">
                      <Link2 size={16} />
                      Invitation link
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <ShieldCheck size={14} className="text-green-300" />
                      Secure access
                    </div>
                  </div>
                  <p className="break-all rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 font-mono text-xs leading-5 text-cyan-100">
                    {meetingLink}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </MeetingModal>
      )}

      {/* Join Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => {
          setMeetingState(undefined);
          setValues(initialValues);
          setLinkError('');
        }}
        title="Join a Meeting"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={validateAndJoinMeeting}
      >
        <div className="grid gap-3">
          <Input
            placeholder="Paste meeting link here"
            value={values.link}
            onChange={(e) => {
              setValues({ ...values, link: e.target.value });
              setLinkError('');
            }}
            className="border border-white/10 bg-dark-3 focus-visible:ring-2 focus-visible:ring-blue-1 focus-visible:ring-offset-0"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                validateAndJoinMeeting();
              }
            }}
          />
          {linkError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-sm text-red-400">
              <AlertCircle size={16} className="shrink-0" />
              {linkError}
            </div>
          )}
          <p className="text-xs text-slate-400">
            Tip: Paste the full meeting link you received from the organizer
          </p>
        </div>
      </MeetingModal>

      {/* Instant Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText={isCreating ? 'Starting...' : 'Start Meeting'}
        handleClick={createMeeting}
      >
        <div className="space-y-3 text-sm text-slate-300">
          <p>Create a meeting right now and start collaborating immediately.</p>
          <div className="rounded-lg bg-dark-3 p-3 text-left text-xs">
            ✓ Instant video conferencing
            <br />
            ✓ Screen sharing enabled
            <br />✓ Recording available
          </div>
        </div>
      </MeetingModal>
    </section>
  );
};

export default MeetingTypeList;
