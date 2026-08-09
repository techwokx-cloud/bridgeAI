/**
 * Agent Core
 *
 * The single entry point that coordinates every subsystem. Two paths:
 *
 * - runAgentTurn(): reactive — the user messaged Bridge, respond.
 * - runAutonomyCycle() (in autonomy.ts): proactive — Bridge decides to
 *   reach out first. Kept as a separate module deliberately: reactive and
 *   autonomous behavior have different safety and rate-limit rules and
 *   should not share a code path.
 *
 * Turn flow: understand → retrieve memory → check life map → determine
 * emotional context → choose model → respond → store memory → update graph.
 */

import { containsCrisisSignal, CRISIS_RESPONSE } from "./safety";
import { retrieveRecentMemories, storeMemory } from "./memory";
import { getOpenLoops } from "./lifeMap";
import { routeToModel } from "./router";
import { BRIDGE_SYSTEM_PROMPT, buildPracticePrompt } from "./prompts";
import { addConversation } from "@/lib/api/neo4j";

export interface AgentTurnInput {
  userId: string;
  message: string;
  domain: string;
  conversationId: string;
}

export interface AgentTurnResult {
  reply: string;
  model: string;
  crisisDetected: boolean;
  openLoopsReferenced: string[];
}

export async function runAgentTurn(
  input: AgentTurnInput
): Promise<AgentTurnResult> {
  // 1. Safety check first — crisis signals short-circuit everything else.
  if (containsCrisisSignal(input.message)) {
    return {
      reply: CRISIS_RESPONSE,
      model: "safety-override",
      crisisDetected: true,
      openLoopsReferenced: [],
    };
  }

  // 2. Retrieve memory + life map context.
  const [memories, openLoops] = await Promise.all([
    retrieveRecentMemories(input.userId, 5),
    getOpenLoops(input.userId),
  ]);

  const relevantLoops = openLoops.filter((l) => l.domain === input.domain);
  const memoryContext = memories.map((m) => `- ${m.fact}`).join("\n");
  const loopContext = relevantLoops.map((l) => `- ${l.text}`).join("\n");

  // 3. Build context-aware prompt and route to the "deep" model, since
  //    reasoning over memory + open loops benefits from the stronger model.
  const prompt = `${BRIDGE_SYSTEM_PROMPT}

What you remember about this person:
${memoryContext || "(nothing recorded yet)"}

Open threads in this life domain (${input.domain}):
${loopContext || "(none)"}

They just said: "${input.message}"

Respond as Bridge.`;

  const result = await routeToModel("deep", prompt, {
    temperature: 0.7,
    maxTokens: 300,
  });

  // 4. Persist: store this exchange as a memory candidate and update the graph.
  await Promise.all([
    storeMemory({
      userId: input.userId,
      content: input.message,
      domain: input.domain,
      importance: 0.5,
    }),
    addConversation(
      input.userId,
      input.conversationId,
      input.message,
      input.domain
    ).catch(() => {
      /* non-critical — graph update failures shouldn't break the reply */
    }),
  ]);

  return {
    reply: result.text,
    model: result.model,
    crisisDetected: false,
    openLoopsReferenced: relevantLoops.map((l) => l.id),
  };
}

export interface PracticeTurnInput {
  situation: string;
  history: Array<{ role: "user" | "other"; content: string }>;
  message: string;
}

/**
 * Practice mode turn — Bridge plays the OTHER PERSON in a rehearsed
 * conversation, not itself. Kept separate from runAgentTurn() since the
 * persona, safety framing, and memory-write behavior are all different:
 * practice exchanges are not stored as memories about the user's real
 * relationships, since nothing here actually happened.
 */
export async function runPracticeTurn(input: PracticeTurnInput): Promise<{ reply: string }> {
  if (containsCrisisSignal(input.message)) {
    return { reply: CRISIS_RESPONSE };
  }

  const historyText = input.history
    .map((h) => `${h.role === "user" ? "You" : "Them"}: ${h.content}`)
    .join("\n");

  const prompt = buildPracticePrompt({
    situation: input.situation,
    history: historyText,
    userMessage: input.message,
  });

  const result = await routeToModel("fast", prompt, {
    temperature: 0.8,
    maxTokens: 150,
  });

  return { reply: result.text.trim() };
}
