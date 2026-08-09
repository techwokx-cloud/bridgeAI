# PROMPTS.md — AI Usage Log

This is the AI-assisted development log for **Bridge**, submitted to
**Problem Statement 3: Autonomous AI Creator**.

This file documents how AI tools were used to build this project. It is
updated per session, not written retroactively in one pass.

---

## Session 01 — Strategy pivot & Autonomy Engine build

**Date:** Hackathon day (final day before Sunday 8PM IST deadline)
**AI tool:** Claude (Anthropic)

### Context

Prior to this session, an earlier product (VitalityBridge — a general "AI
life companion" app) had been built as an open-ended concept, in a separate
repository (`techwokx-cloud/VitalityBridge`), predating this hackathon's
problem statements. That repository is **not** the submission — see
"Authenticity note" below.

### Goal

Re-scope the existing product concept and UI around Problem Statement 3
specifically: an AI persona that observes, decides, and initiates on its
own, rather than only responding to prompts.

### Prompt (paraphrased)

> "Our direction has changed. We're now submitting to Problem Statement 3:
> Autonomous AI Creator. [Pasted hackathon rules, evaluation stages, and a
> prior brainstorm document proposing 'Bridge' — an autonomous companion
> with an Autonomy Engine, initiative scoring, and a router across
> Groq/Gemini/Ollama.] Let's do steps 1 (new repo scaffold), 2 (Autonomy
> Engine), and 3 (dashboard redesign)."

### AI-assisted work in this session

1. **Repo scaffold** — copied the existing, already-working UI (landing,
   dashboard, conversation, robot components, navigation) into a fresh
   directory to serve as the new repo's base, per the requirement that the
   hackathon submission not be an imported/pre-existing codebase.
2. **Autonomy Engine** (`lib/agent/`) — designed and implemented from
   scratch in this session:
   - `router.ts` — provider-agnostic model router (Groq for fast tasks,
     Gemini for deep/reflective tasks, an `offline` branch reserved for a
     future local model)
   - `memory.ts` — Supabase-backed memory store/retrieval
   - `lifeMap.ts` — thin agent-facing wrapper over the pre-existing Neo4j
     graph module
   - `safety.ts` — crisis-keyword detection with a hard override response,
     and a daily cap on autonomous initiations
   - `autonomy.ts` — the initiative-scoring engine: weighted factors
     (importance, recency, emotional need, goal relevance, last-contact
     decay) combine into a 0–1 score; only scores ≥ 0.7 are eligible to
     initiate
   - `planner.ts`, `prompts.ts`, `agent.ts` — planning, persona/prompt
     templates, and the orchestrator tying the above together
3. **API routes** — `POST /api/agent/chat` (reactive turns) and
   `POST`/`GET /api/agent/cycle` (the proactive autonomy loop; `GET`
   returns scored decisions without sending anything, for demo/judging
   transparency).
4. **Database** — added `agent_memories` and `agent_initiations` tables to
   the existing Supabase schema.
5. **Dashboard redesign** — replaced the generic "Start a conversation"
   hero with a "Bridge noticed something" card (referencing an open loop,
   with Talk/Not now actions) and a "What I'm watching" open-threads list,
   so the autonomy is visible on first load rather than only in the
   backend.
6. **Bug fixes carried forward from the prior UI** — dead navigation links
   (`/app/plan`, `/app/practice`, `/app/insights`, `/app/resources`,
   `/app/privacy`, `/signup` were all 404s; built real pages for each),
   unwired buttons ("Just Talk," "Start Talking," conversation quick
   actions), a hardcoded conversation topic that ignored the domain being
   discussed, undersized/static robot animation, and a global font-size
   pass.

### Verification

- `npm run build` — clean compile, all 15 routes generated, 0 TypeScript
  errors.
- Manually curled all previously-404 routes post-build; all return `200`.
- Manually checked JSX tag balance on the robot animation component after
  an edit that had left a `<div>` unclosed; fixed and reverified.

### Files created/modified this session

`lib/agent/*.ts` (8 new files), `app/api/agent/chat/route.ts`,
`app/api/agent/cycle/route.ts`, `lib/supabase/schema.sql` (appended),
`app/app/page.tsx`, `app/app/conversation/page.tsx`,
`components/robot/animated-robot.tsx`, `components/robot/mini-robot.tsx`,
`components/layout/sidebar.tsx`, `app/signin/page.tsx`,
`app/signup/page.tsx` (new), `app/app/plan/page.tsx` (new),
`app/app/practice/page.tsx` (new), `app/app/insights/page.tsx` (new),
`app/app/resources/page.tsx` (new), `app/app/privacy/page.tsx` (new),
`app/globals.css`, `README.md`, this file.

---

## Authenticity note

