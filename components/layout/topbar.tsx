"use client";

import Link from "next/link";

export default function Topbar() {
  return (
    <header className="border-b border-[#ebe5ef] bg-white px-6 py-4 md:px-8">
      <div className="flex items-center justify-between">
        {/* BREADCRUMB / SEARCH */}
        <div className="flex flex-1 items-center gap-4">
          <input
            type="text"
            placeholder="Search conversations..."
            className="hidden max-w-sm rounded-full border border-[#ddd5e8] bg-[#f6efff] px-4 py-2 text-sm placeholder-[#9a91a3] transition focus:border-[#6845d8] focus:outline-none md:block"
          />
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/app/insights"
            title="What Bridge has noticed"
            className="rounded-full p-2 text-lg hover:bg-[#f6efff]"
          >
            🔔
          </Link>

          <Link
            href="/app/privacy"
            title="Privacy & settings"
            className="rounded-full p-2 text-lg hover:bg-[#f6efff]"
          >
            ⚙️
          </Link>

          <Link
            href="/"
            className="ml-2 rounded-full bg-[#6845d8] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Sign out
          </Link>
        </div>
      </div>
    </header>
  );
}
