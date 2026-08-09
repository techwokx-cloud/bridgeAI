import { GoogleGenerativeAI } from "@google/generative-ai";

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return geminiClient;
}

export async function generateWithGemini(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
) {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: options?.model || "gemini-2.5-flash",
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 1024,
    },
  });

  return result.response.text();
}

export async function analyzeEmotionalContext(conversationText: string) {
  const prompt = `Analyze this conversation and provide:
1. Dominant emotion (anxiety, sadness, joy, etc.)
2. Emotional intensity (0-10 scale)
3. Triggers or patterns
4. Suggested response tone

Conversation:
${conversationText}

Respond in JSON format.`;

  const response = await generateWithGemini(prompt, {
    temperature: 0.3,
    maxTokens: 500,
  });

  try {
    return JSON.parse(response);
  } catch {
    return { error: "Failed to parse emotional analysis", raw: response };
  }
}

export async function extractInsights(messages: Array<{ role: string; content: string }>) {
  const conversationText = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

  const prompt = `Extract key insights from this conversation:
- Main concerns or themes
- Patterns emerging
- Strengths demonstrated
- Suggested next steps

Conversation:
${conversationText}

Be concise and actionable.`;

  return await generateWithGemini(prompt, {
    temperature: 0.5,
    maxTokens: 800,
  });
}

export async function generatePersonalizedAdvice(
  situation: string,
  context: string,
  emotion: string
) {
  const prompt = `Based on this situation and emotional state, provide supportive, actionable advice:

Situation: ${situation}
Emotional State: ${emotion}
Context: ${context}

Provide 2-3 concrete, small steps they can take today. Be warm and supportive.`;

  return await generateWithGemini(prompt, {
    temperature: 0.6,
    maxTokens: 600,
  });
}

export interface CompanionMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CompanionResponse {
  message: string;
  tokensUsed: number;
  model: string;
}

const COMPANION_SYSTEM_PROMPT = `You are VitalityBridge, an empathetic AI companion designed to help people navigate life's most challenging moments. You listen without judgment, help clarify complex situations, and suggest actionable next steps. Keep responses concise but warm (2-3 sentences typically).`;

/**
 * Generate a companion response given a conversation history and optional context
 */
export async function generateCompanionResponse(
  messages: CompanionMessage[],
  context?: { emotion?: string; domain?: string }
): Promise<CompanionResponse> {
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const contextNote = context
    ? `\n(Detected emotion: ${context.emotion || "unknown"}, Domain: ${context.domain || "general"})`
    : "";

  const prompt = `${COMPANION_SYSTEM_PROMPT}${contextNote}

Conversation so far:
${conversationText}

Respond as the companion, in 2-3 warm sentences.`;

  const message = await generateWithGemini(prompt, {
    temperature: 0.7,
    maxTokens: 300,
  });

  return {
    message,
    tokensUsed: Math.ceil((prompt.length + message.length) / 4),
    model: "gemini-2.5-flash",
  };
}

/**
 * Generate a response using full conversation + prior context memory
 */
export async function generateResponseWithContext(
  messages: CompanionMessage[],
  memoryContext: string
): Promise<CompanionResponse> {
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `${COMPANION_SYSTEM_PROMPT}

Relevant context from past conversations:
${memoryContext}

Conversation so far:
${conversationText}

Respond as the companion, referencing past context naturally where relevant. Keep it to 2-3 sentences.`;

  const message = await generateWithGemini(prompt, {
    temperature: 0.7,
    maxTokens: 300,
  });

  return {
    message,
    tokensUsed: Math.ceil((prompt.length + message.length) / 4),
    model: "gemini-2.5-flash",
  };
}

/**
 * Suggest one small, concrete next step based on conversation
 */
export async function suggestNextStep(
  messages: CompanionMessage[]
): Promise<string> {
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `Based on this conversation, suggest ONE concrete next step the person could take in the next 24 hours. Keep it small and actionable.

Conversation:
${conversationText}

Suggest in one sentence.`;

  try {
    return await generateWithGemini(prompt, {
      temperature: 0.5,
      maxTokens: 150,
    });
  } catch (error) {
    console.error("Next step suggestion error:", error);
    return "Take a moment to reflect on what we discussed.";
  }
}
