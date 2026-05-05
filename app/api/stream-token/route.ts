import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createStreamToken } from "@/lib/stream-token";

export async function POST() {
  const user = await currentUser();
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const apiSecret = process.env.STREAM_SECRET_KEY;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Stream credentials are missing" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    apiKey,
    token: createStreamToken(user.id, apiSecret),
    user: {
      id: user.id,
      name: user.fullName || user.username || user.firstName || "Workspace member",
      image: user.imageUrl,
    },
  });
}
