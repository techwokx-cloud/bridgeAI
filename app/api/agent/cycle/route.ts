import { NextRequest, NextResponse } from "next/server";
import { runAutonomyCycle, observeAndScore } from "@/lib/agent/autonomy";

/**
 * Runs one autonomy cycle for a single user: observe open loops, score
 * them, and initiate if something crosses the threshold.
 *
 * Intended to be called on a schedule (Render/Vercel cron, or an external
 * scheduler) once per active user — not on every page load. Protect with
 * CRON_SECRET in production.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { userId, userName } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const result = await runAutonomyCycle(userId, userName || "there");
    return NextResponse.json(result);
  } catch (error) {
    console.error("[agent/cycle] error:", error);
    return NextResponse.json({ error: "Autonomy cycle failed" }, { status: 500 });
  }
}

/**
 * GET is provided for manual/demo triggering during judging or the Live
 * Steer round — returns the scored decisions without sending anything,
 * useful for showing judges the reasoning transparently.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
  }

  const decisions = await observeAndScore(userId);
  return NextResponse.json({ decisions });
}
