import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fffaf7] via-[#fdf4f7] to-[#f1eaff] px-4">
      <div className="w-full max-w-md rounded-[32px] border border-white/80 bg-white/70 backdrop-blur-xl p-8 shadow-xl">
        {/* LOGO */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#df3f9b] via-[#784ee5] to-[#20b8bd] text-2xl font-semibold text-white">
            ♡
          </div>
        </div>

        <h1 className="mt-6 text-center font-serif text-3xl font-medium text-[#191735]">
          Welcome back
        </h1>

        <p className="mt-2 text-center text-sm text-[#706a7e]">
          Sign in to continue your journey with Bridge
        </p>

        {/* FORM */}
        <form className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-[#403b52]">Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-[#ddd5e8] bg-[#f6efff] px-4 py-3 text-sm placeholder-[#9a91a3] transition focus:border-[#6845d8] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#403b52]">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-lg border border-[#ddd5e8] bg-[#f6efff] px-4 py-3 text-sm placeholder-[#9a91a3] transition focus:border-[#6845d8] focus:outline-none"
            />
          </div>

          <Link
            href="/app"
            className="block w-full rounded-lg bg-[#6845d8] py-3 text-center font-semibold text-white transition hover:-translate-y-0.5"
          >
            Sign in
          </Link>
        </form>

        {/* OR DIVIDER */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#ddd5e8]" />
          <span className="text-xs text-[#9a91a3]">OR</span>
          <div className="h-px flex-1 bg-[#ddd5e8]" />
        </div>

        {/* SOCIAL BUTTONS */}
        <div className="mt-6 space-y-2">
          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#ddd5e8] bg-[#f6efff] py-3 text-base font-medium text-[#403b52] opacity-50"
          >
            🔐 Sign in with Google (coming soon)
          </button>

          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#ddd5e8] bg-[#f6efff] py-3 text-base font-medium text-[#403b52] opacity-50"
          >
            🍎 Sign in with Apple (coming soon)
          </button>
        </div>

        {/* FOOTER */}
        <p className="mt-6 text-center text-sm text-[#706a7e]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-[#6845d8]">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
