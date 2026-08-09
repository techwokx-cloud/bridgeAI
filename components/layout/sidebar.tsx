"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { name: "Home", href: "/app", icon: "🏠" },
  { name: "My Conversations", href: "/app/conversations", icon: "💬" },
  { name: "Life Map", href: "/app/lifemap", icon: "🗺️" },
  { name: "Plan & Actions", href: "/app/plan", icon: "📋" },
  { name: "Practice", href: "/app/practice", icon: "🎯" },
  { name: "Insights", href: "/app/insights", icon: "💡" },
  { name: "Resources", href: "/app/resources", icon: "📚" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r border-[#ebe5ef] bg-white md:block">
      {/* LOGO */}
      <Link
        href="/app"
        className="flex items-center gap-3 border-b border-[#ebe5ef] px-6 py-6 transition hover:bg-[#faf7fc]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#df3f9b] via-[#784ee5] to-[#20b8bd] text-lg font-semibold text-white">
          ♡
        </div>

        <div>
          <div className="font-serif text-lg font-semibold text-[#191735]">
            Bridge
          </div>

          <div className="text-xs text-[#9a91a3]">Autonomous companion</div>
        </div>
      </Link>

      {/* NAVIGATION */}
      <nav className="space-y-1 px-4 py-6">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[#f0e9ff] text-[#6845d8]"
                  : "text-[#706a7e] hover:bg-[#f6efff]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* SPACER */}
      <div className="flex-1" />

      {/* FOOTER */}
      <div className="border-t border-[#ebe5ef] p-6">
        {/* JUST TALK SECTION */}
        <div className="rounded-[20px] border-2 border-[#6845d8] bg-gradient-to-br from-[#f0e9ff] to-[#ede4ff] p-4 text-center">
          <p className="text-xs font-medium text-[#403b52]">
            💭 Just Talk
          </p>

          <p className="mt-2 text-xs text-[#706a7e]">
            Sometimes you just need someone to listen. I&apos;m here for you.
          </p>

          <Link
            href="/app/conversation?domain=other&mode=talk"
            className="mt-4 block w-full rounded-full bg-[#6845d8] py-2 text-center text-xs font-semibold text-white transition hover:bg-[#5535c4]"
          >
            Start Talking
          </Link>
        </div>

        {/* USER INFO */}
        <div className="mt-6 border-t border-[#ebe5ef] pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#f2b7c9] to-[#b9a5df]" />

              <div>
                <p className="text-sm font-medium text-[#403b52]">George</p>

                <p className="text-xs text-[#9a91a3]">Free Plan</p>
              </div>
            </div>

            <button className="text-lg">→</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
