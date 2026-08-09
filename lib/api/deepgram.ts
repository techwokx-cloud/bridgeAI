/**
 * Deepgram — second fallback STT provider.
 * Docs: https://developers.deepgram.com/reference/speech-to-text-api/listen
 *
 * Single-request REST transcription — no upload/poll cycle needed, which
 * makes it a good last-resort fallback: fastest failure-to-answer path if
 * both AssemblyAI and Speechmatics are unavailable.
 */

const DEEPGRAM_URL =
  "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&language=en";

export async function transcribeAudioDeepgram(audioBuffer: Buffer): Promise<string> {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) {
    throw new Error("DEEPGRAM_API_KEY is not set — see .env.example.");
  }

  const res = await fetch(DEEPGRAM_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${key}`,
      "Content-Type": "audio/webm",
    },
    body: new Uint8Array(audioBuffer),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Deepgram request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const transcript =
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
  return transcript.trim();
}
