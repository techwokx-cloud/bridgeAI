import { driver, auth, Session, Driver } from "neo4j-driver";

// Note: encryption is determined by the URI scheme (neo4j+s:// / bolt+s://
// enables TLS automatically), so no separate `encrypted` config is needed.
//
// The driver is constructed lazily (on first use) rather than at module
// load. Constructing it at module scope means a malformed NEO4J_URI throws
// during import — which crashes every module that transitively imports
// this file (lib/agent/lifeMap.ts → lib/agent/agent.ts), taking down
// features that don't even use Neo4j, like practice mode. Lazy init keeps
// that failure contained to the specific call that needs it.
let neo4jDriver: Driver | null = null;

function getDriver(): Driver {
  if (!neo4jDriver) {
    neo4jDriver = driver(
      process.env.NEO4J_URI || "neo4j+s://localhost:7687",
      auth.basic(
        process.env.NEO4J_USERNAME || "neo4j",
        process.env.NEO4J_PASSWORD || "password"
      )
    );
  }
  return neo4jDriver;
}

export type Neo4jSession = Session;

/**
 * Get Neo4j session
 */
export function getSession(): Neo4jSession {
  return getDriver().session({
    database: process.env.NEO4J_DATABASE || "neo4j",
  });
}

/**
 * Close all Neo4j connections
 */
export async function closeNeo4j() {
  if (neo4jDriver) {
    await neo4jDriver.close();
  }
}

/**
 * Life Map Graph Types
 */
export interface LifeDomainNode {
  id: string;
  title: string;
  type: "personal" | "family" | "work" | "friendships" | "other";
  emoji?: string;
  color?: string;
}

export interface PatternNode {
  id: string;
  theme: string;
  frequency: number;
  firstNoticed: string;
  emoji?: string;
}

export interface ConversationNode {
  id: string;
  topic: string;
  timestamp: string;
  emotion?: string;
}

export interface LifeMapNode {
  id: string;
  label: string;
  type: "domain" | "pattern" | "conversation" | "action";
  color?: string;
  size?: number;
  emoji?: string;
}

export interface LifeMapEdge {
  from: string;
  to: string;
  label: string;
  weight?: number;
  relationship: string;
}

export interface LifeMapData {
  nodes: LifeMapNode[];
  edges: LifeMapEdge[];
  metadata: {
    totalConversations: number;
    totalPatterns: number;
    dominantDomains: string[];
    lastUpdated: string;
  };
}

/**
 * Initialize user graph (create user node if not exists)
 */
export async function initializeUserGraph(userId: string): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `
      MERGE (u:User {id: $userId})
      ON CREATE SET 
        u.created_at = datetime(),
        u.last_updated = datetime()
      ON MATCH SET
        u.last_updated = datetime()
      `,
      { userId }
    );
  } finally {
    await session.close();
  }
}

/**
 * Add conversation to graph
 */
export async function addConversation(
  userId: string,
  conversationId: string,
  topic: string,
  domain: string,
  emotion?: string
): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})
      MERGE (d:Domain {name: $domain})
      MERGE (c:Conversation {id: $conversationId})
      ON CREATE SET
        c.topic = $topic,
        c.timestamp = datetime(),
        c.emotion = $emotion
      MERGE (u)-[:HAS_CONVERSATION]->(c)
      MERGE (c)-[:IN_DOMAIN]->(d)
      `,
      { userId, conversationId, topic, domain, emotion }
    );
  } finally {
    await session.close();
  }
}

/**
 * Extract and add patterns from conversation
 */
export async function addPattern(
  userId: string,
  theme: string,
  frequency: number = 1,
  emoji?: string
): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})
      MERGE (p:Pattern {theme: $theme})
      ON CREATE SET
        p.frequency = 1,
        p.first_noticed = datetime(),
        p.emoji = $emoji
      ON MATCH SET
        p.frequency = p.frequency + $frequency,
        p.last_mentioned = datetime()
      MERGE (u)-[:OBSERVES_PATTERN]->(p)
      `,
      { userId, theme, frequency, emoji }
    );
  } finally {
    await session.close();
  }
}

/**
 * Create relationship between patterns (co-occurrence)
 */
