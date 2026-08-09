# VitalityBridge - 4-Week API Implementation Roadmap

**Total Estimated Cost: $0/month** (using free tiers)

---

## 🎯 Implementation Overview

This roadmap shows exactly how to implement all 13 APIs into VitalityBridge, prioritized by impact and dependency.

### API Checklist
- ✅ **Week 1:** Voice I/O (Google STT/TTS) + AI (Gemini) = Conversation works
- ⏳ **Week 2:** Emotion (Google NLP) + Neo4j = Life Map visualizes
- ⏳ **Week 3:** Database (Supabase) + Memory = History preserved
- ⏳ **Week 4:** Engagement (Resend) + Search (SerpAPI) = Proactive & resources

---

## 📅 Week 1: Voice & Conversation (Foundation)

### Goal
User speaks → AI responds → Voice plays back

### Deliverables
1. **Voice Input** (STT)
2. **AI Response** (Gemini)
3. **Voice Output** (TTS)
4. **Conversation UI** (already exists)

### Step-by-Step Implementation

#### 1.1 Set Up Google Cloud SDK

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authenticate
gcloud auth login
gcloud config set project vitality-bridge

# Enable APIs
gcloud services enable speech.googleapis.com texttospeech.googleapis.com language.googleapis.com
```

#### 1.2 Install Dependencies

```bash
npm install \
  @google-cloud/speech \
  @google-cloud/text-to-speech \
  @google-cloud/language \
  groq-sdk
```

#### 1.3 Update `.env.local`

```bash
# From your credentials file
GOOGLE_CLOUD_STT_API_KEY=AIzaSyBAF2EBftc1tU4g3HhaOzlYLWFIpEI1WBU
GOOGLE_CLOUD_TTS_API_KEY=AIzaSyBAF2EBftc1tU4g3HhaOzlYLWFIpEI1WBU
GOOGLE_GEMINI_API_KEY=AQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 1.4 Create Voice Handler API Route

```typescript
// app/api/voice/transcribe.ts
import { speechToText } from "@/lib/api/google-voice";

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get("audio") as Blob;
  
  const buffer = Buffer.from(await audioFile.arrayBuffer());
  const result = await speechToText(buffer);
  
  return Response.json(result);
}
```

#### 1.5 Create Conversation Handler

```typescript
// app/api/chat.ts
import { handleConversationTurn } from "@/lib/services/conversation-orchestrator";

export async function POST(request: Request) {
  const { userId, message, conversationId, domain } = await request.json();
  
  const response = await handleConversationTurn(
    userId,
    message,
    conversationId,
    domain,
    { includeAudio: true }
  );
  
  return Response.json(response);
}
```

#### 1.6 Update Conversation Component

```tsx
// app/app/conversation/page.tsx
"use client";

import { useState, useRef } from "react";
import { MiniRobot } from "@/components/robot/mini-robot";

export default function ConversationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder>();
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = handleSendAudio;

    recorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSendAudio = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
    
    const formData = new FormData();
    formData.append("audio", audioBlob);

    // Transcribe
    const transcribeRes = await fetch("/api/voice/transcribe", {
      method: "POST",
      body: formData,
    });
    const { text } = await transcribeRes.json();

    // Send to chat
    const chatRes = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        userId: "user123",
        message: text,
        conversationId: "conv1",
        domain: "personal",
      }),
    });
    const { message, audioUrl } = await chatRes.json();

    // Play response
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <MiniRobot state={isRecording ? "listening" : "idle"} size="lg" />
      
      <button
        onClick={handleStartRecording}
        disabled={isRecording}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg"
      >
        {isRecording ? "Recording..." : "Start Speaking"}
      </button>

      {isRecording && (
        <button
          onClick={handleStopRecording}
          className="px-6 py-2 bg-red-500 text-white rounded-lg"
        >
          Stop
        </button>
      )}
    </div>
  );
}
```

#### 1.7 Test Locally

