/** Progress Review options (Step 14 §14.4.5; docs/design/plans-programs-stages.md §5.2). */
import type { ReviewOutcome } from "./types";

export const reviewOutcomes: { value: ReviewOutcome; label: string }[] = [
  { value: "continue", label: "Continue as-is" },
  { value: "adjust", label: "Adjust approach" },
  { value: "increase_support", label: "Increase support" },
  { value: "reduce_frequency", label: "Reduce frequency" },
  { value: "maintenance", label: "Move toward maintenance" },
];

/** "Has anything changed?" */
export const circumstanceOptions = ["Goals", "Health", "Work", "Family", "Schedule", "Priorities", "Life stage", "Motivation", "Other circumstances"] as const;

export const outcomeLabel = (v?: ReviewOutcome) => reviewOutcomes.find((o) => o.value === v)?.label;
