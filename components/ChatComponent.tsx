"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { StreamChat } from "stream-chat";
import { Channel, Chat, MessageInput, MessageList, Window } from "stream-chat-react";
import type { Channel as StreamChannel } from "stream-chat";
import { X } from "lucide-react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

if (!apiKey) {
  throw new Error("Missing NEXT_PUBLIC_STREAM_API_KEY in environment variables");
}

const chatClient = StreamChat.getInstance(apiKey);

interface ChatComponentProps {
  meetingId: string;
  onClose?: () => void;
}

const ChatComponent = ({ meetingId, onClose }: ChatComponentProps) => {
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

      try {
        const response = await fetch("/api/stream-token", { method: "POST" });
        if (!response.ok) throw new Error(`Failed to fetch token: ${response.status}`);

        const data = await response.json();

        if (!chatClient.userID) {
          await chatClient.connectUser(data.user, data.token);
        }

        const nextChannel = chatClient.channel("messaging", `meeting-${meetingId}`, {
          members: [data.user.id],
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
  }, [meetingId, user]);

  if (loading) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-dark-2 text-sm text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-400 border-t-blue-1"></div>
          Loading messages
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-dark-2 px-4 text-center text-sm text-slate-400">
        <div className="text-3xl mb-2">💬</div>
        <p>{error || "Chat is unavailable right now."}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-dark-2">
      <Chat client={chatClient} theme="messaging dark">
        <Channel channel={channel}>
          <Window>
            <div className="flex h-full flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">Messages</h3>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1 transition hover:bg-white/10"
                  >
                    <X size={18} className="text-slate-400" />
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <MessageList />
              </div>

              {/* Message Input */}
              <div className="border-t border-white/10 p-3">
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
