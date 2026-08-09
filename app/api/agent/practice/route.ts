import { NextRequest, NextResponse } from "next/server";
import { runPracticeTurn } from "@/lib/agent/agent";

export async function POST(req: NextRequest) {
  try {
    const { situation, history, message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const result = await runPracticeTurn({
      situation: situation || "a hard conversation",
      history: history || [],
      message,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[agent/practice] error:", error);
    const message = error instanceof Error ? error.message : "Practice turn failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