```bash
npm run dev

# Open http://localhost:3000/app/conversation
# Click "Start Speaking"
# Say something like: "I'm feeling stressed about work"
# Should hear back: "That sounds stressful..."
```

### Cost at End of Week 1
- Google STT: 5-10 minutes used (60 min/month free) ✅
- Google TTS: ~100K characters (1M/month free) ✅
- Gemini: ~$1-2 (free tier) ✅
- **Total: $0-2**

---

## 📅 Week 2: Emotion & Life Map

### Goal
Visualize emotional patterns and relationships as interactive graph

### Deliverables
1. **Emotion Detection** (Google NLP)
2. **Neo4j Integration** (Store relationships)
3. **Life Map Component** (Vis.js visualization)
4. **Patterns Detection** (Emerging themes)

### Step-by-Step Implementation

#### 2.1 Initialize Neo4j

```bash
# Download Neo4j Desktop or use Aura (free)
# https://neo4j.com/cloud/aura-free/

# Create project, get connection string
export NEO4J_URI=neo4j+s://db.xxx.neo4j.io:7687
export NEO4J_USERNAME=neo4j
export NEO4J_PASSWORD=xxx
```

#### 2.2 Install Neo4j Driver

```bash
npm install neo4j-driver
```

#### 2.3 Initialize User Graph

```typescript
// Create this in user signup flow
import { initializeUserGraph } from "@/lib/api/neo4j";

export async function setupUser(userId: string) {
  await initializeUserGraph(userId);
}
```

#### 2.4 Create Life Map Component

```tsx
// components/lifemap/life-map-visualization.tsx
"use client";

import { useEffect, useRef } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { LifeMapData } from "@/lib/api/neo4j";

export function LifeMapVisualization({ data }: { data: LifeMapData }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = new DataSet(
      data.nodes.map((node) => ({
        id: node.id,
        label: node.label,
        title: node.label,
        color: node.color,
        size: node.size || 40,
        font: { size: 14 },
      }))
    );

    const edges = new DataSet(
      data.edges.map((edge) => ({
        from: edge.from,
        to: edge.to,
        label: edge.label,
        title: `${edge.label} (${edge.weight || 1}x)`,
        width: Math.min((edge.weight || 1) * 2, 5),
      }))
    );

    const network = new Network(
      containerRef.current,
      { nodes, edges },
      {
        physics: {
          enabled: true,
          stabilization: { iterations: 200 },
        },
        interaction: { hover: true, navigationButtons: true },
      }
    );

    return () => network.destroy();
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "600px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    />
  );
}
```

#### 2.5 Add Life Map Page

```tsx
// app/app/lifemap/page.tsx
"use client";

import { useEffect, useState } from "react";
import { LifeMapVisualization } from "@/components/lifemap/life-map-visualization";
import { getUserLifeMap } from "@/lib/services/conversation-orchestrator";

export default function LifeMapPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLifeMap() {
      const userId = "user123"; // Get from session
      const lifeMapData = await getUserLifeMap(userId);
      setData(lifeMapData);
      setLoading(false);
    }

    loadLifeMap();
  }, []);

  if (loading) return <div>Loading your life map...</div>;
  if (!data) return <div>No data yet. Start a conversation first!</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Your Life Map</h1>
      <p className="text-gray-600 mb-6">
        Visual representation of your life domains, patterns, and relationships
      </p>
      <LifeMapVisualization data={data} />
    </div>
  );
}
```

#### 2.6 Update Conversation Orchestrator

```typescript
// In conversation-orchestrator.ts, add emotion logging
const patterns = [];
if (emotion.primary === "sadness" && emotion.intensity > 0.7) {
  patterns.push("Emotional difficulty");
  await addPattern(userId, "Sadness", 1, "😢");
}

if (sentiment.magnitude > 0.8) {
  patterns.push("Strong emotion");
  await addPattern(userId, "Intense feelings", 1, "⚡");
}

// Link related patterns
if (patterns.length > 1) {
  await linkPatterns(patterns[0], patterns[1], 1);
}
```

#### 2.7 Test

