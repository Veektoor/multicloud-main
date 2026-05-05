"use client";

import { ChangeEvent, useRef } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import { copyTextToClipboard } from "@/lib/browser";
import { formatNairobiDateTime } from "@/lib/datetime";
import type { MeetingDocument } from "@/lib/meeting";
import { createMinutesSheetCsv, downloadMinutesSheet } from "@/lib/minutes-sheet";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { avatarImages } from "@/constants";
import { useToast } from "./ui/use-toast";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
  agenda?: string;
  minutes?: string;
  storage?: string;
  storagePath?: string;
  moderators?: string[];
  minutesOwner?: string;
  minuteFiles?: MeetingDocument[];
  canUploadMinutes?: boolean;
  isUploadingMinutes?: boolean;
  onUploadMinutes?: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  hideCopyLink?: boolean;
  statusNote?: string;
  isProcessing?: boolean;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
  agenda,
  minutes,
  storage,
  storagePath,
  moderators,
  minutesOwner,
  minuteFiles,
  canUploadMinutes,
  isUploadingMinutes,
  onUploadMinutes,
  secondaryActionLabel,
  onSecondaryAction,
  hideCopyLink,
  statusNote,
  isProcessing,
}: MeetingCardProps) => {
  const { toast } = useToast();
  const minuteFileInputRef = useRef<HTMLInputElement>(null);

  const downloadSheet = () => {
    const csv = createMinutesSheetCsv({
      title,
      date,
      owner: minutesOwner || "Moderator",
      agenda: agenda || "",
      minutes: minutes || "",
      storage: storage || "",
      storagePath: storagePath || "",
    });

    downloadMinutesSheet(`${title.replace(/\s+/g, "-").toLowerCase()}-minutes`, csv);
    toast({ title: "Sheet downloaded" });
  };

  return (
    <section className="flex min-h-[320px] w-full flex-col justify-between rounded-[24px] border border-white/10 bg-[#0f1729] px-5 py-6 text-white shadow-[0_20px_50px_rgba(7,12,24,0.35)] xl:max-w-[640px]">
      <article className="flex flex-col gap-5">
        <Image src={icon} alt="meeting icon" width={28} height={28} />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-slate-300">{date}</p>
        </div>

        {(isPreviousMeeting || agenda || minutes || storage || minuteFiles?.length || canUploadMinutes || statusNote) && (
          <div className="grid gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            {isPreviousMeeting && (
              <div>
                <p className="text-xs text-slate-400">Meeting date</p>
                <p className="mt-2 text-white">{date}</p>
              </div>
            )}
            {statusNote && (
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <p>Status</p>
                  {isProcessing && <Loader2 className="size-3 animate-spin text-cyan-300" />}
                </div>
                <p className="mt-2 text-white">{statusNote}</p>
              </div>
            )}
            {agenda && (
              <div>
                <p className="text-xs text-slate-400">Agenda</p>
                <p className="mt-2 leading-6">{agenda}</p>
              </div>
            )}
            {minutes && (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">Minutes</p>
                  <button
                    onClick={downloadSheet}
                    className="text-xs text-white underline underline-offset-4"
                  >
                    Download sheet
                  </button>
                </div>
                <p className="mt-2 line-clamp-4 leading-6">{minutes}</p>
              </div>
            )}
            {storage && (
              <div>
                <p className="text-xs text-slate-400">Storage</p>
                <p className="mt-2 text-white">{storage}</p>
                {storagePath && (
                  <p className="mt-1 break-all text-xs text-slate-400">{storagePath}</p>
                )}
              </div>
            )}
            {!!moderators?.length && (
              <div>
                <p className="text-xs text-slate-400">Moderators</p>
                <p className="mt-2">{moderators.join(", ")}</p>
              </div>
            )}
            {!!minuteFiles?.length && (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">Minute files</p>
                  {canUploadMinutes && onUploadMinutes && (
                    <>
                      <input
                        ref={minuteFileInputRef}
                        type="file"
                        className="hidden"
                        onChange={onUploadMinutes}
                      />
                      <button
                        onClick={() => minuteFileInputRef.current?.click()}
                        disabled={isUploadingMinutes}
                        className="text-xs text-white underline underline-offset-4 disabled:cursor-not-allowed disabled:text-slate-500"
                      >
                        {isUploadingMinutes ? "Uploading..." : "Upload"}
                      </button>
                    </>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  {minuteFiles.map((file, index) => (
                    <a
                      key={`${file.name}-${index}`}
                      href={file.dataUrl}
                      download={file.name}
                      className="block rounded-lg border border-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/5"
                    >
                      <p>{file.name}</p>
                      <p className="mt-1 text-slate-400">
                        {file.meetingDate || formatNairobiDateTime(file.uploadedAt)}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {file.uploadedBy} · {formatNairobiDateTime(file.uploadedAt)}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {canUploadMinutes && onUploadMinutes && !minuteFiles?.length && (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">Minute files</p>
                  <>
                    <input
                      ref={minuteFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={onUploadMinutes}
                    />
                    <button
                      onClick={() => minuteFileInputRef.current?.click()}
                      disabled={isUploadingMinutes}
                      className="text-xs text-white underline underline-offset-4 disabled:cursor-not-allowed disabled:text-slate-500"
                    >
                      {isUploadingMinutes ? "Uploading..." : "Upload"}
                    </button>
                  </>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Add minutes after the meeting so they stay available for later reference.
                </p>
              </div>
            )}
          </div>
        )}
      </article>

      <article className={cn("relative flex justify-center")}>
        <div className="relative flex w-full max-sm:hidden">
          {avatarImages.map((img, index) => (
            <Image
              key={index}
              src={img}
              alt="attendees"
              width={40}
              height={40}
              className={cn("rounded-full", { absolute: index > 0 })}
              style={{ top: 0, left: index * 28 }}
            />
          ))}
          <div className="flex-center absolute left-[136px] size-10 rounded-full border-[5px] border-dark-3 bg-dark-4">
            +5
          </div>
        </div>
        {!isPreviousMeeting && (
          <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
            <Button
              onClick={handleClick}
              className="rounded-full bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
            >
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="feature" width={20} height={20} />
              )}
              &nbsp; {buttonText}
            </Button>
            {onSecondaryAction ? (
              <Button
                onClick={onSecondaryAction}
                className="rounded-full border border-white/10 bg-dark-4 px-6 hover:bg-white/10"
              >
                <Image src="/icons/share.svg" alt="feature" width={20} height={20} />
                &nbsp; {secondaryActionLabel || "Download"}
              </Button>
            ) : !hideCopyLink ? (
              <Button
                onClick={async () => {
                  try {
                    await copyTextToClipboard(link);
                    toast({
                      title: "Link copied",
                    });
                  } catch (error) {
                    console.error("Failed to copy link:", error);
                    toast({
                      title: "Copy failed",
                    });
                  }
                }}
                className="rounded-full border border-white/10 bg-dark-4 px-6 hover:bg-white/10"
              >
                <Image
                  src="/icons/copy.svg"
                  alt="feature"
                  width={20}
                  height={20}
                />
                &nbsp; Copy Link
              </Button>
            ) : null}
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;

