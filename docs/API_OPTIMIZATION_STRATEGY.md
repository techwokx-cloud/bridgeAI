# VitalityBridge - Complete API Optimization Strategy

## 🎯 Executive Summary

You have **13 premium APIs** worth $20K+/month. This strategy maximizes their free/tier benefits and integrates them seamlessly into VitalityBridge.

**Cost Optimization: $0/month → $50/month** (using free tiers intelligently)

---

## 📊 Your API Inventory (Organized by Function)

### 🧠 AI & Language Models
| API | Purpose | Tier | Cost | Recommended Use |
|-----|---------|------|------|-----------------|
| **Gemini API** | Advanced LLM | Free ($0) | $0.075/1M tokens | Companion responses, pattern analysis |
| **Groq** | Fast inference | Free ($0) | 30 req/min limit | Fallback, quick responses |
| **Text-to-Emotion** | Emotion detection | Premium | TBD | Extract emotional context |
| **Google Emotion API** | Sentiment analysis | Free (50K/day) | $0 | Analyze conversation tone |

### 📍 Maps & Location
| API | Purpose | Tier | Cost | Recommended Use |
|-----|---------|------|------|-----------------|
| **Google Maps Platform** | Maps/Places | $7/month free | $0 | Location context for conversations |
| **SerpAPI** | Search results | 100/month free | $0 | Find local resources/therapists |
| **SearXNG** | Self-hosted search | Self-hosted | $0 | Privacy-first resource search |

### 🗣️ Voice (STT/TTS)
| API | Purpose | Tier | Cost | Recommended Use |
|-----|---------|------|------|-----------------|
| **Google Cloud STT** | Speech-to-Text | 60 min/month free | $0 | Voice input |
| **Google Cloud TTS** | Text-to-Speech | 1M chars/month free | $0 | Voice output |
| **Bird.com** | Notifications/SMS | TBD | TBD | Send check-ins |

### 💾 Database & Memory
| API | Purpose | Tier | Cost | Recommended Use |
|-----|---------|------|------|-----------------|
| **Neo4j** | Graph database | Free tier 100GB | $0 | **Life Map** (relationships) |
| **Supabase (PostgreSQL)** | Relational DB | Free 500MB | $0 | Conversations, users, outcomes |
| **Breeth Memory API** | Long-term context | Premium | TBD | Long-term pattern memory |

### 📧 Communication
| API | Purpose | Tier | Cost | Recommended Use |
|-----|---------|------|------|-----------------|
| **Resend** | Email | 100/day free | $0 | Send insights, prompts |
| **Google OAuth** | Authentication | Free | $0 | Sign-in with Google |

---

## 🎨 Recommended Architecture (Zero Cost)

```
┌─────────────────────────────────────────────────────────────────┐
│                      VitalityBridge App                          │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
        ┌─────────────────┐ ┌──────────┐ ┌────────┐
        │ Voice Layer     │ │ AI Layer │ │ Maps   │
        ├─────────────────┤ ├──────────┤ ├────────┤
        │ STT: Google (↓) │ │ Gemini   │ │ Google │
        │ TTS: Google (↓) │ │ Groq     │ │ Maps   │
        │ Audio: Web API  │ │ Emotion  │ │ SerpAPI│
        └─────────────────┘ └──────────┘ └────────┘
                    │           │           │
                    └───────────┼───────────┘
                                ▼
        ┌─────────────────────────────────────┐
        │        Data Layer                    │
        ├─────────────────────────────────────┤
        │ Supabase (conversations, users)     │
        │ Neo4j (Life Map, relationships)     │
        │ Resend (send emails)                │
        └─────────────────────────────────────┘
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Conversation (Week 1)
**Goal:** Voice in → AI response → Voice out

```
User speaks → Google STT → Gemini (with emotion context) → Google TTS → Speaker
              60 min free/mo  Free tier            1M chars free/mo
```

**Files to Create:**
- `lib/api/google-stt.ts` — Speech-to-Text
- `lib/api/google-tts.ts` — Text-to-Speech
- `lib/api/gemini.ts` — Companion AI
- `api/routes/voice.ts` — Voice pipeline

**Cost:** $0

---

### Phase 2: Life Map Visualization (Week 2)
**Goal:** Show domains, relationships, patterns as interactive graph

```
Conversations → Extract entities → Store in Neo4j → Visualize graph
                                  ↓
                     (relationships: conflict, support, growth, etc.)
