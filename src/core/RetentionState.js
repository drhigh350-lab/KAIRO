/**
 * Kairo — RetentionStateMachine
 * Explicit state transition rules and validation.
 */

import { RetentionState } from "../utils/constants.js";

export const ValidTransitions = Object.freeze({
  [RetentionState.UNSEEN]:     [RetentionState.FORMING],
  [RetentionState.FORMING]:    [RetentionState.HELD, RetentionState.FADING],
  [RetentionState.HELD]:       [RetentionState.FADING, RetentionState.REINFORCED],
  [RetentionState.FADING]:     [RetentionState.REINFORCED, RetentionState.FORMING, RetentionState.HELD],
  [RetentionState.REINFORCED]: [RetentionState.FADING, RetentionState.HELD]
});

export function canTransition(fromState, toState) {
  return ValidTransitions[fromState]?.includes(toState) || false;
}

/**
 * Get a human-readable description of what each state means.
 */
export function describeState(state) {
  const descriptions = {
    [RetentionState.UNSEEN]:     "You haven't encountered this concept yet.",
    [RetentionState.FORMING]:    "You're currently learning this. It needs more practice to stick.",
    [RetentionState.HELD]:       "You understand this, but memory fades. It will come back for review.",
    [RetentionState.FADING]:     "This concept is slipping. It's being prioritized for your next session.",
    [RetentionState.REINFORCED]: "You've remembered this after time passed. This is real learning."
  };
  return descriptions[state] || "Unknown state.";
}
