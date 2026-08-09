"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MiniRobot } from "@/components/robot/mini-robot";

type Turn = { role: "user" | "other"; content: string; errorDetail?: string };

// No real auth system yet — matches the name already used elsewhere
// (e.g. the dashboard's "Good evening, George").
const USER_FIRST_NAME = "George";

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const situationParam = searchParams.get("situation");

  const [situation, setSituation] = useState(
    situationParam || "Telling my manager I'm overloaded and need to talk about my workload."
  );
  const [situationLocked, setSituationLocked] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const startPractice = () => {
    if (!situation.trim()) return;
    setSituationLocked(true);
    setTurns([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Short, spoken reaction from the robot — kept brief on purpose ("short
  // interaction"), not a full narration of the reply.
  const speakBriefly = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!voicesRef.current.length) {
      voicesRef.current = window.speechSynthesis.getVoices();
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    const preferred = voicesRef.current.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  const send = async () => {
    // Guards against double-submission — pressing Enter rapidly (or an
    // auto-repeating key on some mobile keyboards) could fire send()
    // again before `thinking` had re-rendered, producing duplicate user
    // turns with an empty reply sitting between them.
    if (thinking) return;

    const text = input.trim();
    if (!text) return;

    const nextTurns: Turn[] = [...turns, { role: "user", content: text }];
    setTurns(nextTurns);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/agent/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, history: nextTurns, message: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `practice route returned ${res.status}`);
      }
      setTurns((prev) => [...prev, { role: "other", content: data.reply }]);
      speakBriefly(data.reply);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error("[practice] request failed:", detail);
      setTurns((prev) => [
        ...prev,
        {
          role: "other",
          content: "(trouble connecting right now — give it another try in a moment)",
          errorDetail: detail,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-medium text-[#191735]">
          Practice
        </h1>
        <button
          onClick={() => router.push("/app")}
          className="text-sm font-medium text-[#6845d8]"
        >
          ← Back to home
        </button>
      </div>
      <p className="mt-2 text-base text-[#706a7e]">
        Rehearse a hard conversation with Bridge playing the other person,
        before you have it for real.
      </p>

      {!situationLocked ? (
        <div className="mt-8 rounded-[28px] border border-[#ebe5ef] bg-white p-8">
          <div className="flex justify-center">
            <MiniRobot state="idle" size="lg" showExpression />
          </div>
          <p className="mt-6 text-center font-serif text-xl text-[#403b52]">
            What conversation do you want to rehearse?
          </p>
          <div className="mx-auto mt-6 max-w-lg space-y-3">
            <input
              type="text"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startPractice()}
              placeholder="e.g. Asking my partner to split chores more evenly"
              className="w-full rounded-full border border-[#ddd5e8] bg-[#f8f6fb] px-5 py-3 text-base focus:outline-none focus:border-[#6d5ef8]"
            />
            <button
              onClick={startPractice}
              disabled={!situation.trim()}
              className="w-full rounded-full bg-[#6845d8] py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              Start practicing →
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-[28px] border border-[#ebe5ef] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#ebe5ef] pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#9a91a3]">
                Rehearsing
              </p>
              <p className="font-medium text-[#302842]">{situation}</p>
            </div>
            <button
              onClick={() => {
                setSituationLocked(false);
                setTurns([]);
              }}
              className="text-sm font-medium text-[#6845d8]"
            >
              Change scenario
            </button>
          </div>

          <div className="mt-5 flex flex-col items-center gap-2">
            <MiniRobot
              state={thinking ? "thinking" : "idle"}
              size="md"
              showExpression
            />
            <p className="text-xs font-medium text-[#9a91a3]">
              {thinking ? "Thinking…" : "Ready"}
            </p>
          </div>

          <div className="mt-5 max-h-96 space-y-3 overflow-y-auto">
            {turns.length === 0 && (
              <p className="text-center text-sm text-[#9a91a3]">
                Say your opening line — Bridge will respond as the other person.
              </p>
            )}
            {turns.map((t, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${t.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {t.role === "other" && (
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6d5ef8] to-[#52d6d3] text-sm">
                    🤖
                  </span>
                )}
                <div
                  className={`max-w-sm rounded-2xl px-4 py-3 text-sm ${
                    t.role === "user"
                      ? "bg-[#6845d8] text-white"
                      : "bg-[#f6efff] text-[#403b52]"
                  }`}
                >
                  <p className="mb-1 text-xs opacity-70">
                    {t.role === "user" ? USER_FIRST_NAME : "Bridge"}
                  </p>
                  {t.content}
                  {t.errorDetail && (
                    <p className="mt-1 text-xs text-[#c0526b]">⚠ {t.errorDetail}</p>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6d5ef8] to-[#52d6d3] text-sm">
                  🤖
                </span>
                <p className="text-xs text-[#9a91a3]">thinking…</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={thinking}
              placeholder="Say your line..."
              className="flex-1 rounded-full border border-[#ddd5e8] bg-[#f8f6fb] px-5 py-3 text-base focus:outline-none focus:border-[#6d5ef8] disabled:opacity-60"
            />
            <button
              onClick={send}
              disabled={!input.trim() || thinking}
              className="rounded-full bg-[#6845d8] px-6 py-3 font-medium text-white transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <Link
        href="/app/conversation"
        className="mt-6 inline-flex text-sm font-medium text-[#6845d8]"
      >
        ← Talk to Bridge instead
      </Link>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeContent />
    </Suspense>
  );
}
