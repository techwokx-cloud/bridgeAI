/**
 * AssemblyAI — production speech-to-text.
 *
 * Flow: upload raw audio bytes → get an upload_url → request a transcript
 * for that URL → poll until it completes. This replaces the browser's
 * built-in SpeechRecognition as the primary voice input path — the
 * built-in API is unsupported in Firefox entirely and unreliable on many
 * Android browsers (its `onend` event doesn't always fire, which was
 * causing the mic to get stuck showing "Listening..." indefinitely).
 * MediaRecorder + a server-side transcript call is far more consistent
 * across devices.
 *
 * Docs: https://www.assemblyai.com/docs
 */

const ASSEMBLYAI_BASE = "https://api.assemblyai.com/v2";

function assemblyHeaders() {
  const key = process.env.ASSEMBLYAI_API_KEY;
  if (!key) {
    throw new Error("ASSEMBLYAI_API_KEY is not set — see .env.example.");
  }
  return { authorization: key };
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  // 1. Upload the raw audio bytes
  const uploadRes = await fetch(`${ASSEMBLYAI_BASE}/upload`, {
    method: "POST",
    headers: {
      ...assemblyHeaders(),
      "content-type": "application/octet-stream",
    },
    body: new Uint8Array(audioBuffer),
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.text();
    throw new Error(`AssemblyAI upload failed (${uploadRes.status}): ${body}`);
  }
  const { upload_url } = await uploadRes.json();

  // 2. Request a transcript for that uploaded file
  const transcriptRes = await fetch(`${ASSEMBLYAI_BASE}/transcript`, {
    method: "POST",
    headers: {
      ...assemblyHeaders(),
      "content-type": "application/json",
    },
    body: JSON.stringify({ audio_url: upload_url }),
  });

  if (!transcriptRes.ok) {
    const body = await transcriptRes.text();
    throw new Error(`AssemblyAI transcript request failed (${transcriptRes.status}): ${body}`);
  }
  const { id } = await transcriptRes.json();

  // 3. Poll until the transcript is ready — short clips typically finish
  // in a few seconds; capped at ~30s so a hung request fails loudly
  // rather than hanging the API route indefinitely.
  const pollUrl = `${ASSEMBLYAI_BASE}/transcript/${id}`;
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pollRes = await fetch(pollUrl, { headers: assemblyHeaders() });
    if (!pollRes.ok) {
      throw new Error(`AssemblyAI poll failed (${pollRes.status})`);
    }
    const data = await pollRes.json();

    if (data.status === "completed") {
      return data.text || "";
    }
    if (data.status === "error") {
      throw new Error(`AssemblyAI transcription error: ${data.error}`);
    }
    // status is "queued" or "processing" — keep polling
  }

  throw new Error("AssemblyAI transcription timed out after ~30s");
}
