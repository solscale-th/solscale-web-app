/**
 * Client persistence for the UI-only flowchart.
 *
 * API connecting: swap dispatch() for GraphQL mutations and loadState() for queries.
 * RISK: localStorage is per-origin and per-browser. Demo roles on one machine
 * share one ledger — never use this for real money.
 */

import { createEmptyFlowchartState, reduceFlowchart } from "./reducer";
import type { FlowAction, FlowchartState } from "./types";

export const FLOWCHART_STORAGE_KEY = "solscale_flowchart_v1";
export const FLOWCHART_CHANGE_EVENT = "solscale-flowchart-change";

export function loadFlowchartState(): FlowchartState {
  if (typeof window === "undefined") return createEmptyFlowchartState();
  try {
    const raw = localStorage.getItem(FLOWCHART_STORAGE_KEY);
    if (!raw) return createEmptyFlowchartState();
    const parsed = JSON.parse(raw) as Partial<FlowchartState>;
    if (parsed.version !== 1) return createEmptyFlowchartState();
    return {
      ...createEmptyFlowchartState(),
      ...parsed,
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
    return createEmptyFlowchartState();
  }
}

export function saveFlowchartState(state: FlowchartState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FLOWCHART_STORAGE_KEY, JSON.stringify(state));
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
