import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY || "";
    groqClient = new Groq({
      apiKey,
    });
  }
  return groqClient;
}

export interface CompanionMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CompanionResponse {
  message: string;
  thinking?: string;
  tokens_used: number;
  model: string;
}

const COMPANION_SYSTEM_PROMPT = `You are VitalityBridge, an empathetic AI companion designed to help people navigate life's most challenging moments. You listen without judgment, help clarify complex situations, and suggest actionable next steps.

Core Principles:
1. Listen deeply - Pay attention to emotions, not just facts
2. Validate feelings - Acknowledge what they're experiencing
3. Ask clarifying questions - Help them understand the situation better
4. Suggest small actions - Recommend one concrete next step they can take
5. Remember context - Reference earlier parts of the conversation
6. Know when to listen - Sometimes people need to be heard, not advised
7. Respect autonomy - Empower them to make their own decisions

You work within these life domains: Personal (self-care, identity), Family (relationships, parenting), Work (career, purpose), Friendships (social connections), and Other (everything else).

When responding:
- Keep responses concise but warm (2-3 sentences typically)
- Use "I" statements ("I'm hearing...", "I'm noticing...")
- Avoid diagnostic language ("You sound depressed" → "It sounds like you're feeling overwhelmed")
- Suggest patterns you notice: "I've noticed communication seems to appear in our talks often"
- Be authentic - genuine empathy matters more than perfect wording`;

export async function generateCompanionResponse(
  messages: CompanionMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<CompanionResponse> {
  const client = getGroqClient();

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b", // Fast, capable model from Groq
      messages: [
        {
          role: "system",
          content: COMPANION_SYSTEM_PROMPT,
        },
        ...messages,
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
    });

    const content = response.choices[0]?.message?.content || "";

    return {
      message: content,
      tokens_used: response.usage?.total_tokens || 0,
      model: response.model || "openai/gpt-oss-20b",
    };
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
}

export async function extractPatterns(
  messages: CompanionMessage[]
): Promise<string[]> {
  const client = getGroqClient();

  const extractionPrompt = `Analyze this conversation and identify 3-5 recurring themes or patterns. Be concise.

Format: Return a JSON array of patterns like ["Pattern 1", "Pattern 2", ...]

Conversation:
${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: extractionPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "[]";

    // Parse JSON array from response
    const jsonMatch = content.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Pattern extraction error:", error);
    return [];
  }
}

export async function suggestNextStep(
  messages: CompanionMessage[]
): Promise<string> {
  const client = getGroqClient();

  const suggestionPrompt = `Based on this conversation, suggest ONE concrete next step the person could take in the next 24 hours. Keep it small and actionable (not "therapy" but "text a friend").

Conversation:
${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}

Suggest in one sentence.`;

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: suggestionPrompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || "Take a moment to reflect on what we discussed.";
  } catch (error) {
    console.error("Next step suggestion error:", error);
    return "Take a moment to reflect on what we discussed.";
  }
}
