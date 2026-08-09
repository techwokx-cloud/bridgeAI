"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MiniRobot } from "@/components/robot/mini-robot";

type CompanionState = "idle" | "listening" | "thinking" | "speaking";
type ChatMessage = {
  role: "user" | "companion";
  content: string;
  ts: number;
  /** Only set when this message is a fallback shown after a real backend
   * failure — displayed in small print so a failure can be diagnosed from
   * a screenshot alone, without needing devtools access. */
  errorDetail?: string;
};

const domainLabels: Record<string, string> = {
  personal: "Personal",
  family: "Family & parenting",
  work: "Work",
  friendships: "Friendships",
  other: "Whatever's on your mind",
};

// Used only when the real backend call fails (network hiccup, cold start,
// misconfigured env var, etc.) — reflects back what was said instead of
// showing the same flat apology on every retry, so a transient failure
// during a live demo doesn't read as "the app is broken."
const FALLBACK_TEMPLATES = [
  (text: string) => `I heard "${text}" — I'm having trouble reaching my full memory right now, but keep going, I'm still listening.`,
  (text: string) => `That matters — I just can't pull up everything I know about it this second. Tell me more anyway?`,
  (text: string) => `I'm here, just a little slow to respond right now. What happened after that?`,
];

function buildFallbackReply(userText: string): string {
  const template = FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)];
  return template(userText);
}

function ConversationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const domain = searchParams.get("domain") || "personal";
  const topicParam = searchParams.get("topic");

  const [topicOverride, setTopicOverride] = useState<string | null>(topicParam);
  const [editingTopic, setEditingTopic] = useState(false);
  const [topicDraft, setTopicDraft] = useState("");
  const topicLabel = topicOverride || domainLabels[domain] || "Your conversation";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "companion",
      content: "What's on your mind today?",
      ts: Date.now(),
    },
  ]);

  const [companionState, setCompanionState] = useState<CompanionState>("idle");
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [ttsUnlocked, setTtsUnlocked] = useState(false);
  const [mood, setMood] = useState(1);
  const [sitting, setSitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const topicInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const moods = ["😢", "😐", "🙂", "😊", "🤗"];

  const lastCompanionMessage = [...messages].reverse().find((m) => m.role === "companion");
  const priorMessages = messages.filter((m) => m !== lastCompanionMessage);

  const handleSendRef = useRef<() => void>(() => {});

  // ---- Mic availability check (MediaRecorder + getUserMedia) ----
  useEffect(() => {
    const hasMediaRecorder =
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined";
    setVoiceSupported(hasMediaRecorder);
  }, []);

  // ---- Load speech-synthesis voices ahead of time. Many browsers return
  // an empty voice list until 'voiceschanged' fires once, and calling
  // speak() before that can silently produce no sound. ----
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const startRecording = async () => {
    setVoiceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (audioBlob.size < 500) {
          // Effectively empty recording (tapped stop immediately) — skip the round trip.
          setCompanionState("idle");
          return;
        }

        setIsTranscribing(true);
        setCompanionState("thinking");

        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          const res = await fetch("/api/voice/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || `transcribe returned ${res.status}`);

          const text = (data.text || "").trim();
          setIsTranscribing(false);

          if (text) {
            setInputValue(text);
            // Auto-send once transcribed — matches voice-assistant expectations.
            setTimeout(() => handleSendRef.current(), 50);
          } else {
            setVoiceError("Didn't catch that — try again, or type instead.");
            setCompanionState("idle");
          }
        } catch (err) {
          console.error("[conversation] transcription failed:", err);
          setIsTranscribing(false);
          setVoiceError(
            err instanceof Error ? err.message : "Transcription failed — try typing instead."
          );
          setCompanionState("idle");
        }
      };

      mediaRecorderRef.current = recorder;

      // Critical ordering: speak the "I'm listening" cue and wait for it to
      // fully finish (via onDone) before starting the recorder. Starting
      // the mic first and speaking at the same time meant the microphone
      // picked up Bridge's own voice through the speaker and transcribed
      // it as if the user had said it — every recording was starting with
      // a phantom "I'm listening." because of this overlap.
      //
      // Safety net: on some devices speechSynthesis silently never fires
      // onend/onerror (no TTS voices installed, WebView quirks, etc.),
      // which would otherwise leave recording permanently blocked waiting
      // for a callback that's never coming. A one-shot timeout guarantees
      // recording starts regardless, even if the cue never actually plays.
      setCompanionState("listening");
      let started = false;
      const startOnce = () => {
        if (started) return;
        started = true;
        recorder.start();
        setIsRecording(true);
      };
      speak("I'm listening.", true, startOnce);
      setTimeout(startOnce, 2500);
    } catch (err) {
      console.error("[conversation] mic access failed:", err);
      setVoiceError("Couldn't access your microphone — check permissions, or type instead.");
      setVoiceSupported(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ---- Speaking replies aloud (Web Speech Synthesis — works today) ----
  // `force` bypasses the speakReplies toggle for system cues (like the
  // "I'm listening" confirmation chirp) that should always be audible,
  // separate from whether the user wants full replies read aloud.
  //
  // Two known browser gotchas this works around:
  // 1. Some browsers return no usable voice until one has loaded — an
  //    explicit voice (falling back to whatever's default) avoids a
  //    silent utterance on first use.
  // 2. Mobile Safari in particular can drop the "user activation" that
  //    authorizes audio once an `await` has happened — calling speak()
  //    after `await fetch(...)` (i.e. for the companion's actual reply)
  //    can silently do nothing. Speaking the very first "I'm listening"
  //    cue synchronously from the tap that starts recording establishes
  //    activation for the rest of the session in browsers that need it.
  const speak = (text: string, force = false, onDone?: () => void) => {
    if ((!speakReplies && !force) || typeof window === "undefined" || !window.speechSynthesis) {
      onDone?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith("en")) || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      setCompanionState("speaking");
      setTtsUnlocked(true);
    };
    utterance.onend = () => {
      setCompanionState("idle");
      onDone?.();
    };
    utterance.onerror = (e) => {
      console.error("[conversation] speech synthesis error:", e);
      setCompanionState("idle");
      onDone?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    // Same double-submission guard as practice mode — prevents a rapid
    // double-Enter or the voice auto-send racing a manual send from
    // producing duplicate user turns.
    if (companionState === "thinking") return;

    const text = inputValue.trim();
    if (!text) return;

    const userMsg: ChatMessage = { role: "user", content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setCompanionState("thinking");

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          message: text,
          domain,
          conversationId: `conv-${domain}`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `agent/chat returned ${res.status}`);
      }
      const reply: string = data.reply || "I hear you. Tell me more.";

      setMessages((prev) => [...prev, { role: "companion", content: reply, ts: Date.now() }]);
      setCompanionState("idle");
      speak(reply);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error("[conversation] agent/chat failed:", detail);
      const fallback = buildFallbackReply(text);
      setMessages((prev) => [
        ...prev,
        { role: "companion", content: fallback, ts: Date.now(), errorDetail: detail },
      ]);
      setCompanionState("idle");
    }
  };

  handleSendRef.current = handleSendMessage;

  const startEditingTopic = () => {
    setTopicDraft(topicLabel);
    setEditingTopic(true);
    setTimeout(() => topicInputRef.current?.focus(), 0);
  };

  const saveTopic = () => {
    if (topicDraft.trim()) {
      setTopicOverride(topicDraft.trim());
    }
    setEditingTopic(false);
  };

  return (
    <div className="flex min-h-full bg-[#fbf9fc]">
      {/* MAIN CONVERSATION */}
      <div className="flex-1 border-r border-[#e8e1ed] px-8 py-6">
        {/* TOPIC HEADER */}
        <div className="mb-6 border-b border-[#e8e1ed] pb-4">
          {editingTopic ? (
            <div className="flex items-center gap-3">
              <input
                ref={topicInputRef}
                type="text"
                value={topicDraft}
                onChange={(e) => setTopicDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTopic();
                  if (e.key === "Escape") setEditingTopic(false);
                }}
                placeholder="What do you want to talk about?"
                className="flex-1 rounded-full border border-[#ddd5e8] bg-white px-5 py-2 text-lg focus:outline-none focus:border-[#6d5ef8]"
              />
              <button
                onClick={saveTopic}
                className="rounded-full bg-[#6d5ef8] px-5 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
              <button
                onClick={() => setEditingTopic(false)}
                className="text-sm text-[#9a91a3]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#7d748e]">
                  Talking about
                </p>
                <h1 className="text-2xl font-medium text-[#302842]">
                  {topicLabel}
                </h1>
              </div>
              <button
                onClick={startEditingTopic}
                className="text-base font-medium text-[#6d5ef8]"
              >
                Change topic ✎
              </button>
            </div>
          )}
        </div>

        {/* ROBOT + REFLECTION */}
        <div className="mb-8 flex gap-8">
          {/* ROBOT */}
          <div className="flex flex-shrink-0 flex-col items-center">
            <MiniRobot state={companionState} size="lg" showExpression={true} />
            <p className="mt-3 text-sm font-medium text-[#7d748e]">
              {companionState === "listening" && "Listening..."}
              {companionState === "thinking" && "Thinking..."}
              {companionState === "speaking" && "Speaking..."}
              {companionState === "idle" && "Ready"}
            </p>
            <button
              onClick={() => setSpeakReplies((s) => !s)}
              className={`mt-2 text-xs font-medium ${speakReplies ? "text-[#6d5ef8]" : "text-[#9a91a3]"}`}
              title="Toggle whether Bridge speaks its replies aloud"
            >
              {speakReplies ? "🔊 Voice on" : "🔇 Voice off"}
            </button>
          </div>

          {/* REFLECTION BOX */}
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#e8a2c1] via-[#b58ad4] to-[#7760bb] p-8 text-white">
            <p className="text-xs opacity-80">Bridge • just now</p>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight">
              {lastCompanionMessage?.content}
            </h2>
            {lastCompanionMessage?.errorDetail && (
              <p className="mt-4 rounded-lg bg-black/20 px-3 py-2 text-xs text-white/80">
                ⚠ Backend error (for debugging): {lastCompanionMessage.errorDetail}
              </p>
            )}
          </div>
        </div>

        {/* PRIOR MESSAGES */}
        {priorMessages.length > 0 && (
          <div className="mb-8 space-y-3">
            {priorMessages.map((m) => (
              <div
                key={m.ts}
                className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  m.role === "user"
                    ? "bg-[#faf7fc] border-[#eee7f1]"
                    : "bg-white border-[#e8e1ed]"
                }`}
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm text-white ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-[#e8a2c1] to-[#b58ad4]"
                      : "bg-gradient-to-br from-[#6d5ef8] to-[#52d6d3]"
                  }`}
                >
                  {m.role === "user" ? "◡" : "◈"}
                </div>
                <div>
                  <p className="text-sm text-[#554d67]">&ldquo;{m.content}&rdquo;</p>
                  <p className="mt-1 text-xs text-[#7d748e]">
                    {m.role === "user" ? "You" : "Bridge"} • a moment ago
                  </p>
                  {m.errorDetail && (
                    <p className="mt-1 text-xs text-[#c0526b]">⚠ {m.errorDetail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div className="mb-8 grid grid-cols-4 gap-3">
          <button
            onClick={() => inputRef.current?.focus()}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#e8e1ed] bg-white p-4 text-center text-sm font-medium text-[#544a66] transition hover:bg-[#fbf8fe]"
          >
            <span className="text-xl">✏️</span>
            Put it in words
          </button>
          <button
            onClick={() => setSitting((s) => !s)}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center text-sm font-medium transition ${
              sitting
                ? "border-[#6d5ef8] bg-[#f5f2fe] text-[#6d5ef8]"
                : "border-[#e8e1ed] bg-white text-[#544a66] hover:bg-[#fbf8fe]"
            }`}
          >
            <span className="text-xl">🌱</span>
            Sit with it
          </button>
          <button
            onClick={() => router.push("/app/practice")}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#e8e1ed] bg-white p-4 text-center text-sm font-medium text-[#544a66] transition hover:bg-[#fbf8fe]"
          >
            <span className="text-xl">🎯</span>
            Practice it
          </button>
          <button
            onClick={startEditingTopic}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#e8e1ed] bg-white p-4 text-center text-sm font-medium text-[#544a66] transition hover:bg-[#fbf8fe]"
          >
            <span className="text-xl">🔄</span>
            Change topic
          </button>
        </div>

        {sitting && (
          <div className="mb-8 rounded-2xl border border-[#e8e1ed] bg-[#faf7fc] p-5 text-center">
            <p className="text-base text-[#544a66]">
              Take a breath. There&apos;s no rush to respond — I&apos;ll be here when you&apos;re ready.
            </p>
          </div>
        )}

        {/* VOICE INPUT */}
        <div className="space-y-3">
          {voiceSupported ? (
            <button
              onClick={toggleRecording}
              disabled={isTranscribing}
              className={`w-full rounded-full py-4 font-semibold transition disabled:opacity-70 ${
                isRecording
                  ? "bg-red-500 text-white"
                  : "bg-gradient-to-r from-[#d943a1] to-[#6d5ef8] text-white"
              }`}
            >
              {isTranscribing
                ? "◌ Transcribing…"
                : isRecording
                  ? "■ Recording — tap to stop"
                  : "🎙️ Tap to speak to Bridge"}
            </button>
          ) : (
            <p className="text-center text-sm text-[#9a91a3]">
              Voice input isn&apos;t available — check microphone permissions, or type below.
            </p>
          )}
          {voiceError && (
            <p className="text-center text-sm text-[#c0526b]">{voiceError}</p>
          )}
          <button
            onClick={() => inputRef.current?.focus()}
            className="block w-full text-center text-sm text-[#9a91a3]"
          >
            or type instead
          </button>
        </div>

        {/* TEXT INPUT */}
        <div className="mt-6 flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            placeholder="Type here..."
            className="flex-1 rounded-full border border-[#ddd5e8] bg-[#f8f6fb] px-5 py-3 text-base focus:outline-none focus:border-[#6d5ef8]"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="rounded-full bg-[#6d5ef8] px-6 py-3 text-white font-medium transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {/* RIGHT CONTEXT PANEL */}
      <aside className="w-80 space-y-4 overflow-auto bg-[#fbf9fc] p-6">
        {/* COMPANION STATUS */}
        <div className="rounded-2xl bg-white border border-[#e8e1ed] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d748e]">
            Companion
          </p>
          <p className="mt-3 text-sm font-medium text-[#6d5ef8] capitalize">
            {companionState}
          </p>
          <p className="text-xs text-[#7d748e]">I&apos;m here with you.</p>
        </div>

        {/* THINGS I'M NOTICING */}
        <div className="rounded-2xl bg-white border border-[#e8e1ed] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d748e]">
            Things I&apos;m noticing
          </p>
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex gap-2">
              <span className="text-sm">💬</span>
              <p className="text-[#554d67]">Communication keeps appearing in our talks.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-sm">💰</span>
              <p className="text-[#554d67]">Money decisions feel stressful when they happen quickly.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-sm">✨</span>
              <p className="text-[#554d67]">You usually feel better after discussing things first.</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#7d748e]">
            Examples — these become real as you talk with Bridge.
          </p>
        </div>

        {/* CURRENT JOURNEY */}
        <div className="rounded-2xl bg-white border border-[#e8e1ed] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d748e]">
            Current journey
          </p>
          <h3 className="mt-3 font-medium text-[#302842]">{topicLabel}</h3>
          <p className="mt-1 text-sm text-[#7d748e]">Started yesterday</p>
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-[#302842]">Next step</p>
            <p className="text-sm text-[#7d748e]">Practice the conversation</p>
          </div>
          <button
            onClick={() => router.push("/app/practice")}
            className="mt-4 w-full rounded-full border border-[#6d5ef8] bg-white px-4 py-2 text-sm font-medium text-[#6d5ef8] transition hover:bg-[#f8f4fc]"
          >
            Continue thread →
          </button>
        </div>

        {/* MOOD SELECTOR */}
        <div className="rounded-2xl bg-white border border-[#e8e1ed] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7d748e]">
            Your mood
          </p>
          <p className="mt-2 text-sm font-medium text-[#302842]">How are you feeling?</p>
          <div className="mt-3 flex justify-between">
            {moods.map((m, i) => (
              <button
                key={i}
                onClick={() => setMood(i)}
                className={`text-2xl transition ${mood === i ? "scale-125" : ""}`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#7d748e]">You&apos;re feeling thoughtful.</p>
        </div>
      </aside>
    </div>
  );
}

export default function ConversationPage() {
  return (
    <Suspense fallback={null}>
      <ConversationContent />
    </Suspense>
  );
}
