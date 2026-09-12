import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

// Human / Agent view state. Lives entirely in the URL (`?view=agent`) so it is
// linkable, refreshable, back-button-correct and shareable. Human is always
// the default: a visitor is never moved into agent mode automatically.
export const VIEW_AGENT = "agent";
export const VIEW_HUMAN = "human";

export function useViewMode() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === VIEW_AGENT ? VIEW_AGENT : VIEW_HUMAN;

  const setView = useCallback(
    (next) => {
      const nextParams = new URLSearchParams(params);
      if (next === VIEW_AGENT) nextParams.set("view", VIEW_AGENT);
      else nextParams.delete("view");
      // push (not replace) so the browser Back button undoes a mode switch
      setParams(nextParams, { replace: false });
    },
    [params, setParams]
  );

  return { view, setView, isAgent: view === VIEW_AGENT };
}
