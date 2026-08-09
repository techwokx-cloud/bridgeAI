/**
 * Life Map (agent-facing)
 *
 * Thin wrapper over lib/api/neo4j.ts, exposing exactly what the Autonomy
 * Engine needs: open actions and emerging patterns. The graph itself
 * (domains, conversations, relationships) is owned by lib/api/neo4j.ts —
 * this file does not duplicate that logic, just narrows it for agent use.
 */

import {
  getOpenActions,
  findEmergingPatterns,
  type LifeMapData,
  getLifeMap as getFullLifeMap,
} from "@/lib/api/neo4j";

export interface OpenLoop {
  id: string;
  text: string;
  domain: string;
  priority: string;
  createdAt: string;
  daysSinceCreated: number;
}

export async function getOpenLoops(userId: string): Promise<OpenLoop[]> {
  try {
    const actions = await getOpenActions(userId);
    const now = Date.now();

    return actions.map((a) => ({
      id: a.id,
      text: a.text,
      domain: a.domain,
      priority: a.priority,
      createdAt: a.created_at,
      daysSinceCreated: Math.floor(
        (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  } catch (error) {
    console.error("[lifeMap] getOpenLoops failed, continuing with no open loops:", error);
    return [];
  }
}

export async function getRecurringPatterns(userId: string): Promise<string[]> {
  try {
    return await findEmergingPatterns(userId);
  } catch (error) {
    console.error("[lifeMap] getRecurringPatterns failed, continuing with none:", error);
    return [];
  }
}

export async function getLifeMapSnapshot(userId: string): Promise<LifeMapData> {
  return getFullLifeMap(userId);
}
