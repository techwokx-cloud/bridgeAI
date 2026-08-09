# Bridge

**An AI companion that doesn't wait for you to ask.**

Submitted for **Problem Statement 3: Autonomous AI Creator** — build an autonomous AI and technology persona that no longer waits for instructions.

Most AI assistants work like this:

```
User → Prompt → AI → Answer
```

Bridge works like this:

```
Observe context → Think → Decide whether to act → Initiate → Follow up → Remember → Adapt
```

It remembers what you told it mattered, notices when a thread you opened has gone quiet, and — within a rate limit it enforces on itself — reaches out first.

---

## The demo, in one exchange

> **You:** "I need to talk to my manager about my workload."
>
> Bridge stores: domain=Work, person=Manager, goal="have the conversation", status=open.
>
> *You leave. No follow-up message. Days pass.*
>
> **Bridge (unprompted):** "Hey — you mentioned wanting to talk to your manager about your workload. You haven't checked that off yet. Want to prepare for it together?"
>
> **You:** "I tried yesterday but it didn't go well."
>
> **Bridge:** "Okay, let's not repeat the same approach. What happened?"

That loop — observe, decide, initiate, remember what was already tried — is the whole submission.

---

## The Autonomy Engine

The part that makes Bridge an agent rather than a chatbot lives in [`lib/agent/`](lib/agent):

```
lib/agent/
├── agent.ts       # reactive turn orchestrator (user-initiated)
├── autonomy.ts     # proactive loop: observe → score → decide → initiate
├── router.ts        # model router (fast/Groq, deep/Gemini, offline/reserved)
├── memory.ts         # what Bridge remembers about a person
├── lifeMap.ts          # agent-facing view over the Neo4j life graph
├── planner.ts            # turns a goal into one concrete next step
├── prompts.ts              # Bridge's persona + runtime prompt templates
└── safety.ts                # crisis detection + initiation rate limiting
```

### The initiative score

Bridge doesn't message people just because a thread is open. Every open loop gets scored:

```
score = 0.25·importance + 0.20·recency + 0.20·emotionalNeed
      + 0.20·goalRelevance + 0.15·lastContactDecay
```

Only loops scoring **≥ 0.7** are eligible to trigger outreach, and outreach itself is capped at 2 initiations/user/day (`lib/agent/safety.ts`). This is what keeps "autonomous" from becoming "spammy" — see `calculateInitiativeScore()` and `observeAndScore()` in [`lib/agent/autonomy.ts`](lib/agent/autonomy.ts) for the exact logic; it's demoable directly via `GET /api/agent/cycle?userId=...`, which returns the scored decisions without sending anything.

### Two entry points

- `POST /api/agent/chat` — reactive: the user messaged Bridge, respond with memory + life-map context folded in.
- `POST /api/agent/cycle` / `GET /api/agent/cycle?userId=` — proactive: run the autonomy loop for one user (meant to be called on a schedule for every active user; GET variant is for judging/demo transparency).

---

## Architecture

```
                    ┌─────────────────┐
                    │      BRIDGE      │
                    │ Autonomous Persona│
                    └────────┬─────────┘
                             │
                    ┌────────▼────────┐
                    │   Agent Core     │  lib/agent/agent.ts
                    └────────┬────────┘
                             │
        ┌────────────────────┼──────────────────┐
        ▼                    ▼                  ▼
   AUTONOMY               MEMORY             LIFE MAP
 lib/agent/autonomy.ts  lib/agent/memory.ts  lib/agent/lifeMap.ts
        │                    │                  │
        └────────────────────┼──────────────────┘
                             ▼
                     ┌───────────────┐
                     │  MODEL ROUTER  │  lib/agent/router.ts
                     └───────┬───────┘
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
               Groq       Gemini      (offline —
             (fast)       (deep)      reserved)
```

Bridge is not hard-wired to one model — swapping or adding a provider only touches `router.ts`.

## Tech stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS

