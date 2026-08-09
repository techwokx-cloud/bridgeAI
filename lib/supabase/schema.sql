-- VitalityBridge Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ==========================================
-- Users & Profiles
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- Life Domains
-- ==========================================

CREATE TABLE IF NOT EXISTS life_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain_type TEXT NOT NULL CHECK (domain_type IN ('personal', 'family', 'work', 'friendships', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, domain_type)
);

ALTER TABLE life_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own domains" ON life_domains
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own domains" ON life_domains
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Conversations
-- ==========================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES life_domains(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  ended_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Messages
-- ==========================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'companion', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'reflection', 'suggestion')),
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  edited_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversation messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- ==========================================
-- Open Loops (Actions & Commitments)
-- ==========================================

CREATE TABLE IF NOT EXISTS open_loops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  action TEXT NOT NULL,
  target_date DATE,
  emotional_state TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'abandoned')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE open_loops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their open loops" ON open_loops
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their open loops" ON open_loops
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Patterns & Themes (Emerging Insights)
-- ==========================================

CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  description TEXT,
  frequency INT DEFAULT 1,
  first_noticed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_mentioned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  emoji TEXT,
  category TEXT,
  confidence FLOAT DEFAULT 0.5
);

ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their patterns" ON patterns
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- Outcomes & Reflections
-- ==========================================

CREATE TABLE IF NOT EXISTS outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  loop_id UUID REFERENCES open_loops(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  what_happened TEXT NOT NULL,
  result_type TEXT CHECK (result_type IN ('positive', 'neutral', 'negative')),
  learning TEXT,
  next_step TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their outcomes" ON outcomes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their outcomes" ON outcomes
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Journey Timeline (History & Progress)
-- ==========================================

CREATE TABLE IF NOT EXISTS journey_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('conversation_started', 'action_taken', 'outcome_recorded', 'pattern_noticed', 'milestone_reached')),
  title TEXT NOT NULL,
  description TEXT,
  domain_id UUID REFERENCES life_domains(id),
  related_conversation_id UUID REFERENCES conversations(id),
  related_loop_id UUID REFERENCES open_loops(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE journey_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their journey events" ON journey_events
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- Companion Context & State
-- ==========================================

CREATE TABLE IF NOT EXISTS companion_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_focus TEXT,
  recent_topics TEXT[],
  emotional_baseline TEXT,
  communication_style TEXT,
  preferences JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE companion_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their companion context" ON companion_context
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Indexes for Performance
-- ==========================================

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_domain_id ON conversations(domain_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX idx_open_loops_user_id ON open_loops(user_id);
CREATE INDEX idx_open_loops_status ON open_loops(status);
CREATE INDEX idx_open_loops_target_date ON open_loops(target_date);

CREATE INDEX idx_patterns_user_id ON patterns(user_id);
CREATE INDEX idx_patterns_frequency ON patterns(frequency DESC);

CREATE INDEX idx_journey_events_user_id ON journey_events(user_id);
CREATE INDEX idx_journey_events_created_at ON journey_events(created_at DESC);

CREATE INDEX idx_life_domains_user_id ON life_domains(user_id);

-- ==========================================
-- Triggers for Updated Timestamps
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
  ON profiles FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE
  ON conversations FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_domains_updated_at BEFORE UPDATE
  ON life_domains FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_open_loops_updated_at BEFORE UPDATE
  ON open_loops FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Agent: Memory
-- ==========================================
-- Bridge's persistent memory of a user lives in Breeth (thebreeth.com),
-- an intent-aware memory graph reached over REST — not a Supabase table.
-- See lib/agent/memory.ts. Breeth stores the reasoning/cognitive-pattern
-- behind each fact, not just the fact, which a flat table can't do.

-- ==========================================
-- Agent: Initiations (rate-limit log for autonomous outreach)
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_initiations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE agent_initiations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent initiations" ON agent_initiations
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_agent_initiations_user_id ON agent_initiations(user_id);
CREATE INDEX idx_agent_initiations_created_at ON agent_initiations(created_at DESC);
