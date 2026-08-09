/**
 * Speechmatics — fallback STT provider.
 * Docs: https://docs.speechmatics.com/
 *
 * Batch transcription flow: submit a job with the audio file, poll until
 * done, fetch the transcript.
 */

const SPEECHMATICS_BASE = "https://asr.api.speechmatics.com/v2";

function speechmaticsHeaders() {
  const key = process.env.SPEECHMATICS_API_KEY;
  if (!key) {
    throw new Error("SPEECHMATICS_API_KEY is not set — see .env.example.");
  }
  return { Authorization: `Bearer ${key}` };
}

export async function transcribeAudioSpeechmatics(
  audioBuffer: Buffer,
  filename = "recording.webm"
): Promise<string> {
  const config = {
    type: "transcription",
    transcription_config: { language: "en", operating_point: "enhanced" },
  };

  const formData = new FormData();
  formData.append("config", JSON.stringify(config));
  formData.append(
    "data_file",
    new Blob([new Uint8Array(audioBuffer)]),
    filename
  );

  const submitRes = await fetch(`${SPEECHMATICS_BASE}/jobs`, {
    method: "POST",
    headers: speechmaticsHeaders(),
    body: formData,
  });

  if (!submitRes.ok) {
    const body = await submitRes.text();
    throw new Error(`Speechmatics job submit failed (${submitRes.status}): ${body}`);
  }
  const { id } = await submitRes.json();

  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const statusRes = await fetch(`${SPEECHMATICS_BASE}/jobs/${id}`, {
      headers: speechmaticsHeaders(),
    });
    if (!statusRes.ok) throw new Error(`Speechmatics status check failed (${statusRes.status})`);
    const statusData = await statusRes.json();
    const status = statusData.job?.status;

    if (status === "done") {
      const transcriptRes = await fetch(
        `${SPEECHMATICS_BASE}/jobs/${id}/transcript?format=txt`,
        { headers: speechmaticsHeaders() }
      );
      if (!transcriptRes.ok) {
        throw new Error(`Speechmatics transcript fetch failed (${transcriptRes.status})`);
      }
      return (await transcriptRes.text()).trim();
    }
    if (status === "rejected") {
      throw new Error(`Speechmatics job rejected: ${JSON.stringify(statusData)}`);
    }
  }

  throw new Error("Speechmatics transcription timed out after ~30s");
}