The UI foundation (landing page, dashboard shell, conversation layout,
robot component, design system) originated in a pre-hackathon project
(`VitalityBridge`) built as general product exploration, not for this
competition. That prior repository is not submitted.

What is new to this submission, built during the hackathon window: the
entire `lib/agent/` Autonomy Engine, both agent API routes, the autonomy
-related database tables, the "Bridge noticed something" dashboard
surface, and the reframing of the product from a general life-companion
chatbot to an autonomous, initiative-scored agent. Commit history on this
repository reflects that incremental build, starting from this session
forward.

---

## Runtime prompts vs. this file

This file is the *hackathon AI usage log* (how we used AI tools to build
the project). It is separate from [`lib/agent/prompts.ts`](lib/agent/prompts.ts),
which contains the prompts *Bridge itself* sends to its model providers at
runtime. Don't conflate the two.

---

## Session 02 — Breeth memory, rebrand, and UI bug-fix pass

**AI tool:** Claude (Anthropic)

### Goal

Two parts: (1) integrate Breeth as the memory backend (previously a plain
Supabase table), generate a new logo, and rebuild the landing page around
the autonomy pitch; (2) fix a batch of concrete UI/UX bugs found by
actually using the deployed app — dead buttons, a voice control that
released on mouse-up instead of toggling, message send with no visible
thread, a placeholder-only Practice mode, a static-looking robot, and
duplicate fake widgets on the dashboard.

### AI-assisted work in this session

**Breeth integration**
- Looked up Breeth's actual REST API (`docs.thebreeth.com`) rather than
  guessing at request/response shapes.
- Rewrote `lib/agent/memory.ts` against real endpoints (`POST /v1/episodes`
  to write, `POST /v1/search` to retrieve), per-user isolation via
  `group_id`, and quota-conscious intent extraction (only on
  `importance >= 0.7`).
- Removed the now-dead `agent_memories` Supabase table from the schema.

**Branding**
- New `BridgeLogo` mark (two nodes + a signal dot on the connecting span)
  replacing the old VitalityBridge heart+bridge mark.
- Rebuilt the landing hero and inserted a new section showing the
  unprompted-initiation exchange as chat bubbles — the single clearest
  proof-of-concept for a judge.

**Architecture correction** (based on direct technical feedback pointing
out that Google Cloud STT/TTS/Emotion were unnecessary additions on top of
an already-sufficient stack):
- Removed `lib/api/google-voice.ts`, `lib/api/google-emotion.ts`, and the
  now-orphaned `lib/services/conversation-orchestrator.ts` that depended on
  them (superseded by `lib/agent/agent.ts` and no longer imported anywhere
  — verified via grep before deleting, not assumed).
- Added `lib/agent/emotion.ts` — GoEmotions
  (`cirimus/modernbert-base-go-emotions`) via Hugging Face Inference API,
  with a keyword-heuristic fallback so it never blocks a turn.
- Rebuilt `.env.example` to exactly match what the code reads (this also
  caught and fixed a pre-existing bug: the file had been missing
  `GEMINI_API_KEY` and `NEO4J_*` entirely, meaning a real deploy would have
  failed silently — cross-checked with `grep -rhoE "process\.env\."` against
  the actual codebase, not eyeballed).

**Bug fixes** (`app/app/conversation/page.tsx` rewritten):
- "Speak your reply" changed from press-and-hold (`onMouseDown`/`onMouseUp`)
  to a real toggle using the Web Speech API — click once, stays listening
  with live-updating transcript until clicked again.
- Send now appends to a real `messages` array, calls `POST /api/agent/chat`,
  and renders the actual thread — previously it just cleared the input with
  no visible result.
- "Change topic" now opens an inline text field instead of navigating away
  ("it just rolls to the top").
- Added working text-to-speech for companion replies (Web Speech Synthesis,
  toggleable) — an immediate, zero-backend answer to "enable mic and
  speaker."

**Practice mode** (`app/app/practice/page.tsx`, `lib/agent/agent.ts`
`runPracticeTurn()`, new `buildPracticePrompt()` in `lib/agent/prompts.ts`,
new `POST /api/agent/practice` route): replaced the "warming up" static
placeholder with a real scenario input and a live roleplay loop where
Bridge plays the other person, kept as a separate prompt/persona from the
main `BRIDGE_SYSTEM_PROMPT` on purpose.

**Robot animation** (`components/robot/mini-robot.tsx`): idle state was a
single float keyframe with no other motion, which read as "just floating."
Added a blink cycle on the eyes and a periodic wave on the right arm as
always-on CSS animations, plus horizontal drift alongside the vertical
float, so idle has visible life without needing a JS state machine.

**Dashboard cleanup**: removed a second, fully non-functional copy of the
notification bell / settings gear / a hardcoded "🔥 Streak 3 days" that
duplicated the topbar and displayed fake data. Wired the topbar's bell →
`/app/insights` and gear → `/app/privacy` instead of leaving them inert.