```bash
npm run dev

# Open http://localhost:3000/app/lifemap
# Should see interactive graph with nodes and edges
```

### Cost at End of Week 2
- Google NLP: 50 analyses (50K/day free) ✅
- Neo4j: <1GB used (free) ✅
- **Running Total: $0-2**

---

## 📅 Week 3: Persistence & History

### Goal
Save all conversations and history to Supabase

### Deliverables
1. **Database Schema** (already created)
2. **Message Storage** (Supabase)
3. **Conversation History** (UI)
4. **Memory Retrieval** (Context for future chats)

### Step-by-Step Implementation

#### 3.1 Run Supabase Schema

Already created in Week 1, just run:

```bash
# In Supabase Dashboard → SQL Editor
# Paste contents of lib/supabase/schema.sql
# Execute
```

#### 3.2 Verify Tables

```sql
-- Check created tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Should see: conversations, messages, emotions, open_loops, patterns, outcomes, journey_events, life_domains, etc.
```

#### 3.3 Add Conversation History UI

```tsx
// components/conversation/message-list.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function MessageList({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      setMessages(data || []);
    }

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-4 rounded-lg ${
            msg.role === "user"
              ? "bg-blue-100 ml-auto"
              : "bg-gray-100"
          } max-w-md`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}
```

#### 3.4 Add Emotion Timeline

```tsx
// components/conversation/emotion-timeline.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function EmotionTimeline({ conversationId }: { conversationId: string }) {
  const [emotions, setEmotions] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadEmotions() {
      const { data: messages } = await supabase
        .from("messages")
        .select("id, created_at")
        .eq("conversation_id", conversationId)
        .eq("role", "user");

      if (!messages) return;

      const { data: emotionData } = await supabase
        .from("emotions")
        .select("*")
        .in("message_id", messages.map((m) => m.id));

      setEmotions(emotionData || []);
    }

    loadEmotions();
  }, [conversationId, supabase]);

  return (
    <div className="flex gap-2">
      {emotions.map((emotion, i) => (
        <div
          key={i}
          title={`${emotion.emotion} (${(emotion.intensity * 100).toFixed(0)}%)`}
          className={`
            w-8 h-8 rounded-full text-xs flex items-center justify-center
            ${
              emotion.emotion === "joy"
                ? "bg-yellow-200"
                : emotion.emotion === "sadness"
                  ? "bg-blue-200"
                  : emotion.emotion === "anger"
                    ? "bg-red-200"
                    : emotion.emotion === "fear"
                      ? "bg-purple-200"
                      : "bg-gray-200"
            }
          `}
        >
          {emotion.emotion[0].toUpperCase()}
        </div>
      ))}
    </div>
  );
}
```

#### 3.5 Test Persistence

```bash
npm run dev

# Start conversation, send messages
# Refresh page → messages still there
# Check Supabase dashboard → data in tables
```

### Cost at End of Week 3
- Supabase: <100MB used (500MB/month free) ✅
- **Running Total: $0-2**

---

## 📅 Week 4: Proactive Engagement & Discovery

### Goal
Send check-ins and find resources

### Deliverables
1. **Email Check-ins** (Resend)
2. **Resource Finder** (SerpAPI + Google Maps)
3. **Proactive Scheduler** (Cron job)
4. **Conversation Suggestions** (Based on open loops)

### Step-by-Step Implementation

#### 4.1 Set Up Resend

```bash
# Already have API key from credentials
# No setup needed!
```

#### 4.2 Create Check-in Sender

```typescript
// lib/services/checkin-scheduler.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCheckIn(userId: string, email: string) {
  const subject = "Checking in - VitalityBridge";
  const html = `
    <h2>Hi there!</h2>
    <p>I noticed we talked about some challenging things recently.</p>
    <p>How are you doing today? Click below to continue our conversation.</p>
    <a href="https://vitalitybridge.app/app/conversation" 
       style="display: inline-block; padding: 10px 20px; background: #6d5ef8; color: white; border-radius: 4px; text-decoration: none;">
      Continue Conversation
    </a>
  `;

  await resend.emails.send({
    from: "companion@vitalitybridge.app",
    to: email,
    subject,
    html,
  });
}
```

#### 4.2 Create Check-in Scheduler

```typescript
// app/api/cron/send-checkins.ts (Vercel Cron)
export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ unauthorized: true }, { status: 401 });
  }

  const supabase = createClient();

  // Find users with open loops from past week
  const { data: openLoops } = await supabase
    .from("open_loops")
    .select("user_id, users!inner(email)")
    .eq("status", "open")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (!openLoops) return Response.json({ sent: 0 });

  // Send check-in to each user
  let sent = 0;
  for (const loop of openLoops) {
    await sendCheckIn(loop.user_id, loop.users.email);
    sent++;
  }

  return Response.json({ sent });
}
```

#### 4.3 Set Up Cron (Vercel)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/send-checkins",
      "schedule": "0 9 * * *" // Daily at 9am UTC
    }
  ]
}
```