export async function linkPatterns(
  theme1: string,
  theme2: string,
  strength: number = 1
): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (p1:Pattern {theme: $theme1})
      MATCH (p2:Pattern {theme: $theme2})
      MERGE (p1)-[r:RELATES_TO]->(p2)
      ON CREATE SET r.strength = $strength
      ON MATCH SET r.strength = r.strength + $strength
      `,
      { theme1, theme2, strength }
    );
  } finally {
    await session.close();
  }
}

/**
 * Add action/commitment
 */
export async function addAction(
  userId: string,
  conversationId: string,
  actionText: string,
  domain: string,
  priority: "low" | "medium" | "high" = "medium"
): Promise<void> {
  const session = getSession();
  try {
    const actionId = `action_${Date.now()}`;
    await session.run(
      `
      MATCH (u:User {id: $userId})
      MATCH (d:Domain {name: $domain})
      MATCH (c:Conversation {id: $conversationId})
      CREATE (a:Action {
        id: $actionId,
        text: $actionText,
        priority: $priority,
        created_at: datetime(),
        status: 'open'
      })
      MERGE (u)-[:COMMITS_TO]->(a)
      MERGE (c)-[:SUGGESTS]->(a)
      MERGE (a)-[:IN_DOMAIN]->(d)
      `,
      { userId, conversationId, actionId, actionText, domain, priority }
    );
  } finally {
    await session.close();
  }
}

/**
 * Get complete Life Map for visualization
 */
export async function getLifeMap(userId: string): Promise<LifeMapData> {
  const session = getSession();
  try {
    // Get all nodes
    const nodesResult = await session.run(
      `
      MATCH (u:User {id: $userId})-[r]->(node)
      RETURN 
        node.id as id,
        node.title as title,
        node.name as name,
        node.topic as topic,
        node.theme as theme,
        labels(node)[0] as type,
        node.emoji as emoji,
        node.frequency as frequency,
        node.emotion as emotion
      UNION
      MATCH (u:User {id: $userId})-[r]->(node1)-[]->(node2)
      RETURN
        node2.id as id,
        node2.title as title,
        node2.name as name,
        node2.theme as theme,
        labels(node2)[0] as type,
        node2.emoji as emoji,
        node2.frequency as frequency,
        null as emotion,
        null as topic
      `,
      { userId }
    );

    // Get all edges
    const edgesResult = await session.run(
      `
      MATCH (u:User {id: $userId})
      MATCH (node1)-[r:HAS_CONVERSATION|IN_DOMAIN|OBSERVES_PATTERN|RELATES_TO|COMMITS_TO|SUGGESTS]->(node2)
      RETURN
        node1.id as from,
        node1.name as fromName,
        node1.title as fromTitle,
        node1.theme as fromTheme,
        node2.id as to,
        node2.name as toName,
        node2.title as toTitle,
        node2.theme as toTheme,
        type(r) as relationship,
        r.strength as weight
      `,
      { userId }
    );

    // Get metadata
    const metadataResult = await session.run(
      `
      MATCH (u:User {id: $userId})
      RETURN
        size((u)-[:HAS_CONVERSATION]->()) as conversation_count,
        size((u)-[:OBSERVES_PATTERN]->()) as pattern_count,
        [(u)-[:HAS_CONVERSATION]->(c)-[:IN_DOMAIN]->(d) | d.name] as domains
      `,
      { userId }
    );

    // Build nodes array
    const nodeSet = new Map<string, LifeMapNode>();
    const colorMap: { [key: string]: string } = {
      personal: "#ff8db3",
      family: "#52d6d3",
      work: "#6d5ef8",
      friendships: "#FFB84D",
      other: "#999999",
      Domain: "#6d5ef8",
      Pattern: "#FFB84D",
      Conversation: "#52d6d3",
      Action: "#52d6d3",
    };

    nodesResult.records.forEach((record) => {
      const type = record.get("type");
      const id = record.get("id") || record.get("name") || record.get("theme");

      const node: LifeMapNode = {
        id: id,
        label:
          record.get("title") ||
          record.get("name") ||
          record.get("theme") ||
          record.get("topic") ||
          id,
        type: type.toLowerCase() as any,
        color: colorMap[type] || "#999999",
        emoji: record.get("emoji"),
        size: type === "Pattern" ? (record.get("frequency") || 1) * 20 + 30 : 40,
      };

      nodeSet.set(id, node);
    });

    // Build edges array
    const edges: LifeMapEdge[] = [];
    edgesResult.records.forEach((record) => {
      const fromId =
        record.get("from") ||
        record.get("fromName") ||
        record.get("fromTitle") ||
        record.get("fromTheme");
      const toId =
        record.get("to") ||
        record.get("toName") ||
        record.get("toTitle") ||
        record.get("toTheme");

      edges.push({
        from: fromId,
        to: toId,
        label: formatRelationshipLabel(record.get("relationship")),
        relationship: record.get("relationship"),
        weight: record.get("weight") || 1,
      });
    });

    // Get metadata
    const metadata = metadataResult.records[0];
    const dominantDomains = metadata
      .get("domains")
      .filter((d: any) => d !== null)
      .slice(0, 3);

    return {
      nodes: Array.from(nodeSet.values()),
      edges,
      metadata: {
        totalConversations: metadata.get("conversation_count") || 0,
        totalPatterns: metadata.get("pattern_count") || 0,
        dominantDomains,
        lastUpdated: new Date().toISOString(),
      },
    };
  } finally {
    await session.close();
  }
}

/**
 * Get patterns related to a specific domain
 */
export async function getPatternsInDomain(
  userId: string,
  domain: string
): Promise<PatternNode[]> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:HAS_CONVERSATION]->(c)-[:IN_DOMAIN]->(d:Domain {name: $domain})
      MATCH (u)-[:OBSERVES_PATTERN]->(p:Pattern)
      RETURN DISTINCT
        p.id as id,
        p.theme as theme,
        p.frequency as frequency,
        p.first_noticed as firstNoticed,
        p.emoji as emoji
      `,
      { userId, domain }
    );

    return result.records.map((record) => ({
      id: record.get("id"),
      theme: record.get("theme"),
      frequency: record.get("frequency") || 0,
      firstNoticed: record.get("firstNoticed"),
      emoji: record.get("emoji"),
    }));
  } finally {
    await session.close();
  }
}

