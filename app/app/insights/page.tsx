const patterns = [
  {
    icon: "💬",
    title: "Communication keeps appearing",
    detail: "This has come up in 4 conversations this month, mostly around your partner and your manager.",
  },
  {
    icon: "💰",
    title: "Money decisions feel stressful when rushed",
    detail: "You've mentioned feeling calmer after talking things through first, three separate times.",
  },
  {
    icon: "✨",
    title: "You feel better after discussing things first",
    detail: "A recurring thread across Personal and Work — worth naming as a pattern, not a coincidence.",
  },
];

export default function InsightsPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-[#191735]">
        Insights
      </h1>
      <p className="mt-2 text-base text-[#706a7e]">
        Patterns Bridge has noticed across your conversations. These are observations, not labels.
      </p>

      <div className="mt-5 rounded-2xl border border-[#f0d9a8] bg-[#fffaf0] p-4">
        <p className="text-sm text-[#8a6d1f]">
          <strong>Example patterns.</strong> You haven&apos;t had enough
          conversations yet for Bridge to notice anything of its own —
          these three are here to show what this page looks like once it
          does. Real patterns replace these automatically as you talk.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {patterns.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-[#ebe5ef] bg-white p-6"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <h3 className="font-medium text-[#302842]">{p.title}</h3>
                <p className="mt-1 text-base text-[#706a7e]">{p.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
