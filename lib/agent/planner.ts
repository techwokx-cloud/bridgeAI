/**
 * Planner
 *
 * Turns a goal + conversation history into one small, concrete next action.
 * Deliberately narrow scope: one action, not a multi-step plan — small
 * steps are what actually get taken.
 */

import { routeToModel } from "./router";
import { buildPlannerPrompt } from "./prompts";

export async function planNextStep(
  goal: string,
  history: string
): Promise<string> {
  const prompt = buildPlannerPrompt({ goal, history });
  const result = await routeToModel("fast", prompt, { maxTokens: 100 });
  return result.text.trim();
}
