"use client";

import Link from "next/link";
import { useState } from "react";
import { MiniRobot } from "@/components/robot/mini-robot";

// In production this comes from GET /api/agent/cycle?userId=... (see
// lib/agent/autonomy.ts). Shown here as the shape the UI expects so the
// dashboard renders meaningfully before that wiring is live.
const initialBridgeNotice = {
  active: true,
  headline: "I noticed something.",
  body: "You've mentioned the conversation with your partner about money three times this week, and haven't marked it done yet.",
  loopId: "partner-money-1",
  domain: "personal",
};

const watching = [
  { id: 1, icon: "🎯", label: "Workload conversation", status: "Open" },
  { id: 2, icon: "❤️", label: "Partner & money", status: "In progress" },
  { id: 3, icon: "🌱", label: "Personal goal: exercise 3×/week", status: "Improving" },
];

const domains = [
  {
    id: "personal",
    icon: "♡",
    title: "Personal",
    description: "Relationships, feelings, decisions",
    color: "bg-[#f2b7c9]",
  },
  {
    id: "family",
    icon: "⌂",
    title: "Family & Parenting",
    description: "Parenting, family matters, children",
    color: "bg-[#a6d5d2]",
  },
  {
    id: "work",
    icon: "○",
    title: "Work",
    description: "Career, boss, team & workplace",
    color: "bg-[#5eb3d6]",
  },
  {
    id: "friendships",
    icon: "◌",
    title: "Friendships",
    description: "Friends, trust, conflict",
    color: "bg-[#b9a5df]",
  },
  {
    id: "other",
    icon: "✦",
    title: "Other",
    description: "Anything else on your mind",
    color: "bg-[#f5d67a]",
  },
];

const focusTasks = [
  { id: 1, task: "Write down what matters most", time: "5 min", done: false },
  { id: 2, task: "Practice your conversation", time: "10 min", done: false },
  { id: 3, task: "Take one real step", time: "Today", done: false },
];

const journeyItems = [
  {
    id: 1,
    title: "Talking to my partner about money",
    lastUpdated: "Last updated 2 hours ago",
    type: "continue",
  },
  {
    id: 2,
    title: "Prepare for a difficult conversation",
    description: "Get ready with confidence",
    type: "suggested",
  },
];

