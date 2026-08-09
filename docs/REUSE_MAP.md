# VitalityBridge — Reuse Map

Inventory of the three source repos uploaded so far, and what happens to
each piece. UI files/code not yet uploaded — this map will get a fourth
section once those arrive.

## Legend

```
KEEP    → carry over largely unchanged
ADAPT   → same mechanism, re-labelled/re-themed for VitalityBridge
MERGE   → two existing pieces get wired together
DISCARD → not needed for VitalityBridge
```

## 1. ChiefFlow AI (FastAPI + Next.js)

| Piece | Verdict | Notes |
|---|---|---|
| `agents/manager.py` | **KEEP** | Orchestration loop (receive → classify → delegate → generate → optional approval → execute → log) is the Companion Orchestrator, structurally as-is. |
| `ai/router.py` + `ai/providers.py` | **KEEP** | Tiered model routing with graceful fallback down to a local engine. This is the hybrid cloud+local answer — reused directly, add Groq/Gemini/WatsonX as additional provider entries. |
| `ai/local_engine.py` | **ADAPT** | Regex intent classification, priority/sentiment scoring, entity extraction, canned drafts. Re-theme intents (invoice/contract/complaint/...) into life domains (relationship/family/career/money/...). |
| `models.py` — `WorkflowItem` | **ADAPT** | Becomes `OpenLoop`. Same shape: source, raw text, domain, assigned agent, priority, status, extracted data, AI summary, model used. |
| `models.py` — `ActivityLog` | **KEEP** | Append-only audit trail — exactly what Follow-Up needs. |
| `models.py` — `ApprovalRequest` | **ADAPT / possibly DISCARD** | No high-risk-business-action gate needed; may become an explicit "user opted into reminder" record instead, or be dropped. |
| 6 specialist agents (`email_agent.py` etc.) | **REWRITE** | Small thin wrappers around `ask_ai()` with a tier — the *pattern* is reused to build Companion / Navigator / Follow-Up, not the specific agents. |
| `security.py`, `routers/auth.py` | **KEEP** | JWT + bcrypt, clean, no baked-in secrets. One of two competing auth options (see CreativeBridge's Supabase) — needs a decision. |
| Frontend components (`ActivityFeed`, `AgentCard`, `StatCard`, `WorkflowCard`, `UploadDropzone`, `Sidebar`, `Topbar`) | **ADAPT** | ActivityFeed → check-in history; WorkflowCard → Bridge Plan cards; AgentCard → the 3-agent status view. |

## 2. german_ambient_coach (Flutter)

| Piece | Verdict | Notes |
|---|---|---|
| `background_service.dart` | **KEEP / ADAPT** | Hourly timer + 12-hour-silence detection is the trigger mechanism for proactive check-ins. Needs to call the Companion Policy Engine (via backend) instead of firing unconditionally. |
| `gemini_evaluator.dart` | **DISCARD as-is, pattern KEEP** | Direct client-side Gemini call — VitalityBridge should route all AI calls through the backend's tiered router instead, so this specific file goes but the "call an LLM and handle the response" pattern informs the client API layer. |
| STT/TTS/audio (`speech_to_text`, `flutter_tts`, `audioplayers`, `audio_session`) | **KEEP** | Full voice loop already wired — this is the mobile companion shell. |
| `german_coach_provider.dart` state machine (`CoachState`: idle/speaking/listening/evaluating) | **ADAPT** | The state machine shape is reusable for a Companion conversation UI; the ~1000 lines of German lesson syllabus content is not. |
| German lesson syllabus content | **DISCARD** | Content only, not the mechanism. |
| Bluetooth + connectivity monitoring | **KEEP** | Generically useful for a companion app checking device/network state. |

⚠️ **Action item:** hardcoded live Gemini API key in
`german_coach_provider.dart` — rotate before any public repo/commit.

## 3. CreativeBridge AI (Next.js + Supabase + WatsonX)

| Piece | Verdict | Notes |
|---|---|---|
| `lib/watsonx.ts` | **KEEP** | Production-quality: IAM token caching, SSE streaming, non-streaming fallback. Becomes a 4th provider tier in `ai/providers.py`. |
| `app/api/generate/route.ts` | **ADAPT** | Generic prompt-builder + streaming endpoint (`{type, audience, tone, genre, language, mode}` → streamed text). Pattern maps directly onto the Companion Agent's response generation. |
| `app/dashboard/idea-studio/page.tsx` | **ADAPT** | Prompt → generate UI, already wired to the generate route. Reusable interaction pattern for "tell me what's going on" input. |
| `app/dashboard/discovery-board/page.tsx` | **ADAPT** | Conceptually overlaps with Digital Bridge Africa's ICT Discovery Board — worth folding into that effort rather than treating as a separate VitalityBridge feature. |
| StoryVerse / EduVerse / Multimedia Studio / Presentation Builder pages | **DISCARD** | CreativeBridge-specific; not part of the VitalityBridge feature set. |
| `components/ui/*` (Button, Card, Input, Textarea, Badge, PageHero) | **KEEP** | Lightweight shadcn-style primitives, reusable across the web dashboard. |
| `components/layout/*` (Sidebar, Topbar, AppShell) | **ADAPT** | Good shell pattern for the VitalityBridge web dashboard nav. |
| `lib/supabase/*` | **KEEP, pending decision** | Competing auth/DB option against ChiefFlow's JWT+SQLModel — pick one. |

⚠️ **Action item:** real Supabase project URL + anon key hardcoded in
`.env.local.example` instead of placeholders — genericize before public
repo/commit.

## Open decisions

1. **Auth/persistence:** ChiefFlow's JWT + SQLModel/SQLite vs.
   CreativeBridge's Supabase. Pick one before wiring mobile + web to a
   shared backend.
2. **Discovery Board feature:** keep inside VitalityBridge, or fold into
   the separate Digital Bridge Africa effort where it conceptually
   belongs?
3. **AI provider set for launch:** ChiefFlow's three (Gemma/AMD-GPU/
   Fireworks) + WatsonX are already wired-pattern-compatible. Groq and
   Gemini (mentioned in the original product discussion) are not yet
   integrated anywhere and would need new provider functions added to
   `ai/providers.py`.

## Pending: UI files/code (not yet uploaded)

This section will be filled in once the UI files/code arrive — expect it
to mainly affect the `apps/web` and `apps/mobile` mappings above rather
than the agent/data-model layer.