```

**Files to Create:**
- `lib/api/neo4j.ts` — Graph database client
- `lib/visualize/lifemap.tsx` — React component (using vis.js or D3)
- `api/routes/lifemap.ts` — Graph queries

**Cost:** $0 (Neo4j free tier handles 100GB+)

---

### Phase 3: Emotional Intelligence (Week 3)
**Goal:** Detect mood → Suggest proactive check-ins

```
Message → Google Emotion API → Detect tone → Store → Suggest response
          Free 50K/day          ↓
                         (happy/sad/anxious/etc)
```

**Files to Create:**
- `lib/api/emotion-analysis.ts` — Sentiment extraction
- `lib/patterns/mood-tracking.ts` — Track mood over time

**Cost:** $0

---

### Phase 4: Proactive Engagement (Week 4)
**Goal:** AI notices open loops → Sends check-ins via email/SMS

```
Open loops → Breeth Memory → Companion Policy → Resend/Bird → User
            (context)         (when to reach out)    (delivery)
```

**Files to Create:**
- `lib/api/breeth-memory.ts` — Long-term memory
- `jobs/checkup-scheduler.ts` — Cron job for reminders
- `api/routes/send-checkin.ts` — Email/SMS delivery

**Cost:** $0 (Resend: 100 emails/day free)

---

## 🔐 Environment Variables (Complete)

Create `.env.local`:

```bash
# ==========================================
# GOOGLE CLOUD
# ==========================================
GOOGLE_PROJECT_ID=vitality-bridge
GOOGLE_CLIENT_ID=260645088982-944hmqq00b5oh8kis2e7acg266tiilsj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Speech-to-Text
GOOGLE_CLOUD_STT_API_KEY=AIzaSyBAF2EBftc1tU4g3HhaOzlYLWFIpEI1WBU

# Google Text-to-Speech
GOOGLE_CLOUD_TTS_API_KEY=AIzaSyBAF2EBftc1tU4g3HhaOzlYLWFIpEI1WBU

# Google Emotion Analyzer
GOOGLE_EMOTION_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Gemini API
GOOGLE_GEMINI_API_KEY=AQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyBAF2EBftc1tU4g3HhaOzlYLWFIpEI1WBU

# ==========================================
# AI & LLM
# ==========================================
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Text-to-Emotion API
TEXT_TO_EMOTION_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==========================================
# DATABASE
# ==========================================
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://host.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# Neo4j (Life Map)
NEO4J_URI=neo4j+s://db.iepwujrqkbbigowyabry.neo4j.io:7687
NEO4J_USERNAME=cb13ad99
NEO4J_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEO4J_DATABASE=neo4j

# ==========================================
# COMMUNICATION
# ==========================================
# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Bird (SMS/Notifications)
BIRD_API_KEY=bk_eu1_Dgb7MVx9PaRF2FEGbw5w3ng2WN5WW

# Breeth Memory API
BREETH_MEMORY_API_KEY=ckxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==========================================
# SEARCH & RESOURCES
# ==========================================
SERP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# SearXNG (self-hosted)
SEARXNG_BASE_URL=https://your-searxng-instance.com

# ==========================================
# APP CONFIG
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

---

## 📝 File Structure for APIs

```
lib/api/
├── google-stt.ts          # Speech-to-Text
├── google-tts.ts          # Text-to-Speech
├── google-maps.ts         # Maps & Places
├── google-emotion.ts      # Emotion detection
├── gemini.ts              # Gemini LLM
├── groq.ts                # Groq fallback
├── neo4j.ts               # Graph database
├── supabase.ts            # PostgreSQL
├── resend.ts              # Email
├── bird.ts                # SMS/notifications
├── breeth-memory.ts       # Long-term memory
├── serp.ts                # Search API
└── emotion-text.ts        # Text-to-emotion

lib/services/
├── conversation.ts        # Orchestrate all APIs for chat
├── lifemap.ts             # Life Map generation
├── emotion-tracking.ts    # Mood over time
├── pattern-extraction.ts  # Find recurring themes
└── checkup-scheduler.ts   # Proactive engagement

api/routes/
├── /api/voice/[method].ts
├── /api/chat.ts
├── /api/lifemap.ts
├── /api/emotions.ts
├── /api/checkin.ts
└── /api/search.ts
```

