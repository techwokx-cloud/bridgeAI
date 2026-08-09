/**
 * AI Model Router
 *
 * Groq is primary for everything. Gemini and a keyless Pollinations
 * fallback exist only as safety nets — this was reversed from an earlier
 * version that used Gemini as primary for "deep" reasoning tasks, after
 * repeated live failures: "gemini-pro" 404s for everyone (deprecated),
 * and its replacement "gemini-2.5-flash" 404s specifically for accounts
 * without grandfathered access ("no longer available to new users").
 * Groq has been reliable in practice and has a generous free tier, so it
 * now owns both "fast" and "deep" tasks; Gemini and Pollinations only run
 * if Groq itself throws.
 *
 * "offline" is reserved for a future local model (Ollama/Qwen) — not
 * wired yet, falls through to the same chain as everything else.
 */

import { generateWithGemini } from "@/lib/ai/gemini";
import { getGroqClient } from "@/lib/ai/groq";

export type TaskType = "fast" | "deep" | "offline";

export interface RouterResult {
  text: string;
  model: string;
  taskType: TaskType;
}

const GROQ_MODEL = "openai/gpt-oss-20b";

async function callGroq(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 400,
  });
  const text = response.choices[0]?.message?.content || "";
  if (!text.trim()) throw new Error("Groq returned an empty response");
  return text;
}

async function callGemini(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const text = await generateWithGemini(prompt, {
    temperature: options?.temperature ?? 0.6,
    maxTokens: options?.maxTokens ?? 500,
  });
  if (!text.trim()) throw new Error("Gemini returned an empty response");
  return text;
}

/**
 * Pollinations' legacy simple-text endpoint has historically not required
 * an API key for light use, unlike their newer OpenAI-compatible gateway
 * (gen.pollinations.ai), which does. Treated purely as a best-effort last
 * resort: if it now requires auth or is rate-limited, this just throws
 * and the caller's error message surfaces normally — nothing depends on
 * this succeeding.
 */
async function callPollinations(prompt: string): Promise<string> {
  const res = await fetch(
    `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`,
    { method: "GET" }
  );
  if (!res.ok) {
    throw new Error(`Pollinations fallback failed (${res.status})`);
  }
  const text = await res.text();
  if (!text.trim()) throw new Error("Pollinations returned an empty response");
  return text;
}

export async function routeToModel(
  taskType: TaskType,
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<RouterResult> {
  const attempts: Array<{ name: string; run: () => Promise<string> }> = [
    { name: GROQ_MODEL, run: () => callGroq(prompt, options) },
    { name: "gemini-2.5-flash", run: () => callGemini(prompt, options) },
    { name: "pollinations/openai", run: () => callPollinations(prompt) },
  ];

  const errors: string[] = [];

  for (const attempt of attempts) {
    try {
      const text = await attempt.run();
      return { text, model: attempt.name, taskType };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[router] ${attempt.name} failed:`, message);
      errors.push(`${attempt.name}: ${message}`);
    }
  }

  throw new Error(`All model providers failed — ${errors.join(" | ")}`);
}
