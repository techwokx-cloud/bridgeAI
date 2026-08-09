export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-medium text-[#191735]">
        Private by design
      </h1>
      <p className="mt-4 text-base leading-7 text-[#706a7e]">
        Everything you tell Bridge is used for one purpose: helping you. Your
        conversations are not sold, shared with advertisers, or used to train
        models outside your own account.
      </p>
      <p className="mt-4 text-base leading-7 text-[#706a7e]">
        Bridge remembers things about your life so it can be useful over
        time — open threads, patterns, things you've told it matter to you.
        You can ask to see or delete anything it remembers at any time.
      </p>
      <p className="mt-4 text-base leading-7 text-[#706a7e]">
        Bridge is not a substitute for professional mental health care. If
        you're in crisis, see the{" "}
        <a href="/app/resources" className="text-[#6845d8] underline">
          Resources
        </a>{" "}
        page for immediate help.
      </p>
    </div>
  );
}