#### 4.4 Resource Finder

```typescript
// lib/services/resource-finder.ts
import { SerpAPI } from "@/lib/api/serp";

export async function findLocalTherapists(
  topic: string,
  location: string
): Promise<Array<{ name: string; url: string; rating: string }>> {
  const query = `therapist ${topic} near ${location}`;

  const results = await SerpAPI.search(query);

  return results.organic_results
    .slice(0, 5)
    .map((r: any) => ({
      name: r.title,
      url: r.link,
      rating: r.rating || "N/A",
    }));
}

export async function findSupportGroups(
  topic: string,
  location: string
): Promise<Array<{ name: string; link: string; type: string }>> {
  const results = [];

  // Search for support groups
  const searchResults = await SerpAPI.search(
    `${topic} support group ${location}`
  );

  for (const result of searchResults.organic_results.slice(0, 3)) {
    results.push({
      name: result.title,
      link: result.link,
      type: "support-group",
    });
  }

  return results;
}
```

#### 4.5 Add Resources Page

```tsx
// app/app/resources/page.tsx
"use client";

import { useState } from "react";
import { findLocalTherapists, findSupportGroups } from "@/lib/services/resource-finder";

export default function ResourcesPage() {
  const [topic, setTopic] = useState("stress");
  const [location, setLocation] = useState("Accra, Ghana");
  const [therapists, setTherapists] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    const [therapistResults, groupResults] = await Promise.all([
      findLocalTherapists(topic, location),
      findSupportGroups(topic, location),
    ]);
    setTherapists(therapistResults);
    setGroups(groupResults);
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Find Resources</h1>

      <div className="space-y-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What are you looking for help with?"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          {loading ? "Searching..." : "Find Resources"}
        </button>
      </div>

      {therapists.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Therapists & Counselors</h2>
          <div className="space-y-2">
            {therapists.map((t, i) => (
              <a
                key={i}
                href={t.url}
                target="_blank"
                className="block p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="font-bold">{t.name}</div>
                <div className="text-sm text-gray-600">Rating: {t.rating}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {groups.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Support Groups</h2>
          <div className="space-y-2">
            {groups.map((g, i) => (
              <a
                key={i}
                href={g.link}
                target="_blank"
                className="block p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="font-bold">{g.name}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 4.6 Deploy to Vercel

```bash
git add .
git commit -m "Add all API integrations: voice, emotion, lifemap, persistence, engagement"
git push origin main

