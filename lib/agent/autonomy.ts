/**
 * Autonomy Engine
 *
 * This is what makes Bridge an agent rather than a chatbot: it can decide,
 * on its own, that something is worth raising — without the user prompting
 * it. Meant to be run on a schedule (see app/api/agent/cycle/route.ts) for
 * every active user.
 *
 * Loop: observe → think (score) → decide → initiate → record
 *
 * The initiative score is the whole point: it stops Bridge from becoming a
 * notification spammer. Only loops that cross the threshold get raised.
 */

import { getOpenLoops, getRecurringPatterns, type OpenLoop } from "./lifeMap";
import { retrieveRecentMemories } from "./memory";
import { canInitiateToday, recordInitiation } from "./safety";
import { routeToModel } from "./router";
import { buildInitiationPrompt } from "./prompts";

export interface InitiativeFactors {
  importance: number; // how much this matters (0–1), from priority + memory importance
  recency: number; // how fresh/relevant right now (0–1) — decays with age
  emotionalNeed: number; // signal that this was emotionally charged (0–1)
  goalRelevance: number; // tied to an explicit stated goal vs. incidental (0–1)
  lastContactDecay: number; // higher if it's been a while since Bridge last reached out (0–1)
}

export interface InitiativeDecision {
  loop: OpenLoop;
  score: number;
  factors: InitiativeFactors;
  shouldInitiate: boolean;
}

const INITIATIVE_THRESHOLD = 0.7;

const WEIGHTS = {
  importance: 0.25,
  recency: 0.2,
  emotionalNeed: 0.2,
  goalRelevance: 0.2,
  lastContactDecay: 0.15,
};

/**
 * Recency scoring: loops 1-3 days old are "fresh and worth raising."
 * Loops sitting untouched for weeks decay in urgency (still surfaced, but
 * lower recency score) — staleness alone isn't a reason to nag, it needs
 * to combine with importance/goal relevance too.
 */
function scoreRecency(daysSinceCreated: number): number {
  if (daysSinceCreated <= 1) return 0.5; // too soon, give it a beat
  if (daysSinceCreated <= 4) return 1.0; // sweet spot
  if (daysSinceCreated <= 10) return 0.7;
  return 0.4;
}

function scoreImportance(priority: string): number {
  if (priority === "high") return 1.0;
  if (priority === "medium") return 0.6;
  return 0.3;
}

/**
 * Computes the initiative score for a single open loop.
 * Exported standalone (not just used internally) so it's directly testable
 * and directly demoable in the Live Steer round without needing live data.
 */
export function calculateInitiativeScore(factors: InitiativeFactors): number {
  const score =
    factors.importance * WEIGHTS.importance +
    factors.recency * WEIGHTS.recency +
    factors.emotionalNeed * WEIGHTS.emotionalNeed +
    factors.goalRelevance * WEIGHTS.goalRelevance +
    factors.lastContactDecay * WEIGHTS.lastContactDecay;

  return Math.round(score * 100) / 100;
}

/**
 * OBSERVE + THINK: build a scored decision for every open loop a user has.
 */
export async function observeAndScore(
  userId: string
): Promise<InitiativeDecision[]> {
  const [loops, patterns] = await Promise.all([
    getOpenLoops(userId),
    getRecurringPatterns(userId),
  ]);

  return loops.map((loop) => {
    const isRecurringPattern = patterns.some((p) =>
      loop.text.toLowerCase().includes(p.toLowerCase())
    );

    const factors: InitiativeFactors = {
      importance: scoreImportance(loop.priority),
      recency: scoreRecency(loop.daysSinceCreated),
      emotionalNeed: isRecurringPattern ? 0.8 : 0.4,
      goalRelevance: 0.7, // open actions are, by definition, tied to a stated goal
      lastContactDecay: Math.min(loop.daysSinceCreated / 7, 1),
    };

    const score = calculateInitiativeScore(factors);

    return {
      loop,
      score,
      factors,
      shouldInitiate: score >= INITIATIVE_THRESHOLD,
    };
  });
}

/**
 * DECIDE + INITIATE: for the highest-scoring eligible loop, draft and
 * record a proactive message. Respects the daily initiation cap.
 */
export async function runAutonomyCycle(
  userId: string,
  userName: string
): Promise<{
  initiated: boolean;
  message?: string;
  decision?: InitiativeDecision;
}> {
  const decisions = await observeAndScore(userId);
  const eligible = decisions
    .filter((d) => d.shouldInitiate)
    .sort((a, b) => b.score - a.score);

  if (eligible.length === 0) {
    return { initiated: false };
  }

  const canInitiate = await canInitiateToday(userId);
  if (!canInitiate) {
    return { initiated: false };
  }

  const top = eligible[0];
  const memories = await retrieveRecentMemories(userId, 3);
  const memoryContext = memories.map((m) => m.fact).join(" / ");

  const prompt = buildInitiationPrompt({
    userName,
    openLoopSummary: `${top.loop.text}${memoryContext ? ` (context: ${memoryContext})` : ""}`,
    lastContactDaysAgo: top.loop.daysSinceCreated,
    relatedDomain: top.loop.domain,
  });

  const result = await routeToModel("deep", prompt, { maxTokens: 200 });

  await recordInitiation(userId, `open_loop:${top.loop.id}`);

  return { initiated: true, message: result.text, decision: top };
}
