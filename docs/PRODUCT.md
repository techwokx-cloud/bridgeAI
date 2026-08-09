# VitalityBridge — Product Concept

## What it is

VitalityBridge is an AI companion for the moments in life that don't come
with instructions: marriage, parenting, friendships, family conflict,
career pressure, money conversations, difficult decisions, feeling stuck,
supporting someone you care about.

Not a medical app. Not a fitness tracker. Not a chatbot.

Where everyday AI helps you write emails, summarize documents, code, and
search, VitalityBridge helps you navigate real life. The fundamental
question it answers is:

> "What do I do next?"

## The core loop

```
Understand → Prioritize → Act → Reflect → Adapt
```

A user describes a messy life situation. VitalityBridge turns it into a
Life Map (the situation broken into domains — relationship, family,
personal/career), a Bridge Plan (priorities, options, consequences), and
a single Next Step — one sensible, small action for today, not another
planner.

Example:

> "I've been feeling disconnected from my family. I work all day and by
> the time I get home I'm tired."

Response: a short, concrete plan — send your sister a message today (5
min), call your mother tomorrow (10 min), have dinner together this
weekend (60 min) — followed by an offer to help start the conversation.

## Proactive companionship

The distinguishing idea is that VitalityBridge doesn't only wait to be
opened. It remembers context, decides when a check-in is appropriate,
reaches out, talks, notices what happened, and follows up later.

Example flow:
1. User: "Tomorrow I'm going to talk to my boss about my workload. I'm
   really nervous."
2. Next morning: a notification checks in — "How are you feeling about
   it now?" (Ready / Still nervous / I need to talk)
3. Later that day: a follow-up — "How did it go?" (Better than expected
   / Some progress / It went badly / Didn't have the conversation)
4. The Progress/Replanning system adapts the plan based on the outcome.

This depends on a **Companion Policy Engine** that decides *whether* to
reach out at all — an open loop existing, an explicit reminder request,
appropriate timing, no recent contact, and genuine usefulness of the
check-in are all gating conditions. Silence is a valid, sometimes
correct, output.

## The three agents

Not a swarm — three agents, matching the pattern already proven in
ChiefFlow's manager/specialist structure (see ARCHITECTURE.md):

- **Companion Agent** — the conversational personality. Listens,
  remembers context, talks, asks questions, provides emotional support,
  knows when *not* to give advice.
- **Navigator Agent** — turns conversation into structured life
  navigation: Life Map, priorities, goals, possible paths, 7-day plans,
  next actions, replanning.
- **Follow-Up Agent** — watches the user's commitments and open loops
  (e.g. "I'll talk to my daughter this weekend" → topic, action, target
  date, emotional state), and decides when a check-in makes sense via
  the Companion Policy Engine.

## Model strategy: hybrid, not single-provider

- **Cloud** — Groq (fast conversational inference), Gemini (secondary
  provider/fallback), with room for others. Advantages: better models,
  faster development, fast responses, easier agent orchestration.
- **Local** — Ollama/local models eventually for privacy-sensitive
  processing: local memory processing, classification, simple intent
  detection.

This mirrors ChiefFlow's existing tiered router (simple/moderate/complex
across Gemma, an AMD-hosted open model, and Fireworks, with a
deterministic local fallback) — that mechanism is being reused directly,
not rebuilt. See ARCHITECTURE.md.

## UI direction

No stock photography, no AI-generated hero images, no dependency on
external artwork. The entire interface is recreated from code: beautiful
typography, cards, timelines, progress rings, icons, relationship maps,
AI conversation, simple SVG illustrations, charts.

## Two product framings worth keeping in view

1. **Personal life navigation** — the core loop above, for anyone
   working through marriage, parenting, career, money, etc.
2. **Community / opportunity navigation** — the same Understand →
   Prioritize → Act → Reflect → Adapt loop applied to a user like "a
   student in Ghana who wants to learn AI but has no money for courses,"
   surfacing free courses, communities, hackathons, scholarships,
   mentors, and building a path: fundamentals → community → project →
   hackathon → mentor → internship. This framing overlaps with the
   Digital Bridge Africa / Discovery Board work and could fold in there
   rather than staying a separate concept.

## Why this is buildable in 24 hours

The three source repos (ChiefFlow AI, german_ambient_coach Flutter app,
CreativeBridge AI) between them already contain: an orchestration loop,
tiered AI routing across four providers, an audit-trail data model, a
working background/notification mechanism with STT/TTS, and a generation
API + UI shell. The build is largely re-labelling and wiring existing,
working mechanisms rather than writing them from scratch. See
REUSE_MAP.md for the detailed breakdown and ARCHITECTURE.md for the
target system design.
