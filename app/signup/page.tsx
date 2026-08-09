import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fffaf7] via-[#fdf4f7] to-[#f1eaff] px-4">
      <div className="w-full max-w-md rounded-[32px] border border-white/80 bg-white/70 backdrop-blur-xl p-8 shadow-xl">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#df3f9b] via-[#784ee5] to-[#20b8bd] text-2xl font-semibold text-white">
            ♡
          </div>
        </div>

        <h1 className="mt-6 text-center font-serif text-3xl font-medium text-[#191735]">
          Meet Bridge
        </h1>
        <p className="mt-2 text-center text-base text-[#706a7e]">
          Create an account to start your journey.
        </p>

        <form className="mt-8 space-y-4">
          <div>
            <label className="text-base font-medium text-[#403b52]">Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="mt-2 w-full rounded-lg border border-[#ddd5e8] bg-[#f6efff] px-4 py-3 text-base placeholder-[#9a91a3] transition focus:border-[#6845d8] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-base font-medium text-[#403b52]">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-[#ddd5e8] bg-[#f6efff] px-4 py-3 text-base placeholder-[#9a91a3] transition focus:border-[#6845d8] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-base font-medium text-[#403b52]">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-lg border border-[#ddd5e8] bg-[#f6efff] px-4 py-3 text-base placeholder-[#9a91a3] transition focus:border-[#6845d8] focus:outline-none"
            />
          </div>

          <Link
            href="/app"
            className="block w-full rounded-lg bg-[#6845d8] py-3 text-center font-semibold text-white transition hover:-translate-y-0.5"
          >
            Create account
          </Link>
        </form>

        <p className="mt-6 text-center text-base text-[#706a7e]">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-[#6845d8]">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