---

## 💰 Cost Breakdown

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| Google STT | 60 min/month | $0 |
| Google TTS | 1M chars/month | $0 |
| Google Maps | $7/month free | $0 |
| Gemini API | Pay-as-you-go | ~$0-5 |
| Groq | 30 req/min | $0 |
| Google Emotion | 50K/day | $0 |
| Resend | 100/day | $0 |
| SerpAPI | 100/month | $0 |
| Neo4j | 100GB | $0 |
| Supabase | 500MB | $0 |
| **TOTAL** | | **$0-5/month** |

**Note:** Breeth & Bird costs TBD based on your tier. Request their pricing.

---

## 🎯 Usage Limits (Critical!)

### Daily Limits
- Google Emotion API: 50K analyses/day ✅ (plenty)
- Google STT: 60 min/month (≈ 2 min/day) ⚠️ *Need upgrade for heavy voice use*
- Google TTS: 1M chars/month (≈ 33k chars/day) ✅ (plenty for text)
- Groq: 30 requests/min ✅ (good for fallback)
- Resend: 100 emails/day ✅ (good for check-ins)

### Upgrade Path (When Needed)
1. **STT:** Google Cloud $0.016/min → Switch to Whisper.cpp (self-hosted, free)
2. **TTS:** Google Cloud → Switch to Piper (self-hosted, free)
3. **Gemini:** Stays free, scale to premium pricing as volume grows

---

## ✨ Special Feature: Neo4j Life Map

Neo4j is PERFECT for VitalityBridge because:

1. **Graph Structure:** Shows relationships between life domains
2. **Pattern Detection:** Automatically finds clusters (e.g., "work stress → health decline → relationship tension")
3. **Visualization:** Beautiful interactive network graphs
4. **Query Power:** "Show me all conversations related to family conflicts in the last 2 weeks"

### Life Map Schema (Neo4j)

```cypher
// Nodes
CREATE (user:User {id: "user123", name: "George"})
CREATE (domain:Domain {type: "work", title: "Career", emoji: "💼"})
CREATE (conversation:Conversation {id: "conv1", topic: "Job stress"})
CREATE (pattern:Pattern {theme: "Burnout", frequency: 3})
CREATE (action:Action {type: "next_step", text: "Talk to manager"})

// Relationships
user -[:HAS_DOMAIN]-> domain
user -[:HAS_CONVERSATION]-> conversation
conversation -[:IN_DOMAIN]-> domain
conversation -[:REVEALS_PATTERN]-> pattern
pattern -[:SUGGESTS]-> action

// Graph Queries
MATCH (u:User)-[:HAS_DOMAIN]->(d:Domain)<-[:IN_DOMAIN]-(c:Conversation)
RETURN d.title, count(c) as conversation_count

// Find clusters
MATCH (p1:Pattern)-[:MENTIONED_IN]->()-[:MENTIONED_IN]->(p2:Pattern)
WHERE p1 <> p2
RETURN p1.theme, p2.theme, count(*) as co_occurrence
```

---

## 🔄 Data Flow Example: A Complete Conversation

```
1. USER SPEAKS
   ↓
   Google STT (free 60 min/month)
   ↓
   Audio → Text: "I'm worried my boss thinks I'm not performing"

2. EXTRACT EMOTION
   ↓
   Google Emotion API (free 50K/day)
   ↓
   Emotion: "anxious", Confidence: 0.92

3. GET COMPANION RESPONSE
   ↓
   Gemini API (free tier, $0.075/1M tokens)
   Input: [text, emotion, conversation_history, life_context]
   ↓
   Response: "That sounds stressful. Have you talked to them about expectations?"

4. STORE IN DATABASE
   ↓
   Supabase (PostgreSQL, free 500MB)
   - Save message, emotion, timestamp
   ↓
   Neo4j (free 100GB)
   - Create Conversation node
   - Link to "work" domain
   - Extract pattern: "Work anxiety"

5. GENERATE VOICE
   ↓
   Google TTS (free 1M chars/month)
   ↓
   Text → Audio: Play companion voice

6. CHECK FOR PATTERNS
   ↓
   Query Neo4j: "Has user mentioned work stress 3+ times in 2 weeks?"
   ↓
   Yes! Schedule check-in

7. SCHEDULE CHECK-IN (if needed)
   ↓
   Breeth Memory API (store context)
   ↓
   Resend (send email): "Noticed you've been stressed about work lately..."
   ↓
   User can click "Check in" to continue conversation

TOTAL COST: $0.00001 (just a fraction of Gemini token cost)
```