| Function | Use |
|---|---|
| Database / Auth | **Supabase** (PostgreSQL) — conversations, users, open loops, initiation log |
| Long-term AI memory | **Breeth** — intent-aware memory graph, not a flat table (see [`lib/agent/memory.ts`](lib/agent/memory.ts)) |
| Life Map / relationships | **Neo4j** — life domains, open loops, recurring patterns |
| Fast conversation | **Groq** |
| Deep reasoning / autonomy | **Gemini** |
| Emotion detection | **GoEmotions** ([cirimus/modernbert-base-go-emotions](https://huggingface.co/cirimus/modernbert-base-go-emotions)) via Hugging Face, with a zero-dependency keyword fallback — no paid Google Emotion API |
| Speech → text | **AssemblyAI** — records via MediaRecorder, transcribes server-side (see [`app/api/voice/transcribe`](app/api/voice/transcribe/route.ts), [`lib/api/assemblyai.ts`](lib/api/assemblyai.ts)) |
| Text → speech (live today) | Browser Speech Synthesis API — zero backend, works now |
| Autonomous scheduling | Manual/on-demand today; cron/background worker planned |

We deliberately did **not** introduce Google Cloud STT/TTS/Emotion, since the existing stack (Supabase + Breeth + Neo4j + Groq/Gemini) already covers memory, reasoning, and data — adding a second, paid, credential-heavy voice/emotion stack on top would be scope creep for no product benefit. See "Voice & presence roadmap" below for what's live vs. planned.

Full schema: [`lib/supabase/schema.sql`](lib/supabase/schema.sql)

## Voice & presence roadmap

**Live today:**
- **Speech-to-text (AssemblyAI):** tap the mic, speak, tap again — audio is recorded client-side and transcribed server-side via AssemblyAI, then auto-sent. Requires `ASSEMBLYAI_API_KEY`. This replaced an earlier browser-only (`SpeechRecognition`) implementation, which was unsupported in Firefox and unreliable on Android (its `onend` event doesn't always fire, which could leave the mic stuck showing "Listening..." indefinitely) — MediaRecorder's stop event is far more consistent.
- **Text-to-speech (browser):** Bridge speaks its replies aloud via the Web Speech Synthesis API — zero backend, toggleable in the conversation view. The "I'm listening" cue is spoken synchronously the moment you tap the mic, both as audible confirmation and because some mobile browsers (Safari in particular) drop the audio-authorization that comes from a user tap once an `await` has happened — speaking something synchronously on tap keeps that authorization alive for the reply that comes later.

**Next** (documented, not yet wired):
- **Kokoro/Piper** self-hosted TTS as a higher-quality, offline-capable voice, with browser speech synthesis staying as the always-available fallback.
- **Wake word** — "Hey Bridge," via openWakeWord. The distinction that matters: the wake word is for when *you* want Bridge; the Autonomy Engine is for when *Bridge* decides to reach out. Both exist on purpose.
- **Ollama + Qwen3** as an offline model route (`lib/agent/router.ts` already has an `offline` task type reserved for this).

### Making the existing robot feel like a presence

Rather than chase a video/3D avatar for the hackathon MVP, the robot we
already have is built out into a real state machine, so it *feels* present
without needing a camera:

```
             🤖 BRIDGE
                │
      ┌─────────┼─────────┐
      │         │         │
  Listening  Thinking   Speaking
      │         │         │
      └─────────┼─────────┘
                │
          Emotion state
                │
           Conversation
                │
              Memory
                │
          Autonomous
           follow-up
```

Implemented in [`components/robot/mini-robot.tsx`](components/robot/mini-robot.tsx):
blinking, a distinct listening/thinking/speaking animation each, an
emotion-driven expression, and a one-time "wake" pulse when Bridge
initiates on the dashboard — an idle robot that's visibly alive, not a
static image with a label under it.

## Stretch Features

The following features are intentionally marked as not started
for the hackathon MVP:

- Video-call-style animated/3D Bridge presence
- Optional AI-generated human face
- Full camera-based face-to-face conversation mode

These are planned extensions of the autonomous companion experience,
but are not required for the core demonstration.

| Feature | Status |
|---|---|
| Animated Bridge Presence — video-call-style interface where Bridge appears as an animated/3D presence, with blinking and basic emotional expression; users choose between the robot avatar and an AI-generated face while talking | ⚪ Stretch / Not Started |
| Face-to-Face Mode — full camera-based conversation mode where Bridge interacts through a live camera experience | ⚪ Stretch / Not Started |

Core first. Face-to-face later.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Gemini/Groq/Supabase/Neo4j/Breeth keys
npm run dev
```

Run [`lib/supabase/schema.sql`](lib/supabase/schema.sql) in the Supabase SQL editor before first use.

## AI usage

See [`PROMPTS.md`](PROMPTS.md) at the repo root for the full AI-assisted development log.

## Status

Reactive conversation (with a real message thread, browser voice in/out, and inline topic editing), practice mode (Bridge role-plays the other person in a rehearsed conversation), the scored autonomy loop, Breeth-backed memory, and the dashboard's "what Bridge is watching" surface are wired end-to-end. Not yet done: actual cron scheduling for the autonomy cycle in production (currently invoked manually/on-demand), and the voice/presence roadmap items above.

## License

See [`LICENSE`](LICENSE).

## Demo video

`scripts/record-demo.js` produces a real screen recording of the app
using Playwright (records genuine UI interactions, not a mockup). Run the
app locally (`npm run dev` or `npm start`), then in another terminal:

```bash
npm install --save-dev playwright  # if not already present
node scripts/record-demo.js
```

Output lands in `demo-recording/` as a `.webm` file — convert to MP4 with
`ffmpeg -i input.webm -c:v libx264 -pix_fmt yuv420p output.mp4` if needed.
A narration script timed to the recording is available on request.