export default function DashboardPage() {
  const [checkedTasks, setCheckedTasks] = useState<Set<number>>(new Set());
  const [bridgeNotice, setBridgeNotice] = useState(initialBridgeNotice);
  const [addingTopic, setAddingTopic] = useState(false);
  const [newTopic, setNewTopic] = useState("");

  const toggleTask = (id: number) => {
    const newChecked = new Set(checkedTasks);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedTasks(newChecked);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <p className="text-sm text-[#625d73]">
          🌙 Good evening, George
        </p>
        <h1 className="mt-1 font-serif text-3xl font-medium">
          You&apos;re not alone.
        </h1>
      </div>

      {/* BRIDGE AUTONOMY CARD */}
      {bridgeNotice.active ? (
        <div className="overflow-hidden rounded-[32px] bg-[#191533] p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-serif font-semibold tracking-wide">
                BRIDGE
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#8ee8c3]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8ee8c3]" />
                I&apos;m here
              </span>
            </div>
            <span className="text-xs text-white/50">Autonomous companion</span>
          </div>

          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex-shrink-0">
              <MiniRobot state="idle" size="lg" showExpression emotion="curious" wake={bridgeNotice.active} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="font-serif text-2xl font-medium">
                {bridgeNotice.headline}
              </p>
              <p className="mt-3 max-w-md text-base text-white/75">
                {bridgeNotice.body}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                <Link
                  href={`/app/conversation?domain=${bridgeNotice.domain}&loop=${bridgeNotice.loopId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-[#191533] transition hover:scale-105"
                >
                  Talk with me
                </Link>
                <button
                  onClick={() => setBridgeNotice((n) => ({ ...n, active: false }))}
                  className="rounded-full border border-white/25 px-6 py-3 text-base font-medium text-white/80 transition hover:bg-white/5"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#e9d5ff] via-[#d4b3ff] to-[#a78bfa] p-8 text-white">
          <h2 className="font-serif text-3xl font-semibold">
            Let&apos;s navigate this together.
          </h2>

          <p className="mt-3 max-w-md text-base text-white/90">
            Share what&apos;s on your mind, and I&apos;ll help you make sense
            of it and find your next step.
          </p>

          <Link
            href="/app/conversation"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#7c3aed] transition hover:scale-105"
          >
            💬 Start a Conversation
          </Link>
        </div>
      )}

      {/* WHAT I'M WATCHING */}
      <div className="rounded-[24px] border border-[#ebe5ef] bg-white p-6">
        <h3 className="font-semibold text-[#191735]">What I&apos;m watching</h3>
        <p className="mt-1 text-sm text-[#706a7e]">
          Threads Bridge is keeping an eye on, so you don&apos;t have to hold them alone.
        </p>
        <div className="mt-4 space-y-2">
          {watching.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between rounded-xl bg-[#faf7fc] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{w.icon}</span>
                <span className="text-sm font-medium text-[#403b52]">{w.label}</span>
              </div>
              <span className="text-xs font-medium text-[#7d748e]">{w.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* TODAY'S FOCUS */}
          <div className="rounded-[24px] border border-[#ebe5ef] bg-white p-6">
            <h3 className="font-semibold text-[#191735]">Today&apos;s Focus</h3>

            <p className="mt-1 text-sm text-[#706a7e]">
              Small steps today create a better tomorrow.
            </p>

            <div className="mt-6 space-y-3">
              {focusTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg bg-[#f6efff] p-4 transition hover:bg-[#ede4ff]"
                >
                  <input
                    type="checkbox"
                    checked={checkedTasks.has(task.id)}
                    onChange={() => toggleTask(task.id)}
                    className="h-5 w-5 rounded border-[#c8b8e0] text-[#6845d8]"
                  />

                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        checkedTasks.has(task.id)
                          ? "line-through text-[#a89ab3]"
                          : "text-[#403b52]"
                      }`}
                    >
                      {task.task}
                    </p>
                  </div>

                  <span className="text-xs text-[#9a91a3]">{task.time}</span>
                </div>
              ))}
            </div>

            <Link
              href="/app/plan"
              className="mt-4 inline-flex text-sm font-medium text-[#6845d8] transition hover:underline"
            >
              View 7-Day Plan →
            </Link>
          </div>

          {/* LIFE MAP DOMAINS */}
          <div>
            <h3 className="font-semibold text-[#191735]">
              How can I help you today?
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {domains.map((domain) => (
                <Link
                  key={domain.id}
                  href={`/app/conversation?domain=${domain.id}`}
                  className="group overflow-hidden rounded-[20px] border border-[#ebe5ef] bg-white p-6 transition hover:shadow-lg hover:shadow-purple-100"
                >
                  <div className="text-3xl">{domain.icon}</div>

                  <h4 className="mt-3 font-semibold text-[#191735]">
                    {domain.title}
                  </h4>

                  <p className="mt-1 text-sm text-[#706a7e]">
                    {domain.description}
                  </p>

                  <div className="mt-4 flex items-center text-xs font-medium text-[#6845d8] transition group-hover:translate-x-1">
                    Start talking →
                  </div>
                </Link>
              ))}

              {/* ADD A TOPIC */}
              {addingTopic ? (
                <div className="rounded-[20px] border-2 border-dashed border-[#6845d8] bg-[#faf7fc] p-6">
                  <p className="text-sm font-medium text-[#403b52]">
                    What&apos;s on your mind?
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTopic.trim()) {
                        window.location.href = `/app/conversation?domain=other&topic=${encodeURIComponent(newTopic.trim())}`;
                      }
                      if (e.key === "Escape") setAddingTopic(false);
                    }}
                    placeholder="e.g. Deciding whether to move cities"
                    className="mt-3 w-full rounded-full border border-[#ddd5e8] bg-white px-4 py-2 text-sm focus:outline-none focus:border-[#6845d8]"
                  />
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={
                        newTopic.trim()
                          ? `/app/conversation?domain=other&topic=${encodeURIComponent(newTopic.trim())}`
                          : "#"
                      }
                      className="flex-1 rounded-full bg-[#6845d8] py-2 text-center text-xs font-semibold text-white"
                    >
                      Start →
                    </Link>
                    <button
                      onClick={() => setAddingTopic(false)}
                      className="text-xs text-[#9a91a3]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTopic(true)}
                  className="flex flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-[#ddd5e8] bg-transparent p-6 text-[#9a91a3] transition hover:border-[#6845d8] hover:text-[#6845d8]"
                >
                  <span className="text-3xl">+</span>
                  <span className="text-sm font-medium">Add a topic</span>
                </button>
              )}
            </div>
          </div>

          {/* YOUR JOURNEY */}
          <div>
            <h3 className="font-semibold text-[#191735]">Your Journey</h3>

            <div className="mt-4 space-y-3">
              {journeyItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-[20px] border border-[#ebe5ef] bg-white p-4 transition hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {item.type === "continue" ? "⭐" : "💡"}
                    </span>

                    <div>
                      <p className="font-medium text-[#403b52]">
                        {item.title}
                      </p>

                      {item.type === "continue" ? (
                        <p className="text-xs text-[#9a91a3]">
                          {item.lastUpdated}
                        </p>
                      ) : (
                        <p className="text-xs text-[#9a91a3]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-lg">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* PROGRESS CARD */}
          <div className="rounded-[24px] border border-[#ebe5ef] bg-white p-6">
            <h3 className="font-semibold text-[#191735]">Your Progress</h3>

            <p className="mt-1 text-sm text-[#706a7e]">
              Conversations this week
            </p>

            <div className="mt-6 text-center">
              <div className="font-serif text-4xl font-semibold text-[#6845d8]">
                4
              </div>

              <p className="mt-2 text-xs text-[#9a91a3]">Keep the streak going</p>
            </div>

            {/* MINI CHART */}
            <div className="mt-6 flex items-end justify-between gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, i) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div
                      className="w-3 rounded-full bg-[#6845d8] transition"
                      style={{
                        height: `${[2, 3, 1, 4, 2, 0, 0][i] * 12}px`,
                      }}
                    />

                    <span className="text-[11px] text-[#9a91a3]">{day}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* INSIGHT CARD */}
          <div className="rounded-[24px] border border-[#ebe5ef] bg-gradient-to-br from-[#f6efff] to-[#ede4ff] p-6">
            <div className="text-2xl">💭</div>

            <p className="mt-4 font-serif text-lg text-[#403b52]">
              It&apos;s okay to have hard days. You&apos;re here, and that
              matters.
            </p>
          </div>

          {/* PRIVACY CARD */}
          <div className="rounded-[24px] border border-[#ebe5ef] bg-white p-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <p className="text-sm font-medium text-[#403b52]">
                Your space is private and safe
              </p>
            </div>

            <p className="mt-2 text-xs text-[#706a7e]">
              Everything you share stays between us.
            </p>

            <Link
              href="/app/privacy"
              className="mt-3 inline-flex text-xs font-medium text-[#6845d8] transition hover:underline"
            >
              Private by design →
            </Link>
          </div>

          {/* JUST TALK BUTTON */}
          <Link
            href="/app/conversation?domain=other&mode=talk"
            className="block w-full rounded-[20px] border-2 border-[#6845d8] bg-white p-4 text-center font-semibold text-[#6845d8] transition hover:bg-[#f0e9ff]"
          >
            ❤️ Just Talk
          </Link>

          <p className="text-center text-xs text-[#9a91a3]">
            Sometimes you just need someone to listen. I&apos;m here for you.
          </p>
        </div>
      </div>
    </div>
  );
}