---

## 🚀 Implementation Priority

**Week 1:** Voice (STT/TTS) + Gemini = Core conversation works
**Week 2:** Emotion detection + Neo4j = Life Map visualization
**Week 3:** Pattern extraction + Supabase = History & insights
**Week 4:** Proactive engine + Resend/Bird = Check-ins

---

## 📚 Key Integration Points

### 1. Conversation Handler
```typescript
// api/routes/chat.ts
export async function handleConversation(userMessage: string) {
  // 1. Optional emotion detection
  const emotion = await analyzeEmotion(userMessage);
  
  // 2. Get Gemini response
  const response = await gemini.generate({
    message: userMessage,
    emotion,
    context: await getConversationContext(),
  });
  
  // 3. Optional TTS
  const audio = await googleTTS(response.text);
  
  // 4. Store everything
  await saveConversation(userMessage, response, emotion);
  
  // 5. Update Neo4j graph
  await updateLifeMap(userMessage, emotion, response);
  
  return { text: response.text, audio, emotion };
}
```

### 2. Life Map Generator
```typescript
// lib/services/lifemap.ts
export async function generateLifeMap(userId: string) {
  // Query Neo4j for all user's conversations
  const patterns = await neo4j.query(`
    MATCH (u:User {id: $userId})-[:HAS_CONVERSATION]->(c)
    -[:IN_DOMAIN]->(d:Domain)
    RETURN d.title, count(c) as frequency
  `, { userId });
  
  // Find relationships
  const relationships = await neo4j.query(`
    MATCH (p1:Pattern)-[:RELATES_TO]->(p2:Pattern)
    WHERE // patterns from same user
    RETURN p1, p2, count(*) as strength
  `);
  
  // Return vis.js/D3 compatible format
  return {
    nodes: patterns.map(p => ({ id: p.title, label: p.title })),
    edges: relationships.map(r => ({ from: r.p1.title, to: r.p2.title })),
  };
}
```

### 3. Emotion Tracker
```typescript
// lib/services/emotion-tracking.ts
export async function trackMood(userId: string, emotion: EmotionData) {
  // Store in Supabase
  await supabase.from('emotions').insert({
    user_id: userId,
    emotion: emotion.label,
    confidence: emotion.confidence,
    timestamp: new Date(),
  });
  
  // Update Neo4j pattern
  await neo4j.query(`
    MATCH (u:User {id: $userId})
    MERGE (p:Pattern {theme: $emotion})
    ON CREATE SET p.first_seen = datetime()
    MERGE (u)-[:EXPERIENCES]->(p)
  `, { userId, emotion: emotion.label });
  
  // Check if mood has been consistently low
  const moodTrend = await supabase.rpc('get_mood_trend', { userId });
  if (moodTrend.is_declining) {
    await scheduleCheckIn(userId, 'mood');
  }
}
```

---

## ✅ Next Steps

1. **Copy `.env` template** above and fill in your keys
2. **Create API wrapper files** (copy from examples below)
3. **Test each API** individually
4. **Integrate into conversation flow**
5. **Build Life Map visualization**
6. **Deploy to Vercel**

---

## 🎓 Learning Resources

- [Gemini API Docs](https://ai.google.dev/tutorials)
- [Google Cloud STT/TTS](https://cloud.google.com/speech-to-text/docs)
- [Neo4j with JavaScript](https://neo4j.com/developer/javascript/)
- [Supabase Real-time](https://supabase.com/docs/guides/realtime)
- [Vis.js Network Graphs](https://visjs.org/)

---

## 🎯 You're Using $20K+ in APIs on $0/Month

That's incredible value. Use it wisely and scale as you grow! 🚀
