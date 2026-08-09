/**
 * Safety
 *
 * Two guardrails on autonomous behavior:
 * 1. Crisis signal detection — if present, the agent must NOT attempt to
 *    handle it autonomously. It defers to a direct, resource-forward
 *    response and suppresses proactive outreach until a human check-in.
 * 2. Initiation rate limiting — Bridge should never feel like a
 *    notification spammer. Hard cap on unprompted messages per user per day.
 */

import { createClient } from "@/lib/supabase/server";

const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "want to die",
  "end it all",
  "hurt myself",
  "self harm",
  "self-harm",
];

export function containsCrisisSignal(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export const CRISIS_RESPONSE = `I want to pause here. What you're describing sounds serious, and I'm not the right kind of support for this moment. If you're in immediate danger, please contact emergency services. In the US, you can call or text 988 (Suicide & Crisis Lifeline) any time. I'm still here, but please reach out to a person who can help right now.`;

const MAX_INITIATIONS_PER_DAY = 2;

export async function canInitiateToday(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("agent_initiations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  return (count ?? 0) < MAX_INITIATIONS_PER_DAY;
}

export async function recordInitiation(
  userId: string,
  reason: string
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("agent_initiations").insert({
    user_id: userId,
    reason,
  });
}
