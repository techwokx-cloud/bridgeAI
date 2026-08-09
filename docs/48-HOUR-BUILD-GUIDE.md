# VitalityBridge — 48-Hour Build Guide

## What's Been Built

### ✅ Completed (Files Ready)

**Landing Page** (`app/page.tsx`)
- Hero section with robot companion
- 5 domain categories (Personal, Family, Work, Friendships, Other)
- How-it-works section with 6-step journey
- Privacy/design philosophy
- Final CTA section
- Responsive design

**Dashboard Home** (`app/app/page.tsx`)
- Welcome with user greeting
- Hero card with companion integration
- Today's Focus tasks (checkbox system)
- Life Map domain selector (5 categories)
- Your Journey section
- Progress tracking
- Privacy assurance card

**Conversation Interface** (`app/app/conversation/page.tsx`)
- Robot companion visual with state animations
- Reflection boxes (AI thinking out loud)
- User thought cards
- Quick action buttons (4 modes)
- Voice input (hold-to-record UI)
- Companion context panel (right sidebar)
  - Companion status
  - Emerging themes/patterns
  - Current journey tracking
  - Mood selector (5-point)

**Navigation** 
- Sidebar with 7 main sections
- Topbar with search and user menu
- Mobile-responsive design

**Authentication**
- Sign-in page template
- User profile section

### 🟡 Next Steps (48-Hour Priorities)

#### Hours 0–4: Foundation
```
✅ Repository structure
✅ Next.js setup + TypeScript
✅ Tailwind configuration
✅ Database schema (basic SQLite/Supabase choice needed)
✅ Environment variables
⚪ API routing structure
⚪ Deployment pipeline
```

**Action:** Pick auth/DB: JWT+SQLModel or Supabase

#### Hours 4–10: Companion Engine
```
✅ Robot component with states
✅ FSM (idle → listening → thinking → speaking)
✅ Visual feedback (animations, mood indicators)
⚪ Companion context integration
⚪ State persistence across pages
```

**Action:** Wire robot state to conversation flow

#### Hours 10–16: AI + Voice
```
⚪ Ollama/local LLM setup
⚪ Whisper STT integration
⚪ Local TTS (Kokoro/Piper)
⚪ Web Audio API for recording
⚪ Streaming response handling
⚪ Live captions
```

**Action:** Get local AI stack running

#### Hours 16–23: Life Map
```
⚪ Situation extraction from conversation
⚪ SVG node graph visualization
⚪ Tech Proxy (robot) navigation
⚪ Interactive node selection
⚪ Pattern emergence UI
```

**Action:** Build interactive visualization

#### Hours 23–29: Action Loop
```
⚪ Next Step extraction from AI
⚪ Conversation Practice interface
⚪ "What Happened?" capture form
⚪ Outcome reflection
⚪ Replan triggers
```

**Action:** Implement core loop

#### Hours 29–34: Character Magic
```
✅ Robot hover/idle animations
⚪ Screen knock (notification)
⚪ Touch reactions
⚪ Emotion expressions
⚪ Human ↔ Robot morph transition
```

**Action:** Polish companion animations

#### Hours 34–39: Journey + Memory
```
⚪ Conversation history timeline
⚪ Important memory extraction
⚪ Open loops tracking
⚪ Previous outcomes reference
⚪ Pattern visualization over time
```

**Action:** Build memory layer

#### Hours 39–44: Polish
```
⚪ Typography refinement
⚪ Spacing/layout tweaks
⚪ Mobile responsive fixes
⚪ Loading states
⚪ Error states
⚪ Empty states
⚪ Accessibility (ARIA labels)
⚪ Reduced motion support
⚪ Performance optimization
```

**Action:** Test on real devices

#### Hours 44–48: Demo Lock
```
⚪ Bug fixes only
⚪ Voice testing (ensure it works)
⚪ AI response testing
⚪ Life Map testing
⚪ Companion behavior testing
⚪ Deployment testing
⚪ Demo account setup
⚪ Backup deployment
```

**Action:** Prepare demo scenario

---

## Demo Scenario (Use this for testing)

**"My teenage son has stopped talking to me and I'm worried we're losing our relationship."**

