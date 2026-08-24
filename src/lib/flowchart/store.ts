/**
 * Client persistence for the UI-only flowchart.
 *
 * API connecting: swap dispatch() for GraphQL mutations and loadState() for queries.
 * RISK: localStorage is per-origin and per-browser. Demo roles on one machine
 * share one ledger — never use this for real money.
 */

import { createEmptyFlowchartState, reduceFlowchart } from "./reducer";
import { EMPTY_FLOWCHART_STATE, type FlowAction, type FlowchartState } from "./types";

export const FLOWCHART_STORAGE_KEY = "solscale_flowchart_v1";
export const FLOWCHART_CHANGE_EVENT = "solscale-flowchart-change";

let cachedRaw: string | null | undefined;
let cachedState: FlowchartState = EMPTY_FLOWCHART_STATE;

function parseRaw(raw: string): FlowchartState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<FlowchartState>;
    if (parsed.version !== 1) return null;
    return {
      version: 1,
      wallets: parsed.wallets ?? {},
      postedJobs: parsed.postedJobs ?? [],
      invites: parsed.invites ?? [],
      applications: parsed.applications ?? [],
      engagements: parsed.engagements ?? [],
      ratings: parsed.ratings ?? [],
      disputes: parsed.disputes ?? [],
    };
  } catch {
    return null;
  }
}

/**
 * Returns a cached snapshot. Callers must not assume a fresh object each time.
 */
export function loadFlowchartState(): FlowchartState {
  if (typeof window === "undefined") return EMPTY_FLOWCHART_STATE;

  try {
    const raw = localStorage.getItem(FLOWCHART_STORAGE_KEY);
    if (raw === cachedRaw) return cachedState;

    cachedRaw = raw;
    if (!raw) {
      cachedState = EMPTY_FLOWCHART_STATE;
      return cachedState;
    }

    cachedState = parseRaw(raw) ?? EMPTY_FLOWCHART_STATE;
    return cachedState;
  } catch {
    return cachedState;
  }
}

export function getServerFlowchartState(): FlowchartState {
  return EMPTY_FLOWCHART_STATE;
}

/** Test helper — clears the in-memory snapshot cache. */
export function resetFlowchartSnapshotCache(): void {
  cachedRaw = undefined;
  cachedState = EMPTY_FLOWCHART_STATE;
}

export function saveFlowchartState(state: FlowchartState): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(state);
  if (serialized === cachedRaw) {
    return;
  }
  try {
    localStorage.setItem(FLOWCHART_STORAGE_KEY, serialized);
  } catch {
    return;
  }
  cachedRaw = serialized;
  cachedState = state;
  window.dispatchEvent(new Event(FLOWCHART_CHANGE_EVENT));
}

export function dispatchFlowchart(action: FlowAction): FlowchartState {
  const next = reduceFlowchart(loadFlowchartState(), action);
  saveFlowchartState(next);
  return next;
}

export function resetFlowchartState(): FlowchartState {
  const empty = createEmptyFlowchartState();
  saveFlowchartState(empty);
  return empty;
}

export function createFlowId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
