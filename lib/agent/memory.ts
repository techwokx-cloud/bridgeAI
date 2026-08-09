/**
 * Memory — Breeth-backed
 *
 * Bridge's persistent memory of a user runs on Breeth (thebreeth.com), an
 * intent-aware memory graph, rather than a flat table. Unlike a vector
 * store, Breeth keeps the *reasoning* behind a fact (cognitive_pattern,
 * why_connected) alongside the fact itself — which is exactly what the
 * Autonomy Engine needs when deciding whether something is worth raising
 * unprompted, not just what was said.
 *
 * Isolation: each end user gets their own Breeth `group_id` (= their
 * userId), scoped within Bridge's single Breeth project. Cross-user reads
 * are impossible by construction — Breeth's tenancy boundary is enforced
 * server-side, group_id only narrows *within* that boundary.
 *
 * REST reference: https://docs.thebreeth.com/docs/api/overview
 */

const BREETH_BASE_URL = process.env.BREETH_BASE_URL || "https://api.thebreeth.com";

function breethHeaders() {
  const key = process.env.BREETH_API_KEY;
  if (!key) {
    throw new Error(
      "BREETH_API_KEY is not set — memory writes/reads will fail. See .env.example."
    );
  }
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export interface Memory {
  fact: string;
  sourceNode: string;
  targetNode: string;
  predicate: string;
  cognitivePattern?: string;
  whyConnected?: string;
}

interface BreethEpisodeResponse {
  ok: boolean;
  episode_name: string;
  extracted: { entities: number; edges: number };
  warning: string | null;
  intent_suggestion: { should_extract: boolean; confidence: number; reason: string } | null;
}

interface BreethSearchResponse {
  edges: Array<{
    edge_uuid: string;
    source_node: string;
    target_node: string;
    fact: string;
    name: string;
    intent_meta?: {
      edge_kind?: string;
      cognitive_pattern?: string;
      why_connected?: string;
      director_vision?: string;
    };
    _tier: string;
  }>;
  director_profile?: unknown;
}

/**
 * Write a memory. `importance >= 0.7` opts into intent extraction
 * (Breeth's cognitive_pattern/why_connected annotation) since that's a
 * metered resource — reserve it for facts that actually carry a
 * preference, decision, or pattern worth reasoning over later, not every
 * passing line of small talk.
 */
export async function storeMemory(params: {
  userId: string;
  content: string;
  domain: string;
  importance?: number;
}): Promise<void> {
  const importance = params.importance ?? 0.5;

  try {
    const res = await fetch(`${BREETH_BASE_URL}/v1/episodes`, {
      method: "POST",
      headers: breethHeaders(),
      body: JSON.stringify({
        content: params.content,
        group_id: params.userId,
        source_description: `bridge-agent:${params.domain}`,
        extract_intent: importance >= 0.7,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[breeth] storeMemory failed (${res.status}):`, body);
      return; // non-critical — a failed memory write shouldn't break the conversation turn
    }

    const data: BreethEpisodeResponse = await res.json();
    if (data.warning) {
      console.warn(`[breeth] storeMemory warning: ${data.warning}`);
    }
  } catch (error) {
    console.error("[breeth] storeMemory error:", error);
  }
}

/**
 * Hybrid (BM25 + vector + graph) search over what Breeth knows about this
 * user, scoped to their group_id. Used for general "what do I know about
 * this person" context — not domain-specific.
 */
export async function retrieveRecentMemories(
  userId: string,
  limit = 10
): Promise<Memory[]> {
  return searchMemories(userId, "What matters most to this person right now?", limit);
}

/**
 * Same search, scoped by asking about a specific life domain — Breeth
 * doesn't have a native "domain" filter, so the domain is folded into the
 * natural-language query itself, which its hybrid ranking handles well.
 */
export async function retrieveMemoriesByDomain(
  userId: string,
  domain: string,
  limit = 5
): Promise<Memory[]> {
  return searchMemories(userId, `What has this person said about ${domain}?`, limit);
}

async function searchMemories(
  userId: string,
  query: string,
  limit: number
): Promise<Memory[]> {
  try {
    const res = await fetch(`${BREETH_BASE_URL}/v1/search`, {
      method: "POST",
      headers: breethHeaders(),
      body: JSON.stringify({ query, group_id: userId, limit }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[breeth] search failed (${res.status}):`, body);
      return [];
    }

    const data: BreethSearchResponse = await res.json();
    return data.edges.map((e) => ({
      fact: e.fact,
      sourceNode: e.source_node,
      targetNode: e.target_node,
      predicate: e.name,
      cognitivePattern: e.intent_meta?.cognitive_pattern,
      whyConnected: e.intent_meta?.why_connected,
    }));
  } catch (error) {
    console.error("[breeth] search error:", error);
    return [];
  }
}
