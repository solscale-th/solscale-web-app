"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  FLOWCHART_CHANGE_EVENT,
  dispatchFlowchart,
  loadFlowchartState,
} from "@/lib/flowchart/store";
import { createEmptyFlowchartState } from "@/lib/flowchart/reducer";
import type { FlowAction, FlowchartState } from "@/lib/flowchart/types";

function subscribe(callback: () => void) {
  window.addEventListener(FLOWCHART_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(FLOWCHART_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useFlowchart() {
  const state = useSyncExternalStore(
    subscribe,
    loadFlowchartState,
    createEmptyFlowchartState
  );

  const dispatch = useCallback((action: FlowAction): FlowchartState => {
    return dispatchFlowchart(action);
  }, []);

  return { state, dispatch };
}