**Resources page**: replaced the three generic international links with a
categorized list of real Ghanaian organizations (DOVVSU, Ghana Health
Service, Marie Stopes Ghana, Ghana AIDS Commission, Mental Health Authority
Ghana, Youth Employment Agency, Ghana Bar Association, and others),
verified via web search for correct names and, where confirmable, phone
numbers (e.g., DOVVSU's hotline) rather than invented.

### Verification

- `npm run build` — clean, 17 routes, 3 API routes, 0 TypeScript errors.
- Started the app and screenshotted (Playwright) the landing hero, the
  autonomy-proof section, the dashboard, the conversation page, the
  practice page, and the full resources page — checked visually, not just
  assumed from the diff.

### Explicitly deferred (documented, not silently dropped)

Video-call-style AI presence, 3D/animated avatar with blinking and facial
expression, and a wake-word ("Hey Bridge") listener are real product
directions but were not buildable in the remaining time without either
shipping something broken or displacing the higher-priority autonomy
engine work. They're recorded in `README.md` under "Voice & presence
roadmap" instead of pretended-away.

---

## Session 03 — Live deploy debugging: resilience fixes and UX gaps

**AI tool:** Claude (Anthropic)

### Goal

The deployed app was returning "having trouble connecting" on every real
message (both chat and practice mode), and the voice controls gave no
feedback. Debug the actual failure, not just the symptom, and fix the
voice/dashboard/insights/resources gaps flagged from using the live app.

### Root causes found and fixed

1. **Neo4j driver constructed at module scope.** `lib/api/neo4j.ts` called
   `driver(...)` at the top of the file, outside any function. If
   `NEO4J_URI` is malformed, that throws *during import* — which crashes
   every module that transitively imports it (`lib/agent/lifeMap.ts` →
   `lib/agent/agent.ts`), taking down features that don't even touch
   Neo4j, like practice mode. This matched the observed symptom (chat and
   practice failed identically). Fixed by making the driver lazily
   initialize on first use, and wrapped `getOpenLoops`/`getRecurringPatterns`
   in `lib/agent/lifeMap.ts` with try/catch so a Neo4j outage degrades to
   "no open loops" instead of failing the whole turn.

2. **Supabase key naming mismatch.** The person's Render environment used
   Supabase's newer key labels (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SECRET_KEY`), but `lib/supabase/client.ts` and `server.ts`
   only read the old names (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). Fixed with a
   fallback chain that accepts either naming convention, and documented
   both in `.env.example`.

3. **Verified the fix, not just the theory** — ran the built app locally
   with a deliberately-unresolvable `NEO4J_URI` and confirmed: the
   practice route fails cleanly (JSON 500, real API-key error) rather than
   crashing, and the landing page, dashboard, and resources page all stay
   at 200 immediately after. Confirmed via curl against a running instance,
   not assumed from reading the diff.

### UX fixes

- Voice: "Speak your reply" renamed to "Tap to speak to Bridge" when idle;
  tapping now speaks "I'm listening." aloud immediately (audible
  confirmation the mic engaged, bypassing the speak-replies toggle since
  it's a system cue, not a reply); stopping (manually or via the browser's
  own silence timeout) now auto-sends the transcribed text instead of
  silently sitting in the input box.
- Chat and practice mode now show a **varied** fallback line on failure
  (three templates, picked at random) instead of the same flat apology
  every retry — matters specifically for live judging, where a transient
  failure repeating verbatim reads as "broken," not "temporarily down."
- Dashboard: the "Bridge noticed something" card's "Not now" button was a
  dead placeholder; wired it to actually dismiss the card.
- Dashboard: added an "Add a topic" card so conversations aren't limited
  to the five fixed domains.
- Insights page and the conversation sidebar's "Things I'm noticing"
  panel both now say plainly that the shown patterns are examples, not
  yet-real data — addressing the concern that the illustrative content
  read as an overclaim before any conversations existed.
- Resources page: added phone numbers where verifiable (DOVVSU, Marie
  Stopes, 112) and a "Help me reach out" action per organization that
  opens Practice mode pre-filled with that context — Bridge helps prepare
  what to say, but deliberately does **not** claim to contact these
  organizations autonomously on the person's behalf. That's a safety
  boundary, not a missing feature: initiating outside contact to
  third-party orgs (some of them crisis/DV-related) without the person
  directly taking that action is not something to build casually.

### Explicitly not fabricated

Where a phone number or WhatsApp contact couldn't be verified via search,
the resource links to the organization's website rather than inventing a
number — wrong contact info for a domestic-violence or crisis-adjacent
resource is actively harmful, not just an inconvenience.
