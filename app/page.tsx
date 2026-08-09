import Link from "next/link";
import { AnimatedRobot } from "@/components/robot/animated-robot";
import { BridgeLogotype } from "@/components/branding/logo";

const situations = [
  {
    icon: "♡",
    title: "Relationships",
    description:
      "When something between you and someone you care about feels difficult.",
  },
  {
    icon: "⌂",
    title: "Family",
    description: "Parenting, family conversations, and moments you don't know how to handle.",
  },
  {
    icon: "○",
    title: "Work",
    description: "Difficult conversations, workplace tension, decisions and uncertainty.",
  },
  {
    icon: "↔",
    title: "Difficult decisions",
    description: "When your mind is full and you need somewhere to think clearly.",
  },
  {
    icon: "◌",
    title: "Friendships",
    description: "Trust, conflict, distance and the relationships that matter.",
  },
  {
    icon: "✦",
    title: "Something else",
    description: "Sometimes you don't even know what the problem is yet.",
  },
];

const journey = [
  {
    number: "01",
    title: "Talk",
    description: "Say what's really on your mind.",
  },
  {
    number: "02",
    title: "Understand",
    description: "Make sense of the situation.",
  },
  {
    number: "03",
    title: "Act",
    description: "Choose one realistic next step.",
  },
  {
    number: "04",
    title: "What happened?",
    description: "Come back and tell us what happened.",
  },
  {
    number: "05",
    title: "Learn",
    description: "Understand what worked and what didn't.",
  },
  {
    number: "06",
    title: "Replan",
    description: "Try a different approach.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf9fc] text-[#302842]">
      {/* ================================================
          NAVIGATION
      ================================================ */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#e8e1ed] bg-[#fbf9fc]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] w-[min(1200px,calc(100%-40px))] items-center justify-between">
          <Link href="/" className="flex items-center gap-0">
            <BridgeLogotype />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#how"
              className="text-sm text-[#7d748e] transition hover:text-[#6d5ef8]"
            >
              How it works
            </a>

            <a
              href="#features"
              className="text-sm text-[#7d748e] transition hover:text-[#6d5ef8]"
            >
              Features
            </a>

            <a
              href="#privacy"
              className="text-sm text-[#7d748e] transition hover:text-[#6d5ef8]"
            >
              Privacy
            </a>

            <Link
              href="/signin"
              className="text-sm font-medium text-[#302842]"
            >
              Sign in
            </Link>

            <Link
              href="/app"
              className="rounded-full bg-gradient-to-r from-[#d943a1] to-[#6d5ef8] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              Meet Bridge
            </Link>
          </nav>

          <Link
            href="/app"
            className="rounded-full bg-gradient-to-r from-[#d943a1] to-[#6d5ef8] px-4 py-2.5 text-sm font-semibold text-white md:hidden"
          >
            Start
          </Link>
        </div>
      </header>

      {/* ================================================
          HERO
      ================================================ */}

      <section className="relative min-h-screen bg-gradient-to-br from-[#fbf9fc] via-[#f8f5fb] to-[#ede8fa] pt-[76px]">
        <div className="mx-auto grid min-h-[calc(100vh-76px)] w-[min(1200px,calc(100%-40px))] items-center gap-14 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          {/* COPY */}

          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e8e1ed] bg-white/80 px-4 py-2 text-sm text-[#6d5ef8]">
              <span className="h-2 w-2 rounded-full bg-[#52d6d3]" />
              An AI that doesn&apos;t wait for you to ask
            </div>

            <h1 className="max-w-[650px] font-serif text-5xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-[72px]">
              It remembers.
              <span className="relative mt-2 block bg-gradient-to-r from-[#d943a1] to-[#6d5ef8] bg-clip-text text-transparent">
                It notices. It reaches out.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#7d748e] sm:text-xl">
              Bridge is an autonomous AI companion. Most assistants wait for a
              prompt — Bridge observes what matters to you, decides when
              something&apos;s worth raising, and follows up on its own,
              the way a good friend would.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#d943a1] to-[#6d5ef8] px-7 py-4 font-semibold text-white shadow-xl shadow-purple-400/30 transition hover:-translate-y-1"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                  💬
                </span>

                Meet Bridge

                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href="#how"
                className="inline-flex items-center justify-center rounded-full border border-[#ddd5e8] bg-white px-7 py-4 font-semibold text-[#302842] transition hover:bg-[#f8f6fb]"
              >
                See How It Works
              </a>
            </div>

            <div className="mt-7 flex items-center gap-3 text-sm text-[#7d748e]">
              <span className="flex items-center gap-2">
                <span>✓</span>Private by design
              </span>
              <span className="h-1 w-1 rounded-full bg-[#ddd5e8]" />
              <span>Always supportive</span>
            </div>
          </div>

          {/* ROBOT VISUAL */}

          <div className="relative flex justify-center items-center">
            <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-[#52d6d3]/10 blur-3xl" />
            <div className="absolute -left-10 bottom-20 h-64 w-64 rounded-full bg-[#6d5ef8]/10 blur-3xl" />

            <AnimatedRobot />
  
          </div>
        </div>
      </section>

      {/* ================================================
          AUTONOMY PROOF — the differentiator, shown first
      ================================================ */}

      <section className="bg-[#191533] py-24 text-white">
        <div className="mx-auto w-[min(900px,calc(100%-40px))] text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#8ee8c3]">
            Watch it happen
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
            You didn&apos;t message Bridge. It messaged you.
          </h2>

          <div className="mt-12 space-y-4 text-left">
            <div className="ml-auto max-w-md rounded-2xl rounded-tr-sm bg-white/10 px-5 py-4">
              <p className="text-sm text-white/60">You, three days ago</p>
              <p className="mt-1">
                &ldquo;I need to talk to my manager about my workload.&rdquo;
              </p>
            </div>

            <p className="text-center text-xs uppercase tracking-widest text-white/40">
              You leave. No follow-up message. Days pass.
            </p>

            <div className="max-w-md rounded-2xl rounded-tl-sm bg-gradient-to-br from-[#6d5ef8] to-[#52d6d3] px-5 py-4">
              <p className="text-sm text-white/80">Bridge, unprompted</p>
              <p className="mt-1">
                &ldquo;Hey — you mentioned wanting to talk to your manager
                about your workload. You haven&apos;t checked that off yet.
                Want to prepare for it together?&rdquo;
              </p>
            </div>

            <div className="ml-auto max-w-md rounded-2xl rounded-tr-sm bg-white/10 px-5 py-4">
              <p className="text-sm text-white/60">You</p>
              <p className="mt-1">&ldquo;I tried yesterday but it didn&apos;t go well.&rdquo;</p>
            </div>

            <div className="max-w-md rounded-2xl rounded-tl-sm bg-gradient-to-br from-[#6d5ef8] to-[#52d6d3] px-5 py-4">
              <p className="text-sm text-white/80">Bridge</p>
              <p className="mt-1">
                &ldquo;Okay, let&apos;s not repeat the same approach. What
                happened?&rdquo;
              </p>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-lg text-sm text-white/50">
            Bridge only reaches out when something crosses its own initiative
            threshold — never just because a thread is open. No spam, just
            follow-through.
          </p>
        </div>
      </section>

      {/* ================================================
          HOW IT WORKS
      ================================================ */}

      <section id="how" className="bg-[#fffaf8] py-28">
        <div className="mx-auto w-[min(1000px,calc(100%-40px))]">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6845d8]">
              The journey
            </p>

            <h2 className="mt-5 font-serif text-4xl sm:text-5xl">
              Talk, understand, act, learn.
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {journey.map((step) => (
              <div key={step.number} className="flex flex-col">
                <div className="mb-4 text-4xl font-semibold text-[#6845d8]">
                  {step.number}
                </div>

                <h3 className="mb-2 font-serif text-2xl">{step.title}</h3>

                <p className="text-[#706a7e]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          SITUATIONS
      ================================================ */}

      <section id="situations" className="bg-[#f6efff] py-28">
        <div className="mx-auto w-[min(1050px,calc(100%-40px))]">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6845d8]">
              For real life
            </p>

            <h2 className="mt-5 font-serif text-4xl sm:text-5xl">
              Whatever&apos;s on your mind.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {situations.map((situation) => (
              <div
                key={situation.title}
                className="rounded-[26px] border border-white bg-white p-7"
              >
                <div className="text-4xl">{situation.icon}</div>

                <h3 className="mt-4 font-serif text-xl">{situation.title}</h3>

                <p className="mt-2 text-sm text-[#706a7e]">
                  {situation.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          PERSPECTIVE BRIDGE
      ================================================ */}

      <section className="bg-[#fffaf8] py-28">
        <div className="mx-auto w-[min(1050px,calc(100%-40px))] text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6845d8]">
            Perspective Bridge
          </p>

          <h2 className="mt-5 font-serif text-4xl sm:text-5xl">
            Understanding another perspective
            <br />
            doesn&apos;t mean giving up your own.
          </h2>

          <div className="mt-14 grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-[30px] border border-[#ebe5ef] bg-white p-8 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9a91a3]">
                Your perspective
              </p>

              <p className="mt-5 font-serif text-2xl">
                &quot;I feel like I&apos;m carrying everything.&quot;
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center justify-self-center rounded-full bg-[#6845d8] text-2xl text-white shadow-xl shadow-purple-200">
              ↔
            </div>

            <div className="rounded-[30px] border border-[#ebe5ef] bg-white p-8 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9a91a3]">
                Another perspective
              </p>

              <p className="mt-5 font-serif text-2xl">
                &quot;They may feel their contribution isn&apos;t being
                recognized.&quot;
              </p>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-xl text-[#706a7e]">
            The goal isn&apos;t to decide who is right. It is to help you see
            the situation more clearly.
          </p>
        </div>
      </section>

      {/* ================================================
          OUTCOME
      ================================================ */}

      <section className="bg-[#f6efff] py-28">
        <div className="mx-auto w-[min(1000px,calc(100%-40px))] text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6845d8]">
            What happened?
          </p>

          <h2 className="mt-5 font-serif text-4xl sm:text-5xl">
            Trying something and having it
            <br />
            not work isn&apos;t failure.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#706a7e]">
            Bridge remembers what you tried, so it can help you understand what happened and decide what
            to try next.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["🙂", "It went well"],
              ["😐", "Some progress"],
              ["😞", "It didn't work"],
              ["🤷", "I didn't do it"],
            ].map(([emoji, text]) => (
              <div
                key={text}
                className="rounded-[26px] border border-white bg-white p-7 shadow-sm"
              >
                <div className="text-4xl">{emoji}</div>

                <div className="mt-4 font-medium">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          PRIVACY
      ================================================ */}

      <section id="privacy" className="bg-white py-24">
        <div className="mx-auto flex w-[min(950px,calc(100%-40px))] flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f0e9ff] text-2xl text-[#6845d8]">
            ♡
          </div>

          <h2 className="mt-7 font-serif text-4xl sm:text-5xl">
            Your space should feel like yours.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#706a7e]">
            Bridge is designed around privacy, user agency and
            respectful conversations. The AI suggests. You decide.
          </p>

          <div className="mt-8 rounded-full border border-[#e3dced] bg-[#faf7ff] px-6 py-3 text-sm text-[#6845d8]">
            Private by design
          </div>
        </div>
      </section>

      {/* ================================================
          FINAL CTA
      ================================================ */}

      <section className="relative overflow-hidden bg-[#201b3e] py-32 text-white">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#6845d8]/30 blur-3xl" />

        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#df3f9b]/20 blur-3xl" />

        <div className="relative mx-auto w-[min(800px,calc(100%-40px))] text-center">
          <p className="font-serif text-4xl leading-tight sm:text-6xl">
            You don&apos;t have to
            <br />
            figure everything out alone.
          </p>

          <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-white/65">
            Start wherever you are. Talk it through. Find the next step.
          </p>

          <Link
            href="/app"
            className="mt-10 inline-flex rounded-full bg-white px-8 py-4 font-semibold text-[#6845d8] transition hover:-translate-y-1"
          >
            Start talking
            <span className="ml-3">→</span>
          </Link>
        </div>
      </section>

      {/* ================================================
          FOOTER
      ================================================ */}

      <footer className="bg-[#201b3e] pb-10 text-white">
        <div className="mx-auto flex w-[min(1200px,calc(100%-40px))] flex-col justify-between gap-5 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row">
          <div>© 2026 Bridge</div>

          <div>AI for life&apos;s real moments.</div>
        </div>
      </footer>
    </main>
  );
}

/* ================================================
   LOGO & COMPONENTS
================================================ */

function RobotLogo() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d943a1" />
            <stop offset="100%" stopColor="#6d5ef8" />
          </linearGradient>
        </defs>
        
        {/* Head */}
        <rect x="10" y="8" width="20" height="18" rx="4" fill="url(#robotGradient)" />
        
        {/* Eyes */}
        <circle cx="16" cy="16" r="2" fill="white" />
        <circle cx="24" cy="16" r="2" fill="white" />
        
        {/* Body */}
        <rect x="12" y="28" width="16" height="12" rx="2" fill="url(#robotGradient)" opacity="0.8" />
        
        {/* Chest light */}
        <circle cx="20" cy="32" r="2" fill="#52d6d3" opacity="0.9" />
      </svg>
    </div>
  );
}