### Flow to demo:
1. **Talk** — User speaks the concern
2. **Understand** — AI identifies: Relationship / Distance / Communication concern / Goal: reconnect
3. **Tech Proxy** — Robot transitions into Life Map
4. **Life Map** — Shows: YOU → SON → LESS COMMUNICATION → WORRY → RECONNECT (5-node graph)
5. **Next Step** — Suggest: "Send a short message today asking about their day" (5 min action)
6. **Practice** — Robot becomes the son; user practices the opening
7. **What Happened?** — User reports result (went well / some progress / didn't work)
8. **Replan** — If didn't work: "Let's understand what got in the way"
9. **Journey** — Timeline shows: Concern → Practice → Outcome → Learning

This tells the complete: **Understand → Act → Outcome → Learn → Replan** loop.

---

## Tech Stack Decisions (MUST DECIDE NOW)

### Auth + Database
```
Option A: ChiefFlow's approach
- JWT tokens (security.py pattern)
- SQLModel + SQLite
- Custom user management
- Simpler deployment

Option B: CreativeBridge's approach
- Supabase (PostgreSQL + Auth)
- Realtime subscriptions
- Built-in multi-user
- More features, more setup

RECOMMENDATION: Use Option A for 48-hour build (simpler)
Switch to Supabase later if you need realtime/collaboration.
```

### AI Provider (48-hour scope)
```
Local-first approach (use one):
- Ollama + Mistral-7B or Llama-2-7B
  (Fast on Mac/Linux, ~4GB VRAM needed)
  
Alternative:
- Groq API (free tier, fast inference)
  (Requires API key, ~50 req/min free)

DO NOT attempt: Multiple providers in 48 hours
DO NOT attempt: Cloud models as primary (adds latency, needs keys)

RECOMMENDATION: Start with Groq (simplest deployment),
add Ollama fallback if internet fails during demo.
```

### Voice (STT + TTS)
```
STT:
- Whisper Web (browser-based, 75MB model)
  or Whisper API (Groq supports it)

TTS:
- Piper (offline, sounds natural)
- Kokoro (if you need voices)

RECOMMENDATION: Whisper browser + Piper for 48 hours
(No server dependency, works offline)
```

---

## File Structure (Expected After 48h)

```
VitalityBridge/
├── app/
│   ├── globals.css                    ✅
│   ├── layout.tsx                     ✅
│   ├── page.tsx                       ✅ (landing)
│   │
│   ├── app/
│   │   ├── layout.tsx                 ✅
│   │   ├── page.tsx                   ✅ (dashboard)
│   │   ├── conversation/
│   │   │   ├── page.tsx               ✅
│   │   │   └── route.ts               ⚪ (API: POST message)
│   │   ├── lifemap/
│   │   │   ├── page.tsx               ⚪
│   │   │   └── route.ts               ⚪ (API: GET life graph)
│   │   ├── practice/
│   │   │   └── page.tsx               ⚪
│   │   └── journey/
│   │       └── page.tsx               ⚪
│   │
│   ├── api/
│   │   ├── ai/
│   │   │   ├── route.ts               ⚪ (POST: completion, streaming)
│   │   │   └── router.ts              ⚪ (provider selection logic)
│   │   ├── companion/
│   │   │   ├── context/route.ts       ⚪ (GET: emerging themes)
│   │   │   ├── next-step/route.ts     ⚪ (POST: extract action)
│   │   │   └── reflect/route.ts       ⚪ (POST: outcome capture)
│   │   ├── auth/
│   │   │   ├── signup/route.ts        ⚪
│   │   │   ├── signin/route.ts        ⚪
│   │   │   └── logout/route.ts        ⚪
│   │   └── memory/
│   │       └── route.ts               ⚪ (POST/GET memories)
│   │
│   └── signin/
│       └── page.tsx                   ✅
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx                ✅
│   │   └── topbar.tsx                 ✅
│   ├── companion/
│   │   ├── robot.tsx                  ⚪ (full 3D/animated robot)
│   │   ├── states.tsx                 ⚪ (FSM visualizer)
│   │   └── thoughts.tsx               ⚪ (AI reflection cards)
│   ├── lifemap/
│   │   ├── graph.tsx                  ⚪ (SVG node visualization)
│   │   └── nodes.tsx                  ⚪ (interactive nodes)
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
│
├── lib/
│   ├── ai/
│   │   ├── groq.ts                    ⚪ (Groq client)
│   │   ├── ollama.ts                  ⚪ (Ollama fallback)
│   │   └── prompt-templates.ts        ⚪ (system prompts)
│   ├── audio/
│   │   ├── whisper.ts                 ⚪ (STT)
│   │   ├── piper.ts                   ⚪ (TTS)
│   │   └── recorder.ts                ⚪ (Web Audio API)
│   ├── db/
│   │   ├── schema.ts                  ⚪ (SQLite schema)
│   │   ├── client.ts                  ⚪ (DB connection)
│   │   └── migrations/                ⚪
│   └── utils/
│       ├── companion-logic.ts         ⚪ (FSM, state)
│       ├── extract-actions.ts         ⚪ (NLP for next steps)
│       └── pattern-detect.ts          ⚪ (theme extraction)
│
├── public/
│   └── models/
│       └── whisper.tflite             ⚪ (or reference Groq)
│
├── package.json                       ✅
├── tsconfig.json                      ✅
├── tailwind.config.ts                 ✅
├── postcss.config.mjs                 ✅
├── next.config.ts                     ✅
├── .env.example                       ⚪
└── README.md                          ⚪
```

---

## Critical Implementation Notes

### 1. Companion State Machine
```typescript
type CompanionState = "idle" | "listening" | "thinking" | "speaking" | "reflecting";

// Wire to:
// - Robot animation
// - UI feedback
// - Audio playback
// - Context panel updates
```

### 2. Conversation Flow
```
User Input (text/voice)
  ↓
STT (if voice)
  ↓
Store in memory
  ↓
Send to AI with context
  ↓
Stream response + captions
  ↓
Extract patterns/themes
  ↓
Companion responds + TTS
  ↓
Update journey/memory
```

### 3. Database Schema (Minimal)
```sql
users
├── id (UUID)
├── email
├── created_at

conversations
├── id
├── user_id
├── domain (personal/family/work/etc)
├── started_at
├── updated_at

messages
├── id
├── conversation_id
├── role (user/companion)
├── content
├── created_at

memories (open loops)
├── id
├── user_id
├── topic
├── action
├── target_date
├── outcome
├── status (open/completed)
```

### 4. Companion Policy Engine (Simplified for 48h)
```typescript
shouldReachOut(user, openLoop) {
  // For demo: simple rules only
  if (!openLoop.hasBeenThisWeek()) return false;
  if (userWasOnlineToday()) return false;
  if (openLoop.targetDateIsSoon()) return true;
  return false;
}
```

---

## Success Criteria (Demo Must Show)

- [ ] Landing page loads cleanly
- [ ] Can sign in (even with mock account)
- [ ] Dashboard shows 5 domain categories
- [ ] Can start a conversation
- [ ] Robot companion appears and animates
- [ ] Can type or speak input
- [ ] AI responds (using Groq or local Ollama)
- [ ] Response appears with captions
- [ ] Robot mouth/eyes react to AI state
- [ ] "What Happened?" capture works
- [ ] Companion panel shows emerging themes
- [ ] Journey timeline appears
- [ ] Mobile responsive (looks good on phone)
- [ ] No console errors

---

## Deployment (After 48h)

**Option 1: Vercel** (recommended)
```bash
vercel deploy
```
- Free tier: 100GB bandwidth/month
- Auto-deploys from git
- Works with serverless functions

**Option 2: Railway**
- $5/month starter
- PostgreSQL support
- Easy secrets management

**Option 3: Fly.io**
- Free tier with credit
- Global deployment
- Works with containers

---

## What NOT to Do in 48 Hours

❌ Build mobile Flutter app (web only)
❌ Integrate 6 AI providers
❌ Build perfect 3D robot model (SVG/CSS fine)
❌ Full production memory system (basic version only)
❌ Multi-user collaboration features
❌ Advanced safety/moderation system
❌ Analytics/tracking infrastructure
❌ Payment system

**These are post-hackathon features.**

---

## Team Communication (If Multi-Person)

**Person 1: Frontend/UI**
- Landing page
- Dashboard
- Conversation UI
- Companion animations
- Mobile responsiveness

**Person 2: AI/Backend**
- AI integration (Groq/Ollama)
- Prompt engineering
- Pattern extraction
- Memory layer
- API routes

**Person 3: DevOps/Glue**
- Database setup
- Authentication flow
- Audio pipeline (STT/TTS)
- Deployment
- Environment config

---

## Debug Checklist

If something breaks:

1. **AI not responding?**
   - Check Groq API key
   - Check internet connection
   - Fall back to Ollama
   - Check token limit

2. **Voice not working?**
   - Check microphone permissions
   - Test in Chrome (best support)
   - Check browser console
   - Test with mock audio first

3. **Robot not animating?**
   - Check CSS animations loaded
   - Verify state updates flowing
   - Check React keys

4. **Database errors?**
   - Check schema matches queries
   - Check credentials in .env
   - Try SQLite locally first

5. **Deployment fails?**
   - Check Node version matches
   - Check all .env vars set
   - Try `npm run build` locally first

---

## Final Checklist Before Demo

- [ ] All .env values set (no hardcoded secrets)
- [ ] Test conversation flow end-to-end
- [ ] Test with demo scenario
- [ ] Test voice input (record + playback)
- [ ] Test on mobile device
- [ ] Test on different browser
- [ ] Screenshot fallback plan if live API fails
- [ ] Backup deployment URL ready
- [ ] Demo script written (2-3 min walkthrough)
- [ ] Camera angle practiced (if presenting)
- [ ] Backup demo video recorded (just in case)

---

Good luck! You've got this. 🚀