/**
 * Find emerging patterns (mentioned 2+ times recently)
 */
export async function findEmergingPatterns(userId: string): Promise<string[]> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:OBSERVES_PATTERN]->(p:Pattern)
      WHERE p.last_mentioned > datetime() - duration('P7D')
      AND p.frequency >= 2
      RETURN p.theme as theme
      ORDER BY p.frequency DESC
      LIMIT 5
      `,
      { userId }
    );

    return result.records.map((record) => record.get("theme"));
  } finally {
    await session.close();
  }
}

/**
 * Get open actions/commitments
 */
export async function getOpenActions(
  userId: string
): Promise<
  Array<{
    id: string;
    text: string;
    priority: string;
    domain: string;
    created_at: string;
  }>
> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:COMMITS_TO]->(a:Action {status: 'open'})
      MATCH (a)-[:IN_DOMAIN]->(d:Domain)
      RETURN
        a.id as id,
        a.text as text,
        a.priority as priority,
        d.name as domain,
        a.created_at as created_at
      ORDER BY 
        CASE a.priority 
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        a.created_at DESC
      `,
      { userId }
    );

    return result.records.map((record) => ({
      id: record.get("id"),
      text: record.get("text"),
      priority: record.get("priority"),
      domain: record.get("domain"),
      created_at: record.get("created_at"),
    }));
  } finally {
    await session.close();
  }
}

/**
 * Mark action as completed
 */
export async function completeAction(actionId: string): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (a:Action {id: $actionId})
      SET a.status = 'completed', a.completed_at = datetime()
      `,
      { actionId }
    );
  } finally {
    await session.close();
  }
}

/**
 * Query relationships between domains
 */
export async function analyzeDomainRelationships(userId: string) {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:HAS_CONVERSATION]->(c)-[:IN_DOMAIN]->(d1:Domain)
      MATCH (c)-[:IN_DOMAIN]->(d2:Domain) WHERE d1 <> d2
      RETURN
        d1.name as domain1,
        d2.name as domain2,
        count(c) as shared_conversations
      ORDER BY shared_conversations DESC
      `,
      { userId }
    );

    return result.records.map((record) => ({
      domain1: record.get("domain1"),
      domain2: record.get("domain2"),
      sharedConversations: record.get("shared_conversations"),
    }));
  } finally {
    await session.close();
  }
}

/**
 * Helper: Format relationship label for display
 */
function formatRelationshipLabel(relationship: string): string {
  const labels: { [key: string]: string } = {
    HAS_CONVERSATION: "talks about",
    IN_DOMAIN: "relates to",
    OBSERVES_PATTERN: "experiences",
    RELATES_TO: "connected to",
    COMMITS_TO: "commits to",
    SUGGESTS: "suggests",
  };
  return labels[relationship] || relationship;
}
