import type { BymarkState } from "./default-settings.ts";

export function createNextIssueState(
  state: BymarkState,
  localValues: Pick<BymarkState, "time" | "date">,
): BymarkState {
  return {
    ...state,
    ...localValues,
    title: "",
    text: "",
  };
}
