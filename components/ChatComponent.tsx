"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { StreamChat } from "stream-chat";
import { Channel, Chat, MessageInput, MessageList, Window } from "stream-chat-react";
import type { Channel as StreamChannel } from "stream-chat";
import { MessageCircle, X } from "lucide-react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

if (!apiKey) {
  throw new Error("Missing NEXT_PUBLIC_STREAM_API_KEY in environment variables");
}

const chatClient = StreamChat.getInstance(apiKey);

interface ChatComponentProps {
  meetingId: string;
  memberIds?: string[];
  onClose?: () => void;
}

const ChatComponent = ({ meetingId, memberIds = [], onClose }: ChatComponentProps) => {
  const { user } = useUser();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !meetingId) return;

    let active = true;

    const setup = async () => {
      setLoading(true);
      setError(null);
      setChannel(null);

      try {
        const response = await fetch("/api/stream-token", { method: "POST" });
        if (!response.ok) throw new Error(`Failed to fetch token: ${response.status}`);

        const data = await response.json();

        if (chatClient.userID && chatClient.userID !== data.user.id) {
          await chatClient.disconnectUser();
        }

        if (!chatClient.userID) {
          await chatClient.connectUser(data.user, data.token);
        }

        const members = Array.from(new Set([data.user.id, ...memberIds].filter(Boolean)));
        const nextChannel = chatClient.channel("messaging", `meeting-${meetingId}`, {
          members,
          name: "Meeting chat",
        });

        await nextChannel.watch();

        if (active) setChannel(nextChannel);
      } catch (setupError) {
        console.error("Error setting up chat:", setupError);
        if (active) setError("Chat is unavailable right now.");
      } finally {
        if (active) setLoading(false);
      }
    };

    setup().catch((setupError) => {
      console.error('Error setting up chat:', setupError);
      if (active) {
        setError('Chat is unavailable right now.');
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [meetingId, memberIds, user]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-dark-2 text-sm text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="size-5 animate-spin rounded-full border-2 border-slate-400 border-t-blue-1"></div>
          Loading messages
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-dark-2 px-4 text-center text-sm text-slate-400">
        <MessageCircle className="mb-2 text-cyan-200" size={24} />
        <p>{error || "Chat is unavailable right now."}</p>
      </div>
    );
  }

  return (
    <div className="momeet-chat flex h-full min-h-[360px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-dark-2">
      <Chat client={chatClient} theme="messaging dark">
        <Channel channel={channel}>
          <Window>
            <div className="flex h-full flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <MessageCircle size={15} className="text-cyan-200" />
                  <h3 className="text-sm font-semibold text-white">Messages</h3>
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex size-7 items-center justify-center rounded-lg transition hover:bg-white/10"
                    aria-label="Close chat"
                  >
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <MessageList />
              </div>

              {/* Message Input */}
              <div className="border-t border-white/10 p-2.5">
                <MessageInput />
              </div>
            </div>
          </Window>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatComponent;
