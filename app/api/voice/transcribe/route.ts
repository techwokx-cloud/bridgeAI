import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/api/assemblyai";
import { transcribeAudioSpeechmatics } from "@/lib/api/speechmatics";
import { transcribeAudioDeepgram } from "@/lib/api/deepgram";

// Polling AssemblyAI/Speechmatics can take several seconds for even short
// clips — give this route room to actually finish rather than timing out.
export const maxDuration = 60;

/**
 * STT provider fallback chain: AssemblyAI → Speechmatics → Deepgram.
 * Each provider is tried in order; a provider is skipped (not treated as
 * a hard failure) if its API key isn't configured, so this works whether
 * one, two, or all three keys are set. Only fails the request if every
 * configured provider fails.
 */
async function transcribeWithFallback(buffer: Buffer): Promise<{ text: string; provider: string }> {
  const attempts: Array<{ name: string; keyEnv: string; run: () => Promise<string> }> = [
    { name: "assemblyai", keyEnv: "ASSEMBLYAI_API_KEY", run: () => transcribeAudio(buffer) },
    { name: "speechmatics", keyEnv: "SPEECHMATICS_API_KEY", run: () => transcribeAudioSpeechmatics(buffer) },
    { name: "deepgram", keyEnv: "DEEPGRAM_API_KEY", run: () => transcribeAudioDeepgram(buffer) },
  ];

  const errors: string[] = [];

  for (const attempt of attempts) {
    if (!process.env[attempt.keyEnv]) {
      continue; // not configured — skip silently, not an error
    }
    try {
      const text = await attempt.run();
      return { text, provider: attempt.name };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[voice/transcribe] ${attempt.name} failed:`, message);
      errors.push(`${attempt.name}: ${message}`);
    }
  }

  if (errors.length === 0) {
    throw new Error(
      "No STT provider is configured — set ASSEMBLYAI_API_KEY, SPEECHMATICS_API_KEY, or DEEPGRAM_API_KEY."
    );
  }
  throw new Error(`All STT providers failed — ${errors.join(" | ")}`);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: "audio file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const { text, provider } = await transcribeWithFallback(buffer);

    return NextResponse.json({ text, provider });
  } catch (error) {
    console.error("[voice/transcribe] error:", error);
    const message = error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
