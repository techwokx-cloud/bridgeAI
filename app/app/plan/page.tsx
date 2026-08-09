import Link from "next/link";

const days = [
  { day: "Day 1", task: "Write down what matters most", done: true },
  { day: "Day 2", task: "Name one conversation you're avoiding", done: true },
  { day: "Day 3", task: "Practice it with Bridge", done: false },
  { day: "Day 4", task: "Have the real conversation", done: false },
  { day: "Day 5", task: "Tell Bridge what happened", done: false },
  { day: "Day 6", task: "Rest, or try a different approach", done: false },
  { day: "Day 7", task: "Reflect on the week", done: false },
];

export default function PlanPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-[#191735]">
        Your 7-Day Plan
      </h1>
      <p className="mt-2 text-base text-[#706a7e]">
        Small, realistic steps — built from what you and Bridge have talked through.
      </p>

      <div className="mt-8 space-y-3">
        {days.map((d) => (
          <div
            key={d.day}
            className={`flex items-center justify-between rounded-2xl border p-5 ${
              d.done
                ? "border-[#ddd5e8] bg-[#faf7fc]"
                : "border-[#ebe5ef] bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  d.done
                    ? "bg-[#6845d8] text-white"
                    : "bg-[#f0e9ff] text-[#6845d8]"
                }`}
              >
                {d.done ? "✓" : ""}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9a91a3]">
                  {d.day}
                </p>
                <p
                  className={`text-base ${d.done ? "text-[#a89ab3] line-through" : "text-[#403b52]"}`}
                >
                  {d.task}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/app/conversation"
        className="mt-8 inline-flex rounded-full bg-[#6845d8] px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5"
      >
        Continue the plan →
      </Link>
    </div>
  );
}
