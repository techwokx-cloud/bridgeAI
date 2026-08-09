import { NextRequest, NextResponse } from "next/server";
import { runAgentTurn } from "@/lib/agent/agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, message, domain, conversationId } = body;

    if (!userId || !message || !conversationId) {
      return NextResponse.json(
        { error: "userId, message, and conversationId are required" },
        { status: 400 }
      );
    }

    const result = await runAgentTurn({
      userId,
      message,
      domain: domain || "personal",
      conversationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[agent/chat] error:", error);
    const message = error instanceof Error ? error.message : "Agent turn failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
