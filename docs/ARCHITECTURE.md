# VitalityBridge — Architecture

## Target repo layout

```
VitalityBridge/
│
├── README.md
│
├── apps/
│   ├── web/            → Next.js (from CreativeBridge shell)
│   ├── api/             → FastAPI (from ChiefFlow backend)
│   └── mobile/           → Flutter Companion (from german_ambient_coach)
│
├── agents/
│   ├── companion/
│   ├── navigator/
│   └── followup/
│
├── core/
│   ├── life_context/
│   ├── memory/
│   ├── actions/
│   ├── outcomes/
│   └── followups/
│
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── UI_SPEC.md          (pending — after UI upload)
│   └── REUSE_MAP.md
│
└── .env.example
```

## The Companion Loop

```
                 ┌──────────────────────┐
                 │     USER'S LIFE      │
                 └──────────┬───────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   VITALITY    │
                    │    MEMORY     │
                    └───────┬───────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
         CONTEXT         GOALS          HISTORY
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                    ┌───────────────┐
                    │ COMPANION     │
                    │ ORCHESTRATOR  │
                    └───────┬───────┘
                            │
                 Should I reach out?
                            │
                ┌───────────┴───────────┐
                │                       │
               NO                      YES
                │                       │
                ▼                       ▼
             Wait                 CHECK-IN
                                        │
                                        ▼
                                  CONVERSATION
                                        │
                                        ▼
                                     ACTION
                                        │
                                        ▼
                                    OUTCOME
                                        │
                                        ▼
                                    REPLAN
                                        │
                                        └──────► MEMORY
```

The Companion Orchestrator is a direct relabel of ChiefFlow's
`agents/manager.py` process, which already implements: receive input →
classify → delegate to specialist → generate result → optional human
review/approval → execute → log. That five-step flow becomes: receive
context → classify life domain → delegate to Companion/Navigator/
Follow-Up → generate response/plan → (no approval gate needed for a
personal companion, unlike ChiefFlow's high-risk business actions) →
deliver → log to memory.

## Companion Policy Engine (the "should I reach out?" gate)

```
Should I contact the user?

        │
        ├── Is there an open loop?
        │
        ├── Did the user explicitly request a reminder?
        │
        ├── Is this an appropriate time?
        │
        ├── Has the AI contacted them recently?
        │
        ├── Is the check-in useful?
        │
        └── Would silence be better?
```

This gate sits between the Follow-Up Agent and the Flutter background
service. The Flutter side (`background_service.dart`) already runs an
hourly timer checking for 12 hours of silence and firing an
`onInactivityThresholdReached` event — that mechanism becomes the
trigger that *asks* the Policy Engine the question above, rather than
notifying unconditionally as it does today.

## Agents

| Agent | Responsibility | Source pattern |
|---|---|---|
| **Companion** | Listen, remember context, talk, ask questions, provide emotional support, know when not to give advice | New — conversational layer over the AI router, prompt-shaped like CreativeBridge's `/api/generate` system-prompt builder |
| **Navigator** | Life Map, priorities, goals, possible paths, 7-day plans, next actions, replanning | Adapted from ChiefFlow's specialist-agent pattern (`agents/*.py`) |
| **Follow-Up** | Tracks open loops (topic, action, target date, emotional state); decides when a check-in is worth sending via the Policy Engine | Adapted from ChiefFlow's `WorkflowItem` + `ActivityLog` model, and the Flutter background service's silence-detection timer |

## AI model routing (hybrid cloud + local)

Reused as-is from ChiefFlow's `ai/router.py` / `ai/providers.py`: a
tiered chain (simple → moderate → complex) that tries each provider in
order and falls back down the chain on failure, ending in a
deterministic local engine so the product is never left unresponsive.

```
simple    → Gemma (Fireworks-hosted)
moderate  → Open model on AMD GPU (ROCm / AMD Developer Cloud)
complex   → Fireworks AI (gpt-oss-120b)
[local]   → ChiefFlow-style deterministic fallback (regex intent/
            priority classification, canned responses)
```

CreativeBridge's WatsonX client (`lib/watsonx.ts`) adds a fourth
provider option — IAM-token-cached, streaming — for whichever tier or
use case fits it best (likely `moderate` or as an alternate `complex`
route for longer, more expressive Companion Agent responses).

Cloud providers (Groq, Gemini) mentioned in the original product
discussion map onto this same tiering approach — added as additional
entries in `providers.py` rather than a separate system.

Local inference (Ollama) is the eventual privacy-sensitive path for
local memory processing, classification, and simple intent detection —
positioned as an additional/alternate `simple` tier entry, not a
parallel architecture.

## Data model (adapted from ChiefFlow `models.py`)

- `WorkflowItem` → **OpenLoop**: source, raw context, domain (was
  "intent"), assigned agent, priority, status, extracted data, AI
  summary, model used — same shape, re-labelled for life domains
  (relationship / family / personal) instead of business intents
  (invoice / contract / etc.).
- `ActivityLog` → unchanged in shape; already an append-only audit trail
  of every agent/human action, which is exactly what the Follow-Up
  Agent needs to reconstruct "what did we already say to this user, and
  when."
- `ApprovalRequest` → likely **dropped** or repurposed as an explicit
  "user opted into this reminder" record, since VitalityBridge doesn't
  have ChiefFlow's high-risk-business-action approval gate.

## Auth / persistence decision (open)

Two working options exist across the source repos and only one should
be carried forward:
- ChiefFlow's own JWT (`security.py`) + SQLModel/SQLite
- CreativeBridge's Supabase (`lib/supabase/*`)

Not yet decided — flagged here so it's picked deliberately rather than
by default once mobile/web wiring starts.

## Mobile ↔ backend integration

Today the Flutter app (`german_coach_provider.dart`) calls Gemini
directly from the client. In VitalityBridge, the mobile app should call
the FastAPI backend instead, so all three agents, the tiered router, and
memory/follow-up logic live in one place and are shared between mobile
and web. The Flutter app keeps its STT/TTS/audio/background-service
plumbing; it stops owning any AI logic itself.

## Known cleanup items before this is public

1. Hardcoded Gemini API key in `german_coach_provider.dart` — rotate and
   move to environment config.
2. Real Supabase project URL + anon key hardcoded in CreativeBridge's
   `.env.local.example` — replace with placeholders.
3. Decide auth/persistence (JWT+SQLModel vs Supabase) before wiring
   mobile and web to the same backend.
