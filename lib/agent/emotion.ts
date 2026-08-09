/**
 * Emotion detection — GoEmotions, not a paid Google API.
 *
 * Primary: cirimus/modernbert-base-go-emotions via the Hugging Face
 * Inference API (https://huggingface.co/cirimus/modernbert-base-go-emotions)
 * — a ModernBERT model fine-tuned on the GoEmotions taxonomy (27 emotions +
 * neutral), free to call with a HF token.
 *
 * Fallback: a small keyword heuristic, so emotion tagging still works with
 * zero external calls if HUGGINGFACE_API_KEY isn't set — never blocks a
 * conversation turn on an optional signal.
 */

const HF_MODEL = "cirimus/modernbert-base-go-emotions";
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

export interface EmotionResult {
  label: string;
  score: number;
  source: "go-emotions" | "heuristic";
}

const FALLBACK_KEYWORDS: Record<string, string[]> = {
  anger: ["angry", "furious", "pissed", "mad", "frustrated"],
  sadness: ["sad", "down", "depressed", "hopeless", "lonely", "hurt"],
  fear: ["scared", "afraid", "anxious", "worried", "nervous", "terrified"],
  joy: ["happy", "excited", "great", "amazing", "relieved", "grateful"],
  love: ["love", "care about", "appreciate"],
  surprise: ["shocked", "surprised", "didn't expect", "unexpected"],
};

function heuristicEmotion(text: string): EmotionResult {
  const lower = text.toLowerCase();
  for (const [label, keywords] of Object.entries(FALLBACK_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { label, score: 0.6, source: "heuristic" };
    }
  }
  return { label: "neutral", score: 0.5, source: "heuristic" };
}

export async function detectEmotion(text: string): Promise<EmotionResult> {
  const hfToken = process.env.HUGGINGFACE_API_KEY;
  if (!hfToken) {
    return heuristicEmotion(text);
  }

  try {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!res.ok) {
      console.warn(`[emotion] GoEmotions API returned ${res.status}, using heuristic fallback`);
      return heuristicEmotion(text);
    }

    const data = await res.json();
    // HF text-classification response: [[{label, score}, ...]]
    const scores = Array.isArray(data[0]) ? data[0] : data;
    const top = scores.reduce((best: any, cur: any) => (cur.score > best.score ? cur : best));

    return { label: top.label, score: top.score, source: "go-emotions" };
  } catch (error) {
    console.warn("[emotion] GoEmotions request failed, using heuristic fallback:", error);
    return heuristicEmotion(text);
  }
}
