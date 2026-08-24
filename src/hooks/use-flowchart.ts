"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FLOWCHART_CHANGE_EVENT,
  dispatchFlowchart,
  loadFlowchartState,
} from "@/lib/flowchart/store";
import { EMPTY_FLOWCHART_STATE, type FlowAction, type FlowchartState } from "@/lib/flowchart/types";

/**
 * Do not use useSyncExternalStore here. getSnapshot must return a stable
 * object identity; a cache miss allocates a new state tree and React will
 * re-render forever (CPU/RAM spike, tab or machine freeze).
 *
 * Subscribe only to our own write event — never to the generic `storage`
 * event, which also fires for auth/locale/seen-id keys.
 */
export function useFlowchart() {
  const [state, setState] = useState<FlowchartState>(EMPTY_FLOWCHART_STATE);

  useEffect(() => {
    setState(loadFlowchartState());
    const onChange = () => setState(loadFlowchartState());
    window.addEventListener(FLOWCHART_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(FLOWCHART_CHANGE_EVENT, onChange);
  }, []);

  const dispatch = useCallback((action: FlowAction): FlowchartState => {
    return dispatchFlowchart(action);
  }, []);

  return { state, dispatch };
}
