const categories = [
  {
    title: "Crisis & Safety",
    items: [
      {
        title: "National Emergency Line",
        detail: "Police, fire, and medical emergencies, nationwide.",
        phone: "112",
        href: "tel:112",
      },
      {
        title: "DOVVSU — Domestic Violence & Victim Support Unit",
        detail: "Ghana Police Service unit for abuse, domestic violence, and child protection.",
        phone: "055 100 0900",
        href: "tel:0551000900",
        website: "https://police.gov.gh/en/index.php/domestic-violence-victims-support-unit-dovvsu/",
      },
      {
        title: "Ghana Police Service",
        detail: "Report a crime or find your nearest station.",
        website: "https://police.gov.gh",
      },
      {
        title: "Find A Helpline — Ghana",
        detail: "Verified crisis lines for anxiety, depression, suicide prevention, and abuse, specific to Ghana.",
        website: "https://findahelpline.com/countries/gh",
      },
    ],
  },
  {
    title: "Mental Health",
    items: [
      {
        title: "Mental Health Authority Ghana",
        detail: "The national body overseeing mental health services and referrals.",
        website: "https://mha-ghana.com",
      },
      {
        title: "Ghana Psychological Association",
        detail: "Directory of licensed psychologists and counselors in Ghana.",
        website: "https://www.google.com/search?q=Ghana+Psychological+Association",
      },
      {
        title: "Ghana College of Physicians — Psychiatry Faculty",
        detail: "Professional body for psychiatric care in Ghana.",
        website: "https://www.google.com/search?q=Ghana+College+of+Physicians+and+Surgeons+psychiatry+faculty",
      },
    ],
  },
  {
    title: "Health & Family",
    items: [
      {
        title: "Ghana Health Service (GHS)",
        detail: "National public health services, clinics, and health information.",
        website: "https://www.ghanahealthservice.org",
      },
      {
        title: "Ghana Medical Association (GMA)",
        detail: "Directory and standards body for licensed doctors in Ghana.",
        website: "https://www.google.com/search?q=Ghana+Medical+Association",
      },
      {
        title: "Marie Stopes Ghana",
        detail: "Family planning, maternal health, and reproductive healthcare.",
        phone: "+233 302 241 517",
        href: "tel:+233302241517",
        website: "https://mariestopes.org.gh",
      },
      {
        title: "Ghana Registered Midwives Association",
        detail: "Maternal care and midwifery support nationwide.",
        website: "https://www.google.com/search?q=Ghana+Registered+Midwives+Association",
      },
      {
        title: "Ghana AIDS Commission",
        detail: "National coordination for HIV/AIDS prevention, treatment, and support.",
        website: "https://ghanaids.gov.gh",
      },
    ],
  },
  {
    title: "Youth & Employment",
    items: [
      {
        title: "Youth Employment Agency (YEA)",
        detail: "Government job placement and skills programs for young people.",
        website: "https://www.google.com/search?q=Youth+Employment+Agency+Ghana",
      },
      {
        title: "National Youth Authority",
        detail: "National coordination body for youth development programs.",
        website: "https://www.google.com/search?q=National+Youth+Authority+Ghana",
      },
      {
        title: "YOLO (Youth Empowerment)",
        detail: "Adolescent reproductive health and life-skills education.",
        website: "https://www.google.com/search?q=YOLO+Ghana+youth+empowerment",
      },
      {
        title: "Plan International Ghana",
        detail: "Child rights, girls' education, and youth protection programs.",
        website: "https://plan-international.org/ghana/",
      },
    ],
  },
  {
    title: "Legal & Rights",
    items: [
      {
        title: "Ghana Bar Association",
        detail: "Find a licensed lawyer or learn about your legal rights.",
        website: "https://www.google.com/search?q=Ghana+Bar+Association",
      },
      {
        title: "Domestic Violence Secretariat",
        detail: "Coordinates national response and support services for domestic violence survivors.",
        website: "https://www.google.com/search?q=Domestic+Violence+Secretariat+Ghana",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-[#191735]">
        Resources
      </h1>
      <p className="mt-2 text-base text-[#706a7e]">
        Bridge is a companion, not a replacement for professional support.
        These are real Ghana-based organizations for when you need more
        than a conversation.
      </p>

      <div className="mt-5 rounded-2xl border border-[#d8e8ff] bg-[#f4f9ff] p-4">
        <p className="text-sm text-[#3b5a8a]">
          <strong>Bridge can help you prepare what to say</strong> before
          you reach out — use &ldquo;Help me reach out&rdquo; on any
          organization below to rehearse the call or message in Practice
          mode. Bridge doesn&apos;t contact these organizations on your
          behalf; you stay in control of who you reach and when.
        </p>
      </div>

      <div className="mt-8 space-y-10">
        {categories.map((cat) => (
          <div key={cat.title}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#6d5ef8]">
              {cat.title}
            </h2>
            <div className="mt-3 space-y-3">
              {cat.items.map((r) => (
                <div
                  key={r.title}
                  className="rounded-2xl border border-[#ebe5ef] bg-white p-5"
                >
                  <h3 className="font-medium text-[#302842]">{r.title}</h3>
                  <p className="mt-1 text-base text-[#706a7e]">{r.detail}</p>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {r.phone && (
                      <a
                        href={r.href}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#f0e9ff] px-3 py-1.5 font-medium text-[#6845d8]"
                      >
                        📞 {r.phone}
                      </a>
                    )}
                    {r.website && (
                      <a
                        href={r.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#ddd5e8] px-3 py-1.5 font-medium text-[#706a7e]"
                      >
                        🌐 Website
                      </a>
                    )}
                    <a
                      href={`/app/practice?situation=${encodeURIComponent(`Reaching out to ${r.title} about ${r.detail.toLowerCase()}`)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#6845d8] px-3 py-1.5 font-medium text-[#6845d8]"
                    >
                      🎯 Help me reach out
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