# Go to https://vercel.com
# Import repo
# Add environment variables
# Deploy!
```

### Cost at End of Week 4
- Resend: ~30 emails sent (100/day free) ✅
- SerpAPI: 10 searches (100/month free) ✅
- **Final Total: $0-2**

---

## 📊 Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   VitalityBridge App                        │
│  (Landing → Dashboard → Conversation → Life Map → Resources)│
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    ┌─────────┐  ┌──────────┐  ┌────────────┐
    │  Voice  │  │    AI    │  │   Graphs   │
    ├─────────┤  ├──────────┤  ├────────────┤
    │ STT: G* │  │ Gemini   │  │ Neo4j      │
    │ TTS: G* │  │ Groq (B) │  │ Vis.js     │
    │ 60min + │  │ Free     │  │ Free 100GB │
    │ 1M char │  │ tier     │  │            │
    └─────────┘  └──────────┘  └────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    ┌─────────┐  ┌──────────┐  ┌────────────┐
    │ Emotion │  │ Database │  │ Engagement │
    ├─────────┤  ├──────────┤  ├────────────┤
    │ Google  │  │Supabase  │  │ Resend (E) │
    │ NLP     │  │PostgreSQL│  │ SerpAPI    │
    │50K/day  │  │500MB free│  │Bird (SMS)  │
    │ free    │  │          │  │Maps        │
    └─────────┘  └──────────┘  └────────────┘

Legend:
G* = Google Cloud (free tier)
B = Backup LLM
E = Email service
Free = Running on free tier
```

---

## 🎯 What Each API Does

| Service | Role | Free Tier | Status |
|---------|------|-----------|--------|
| **Google STT** | Voice input | 60 min/mo | ✅ Week 1 |
| **Google TTS** | Voice output | 1M chars/mo | ✅ Week 1 |
| **Gemini** | Primary LLM | $0.075/1M tokens | ✅ Week 1 |
| **Groq** | Fallback LLM | 30 req/min | ✅ Week 1 |
| **Google NLP** | Emotion detect | 50K/day | ✅ Week 2 |
| **Neo4j** | Graph database | 100GB | ✅ Week 2 |
| **Supabase** | SQL database | 500MB | ✅ Week 3 |
| **Resend** | Email | 100/day | ✅ Week 4 |
| **SerpAPI** | Search | 100/mo | ✅ Week 4 |
| **Google Maps** | Location/Places | $7/mo free | Setup |
| **Google OAuth** | Sign-in | Free | ✅ |
| **Breeth Memory** | Long-term context | TBD | TBD |
| **Bird (SMS)** | Text messages | TBD | TBD |

---

## 💾 Database Schema Summary

```
Users
├── profiles
├── conversations
│   ├── messages
│   ├── emotions
│   └── outcomes
├── life_domains
├── open_loops
├── patterns
├── journey_events
└── companion_context
```

---

## ✅ Success Criteria

### By End of Week 1
- [ ] Can speak to companion
- [ ] Hear voice response
- [ ] No errors in console

### By End of Week 2
- [ ] Life Map page loads
- [ ] See interactive graph
- [ ] Patterns appearing

### By End of Week 3
- [ ] Refresh page → messages still there
- [ ] Supabase dashboard shows data
- [ ] Emotion tracking working

### By End of Week 4
- [ ] Check emails (check-in sent)
- [ ] Resources page finds therapists
- [ ] App deployed to Vercel
- [ ] Ready for beta users

---

## 🚀 After Week 4

### Quick Wins (1-2 days)
- Add practice mode (AI plays other person)
- Add outcome tracking
- Add mood chart

### Medium Builds (3-5 days)
- Multi-language support (German, etc.)
- Mobile app wrapper
- Offline mode (Ollama)

### Long-term
- 3D robot character
- Video analysis
- Group support features

---

## 📞 Support & Debugging

### If STT fails
- Check browser permissions
- Verify microphone works
- Check Google Cloud quota

### If Neo4j errors
- Verify connection string in `.env`
- Check database is running
- Run schema.sql in query interface

### If emails not sending
- Check Resend API key
- Verify email address confirmed
- Check spam folder

### If deployment fails
- Verify all env vars in Vercel
- Check no hardcoded keys in code
- Review build logs

---

## 🎓 Next Learning

After implementation:
- Deep dive into Neo4j graph queries
- Advanced Gemini prompt engineering
- Deployment optimization
- User privacy & security

---

## 🏆 You've Got This!

You're building something truly special. Follow this roadmap week-by-week, commit regularly, and you'll have a fully featured, production-ready AI companion powered by free tier APIs. 

**Start Week 1 now.** 🚀
