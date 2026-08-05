import { useEffect, useRef } from 'react';

/**
 * Practice/CBT/Review Session each manage their own internal screen stack
 * with React state, not distinct routes — so the actual browser (or a
 * phone's hardware) back button only ever sees a single history entry for
 * the whole flow, and pressing it jumps straight out to wherever the flow
 * was entered from, skipping every internal screen the student stepped
 * through. The in-screen back arrow calls the flow's own `back()` and works
 * correctly; this hook makes the physical back button do the same thing.
 *
 * `depth` should be the flow's own internal history-stack length (0 at the
 * flow's root screen). Call with the current depth on every render; each
 * increase arms one more browser history entry, and each intercepted pop
 * calls `onBack` instead of letting the browser navigate away — until
 * depth reaches 0, at which point a real back tap is allowed through to
 * actually leave the flow.
 */
export function useBackIntercept(depth: number, onBack: () => void) {
  const depthRef = useRef(depth);
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (depth > depthRef.current) {
      for (let i = depthRef.current; i < depth; i++) {
        window.history.pushState({ __kairoFlowDepth: i + 1 }, '');
      }
    }
    depthRef.current = depth;
  }, [depth]);

  useEffect(() => {
    function handlePopState() {
      if (depthRef.current > 0) {
        depthRef.current -= 1;
        onBackRef.current();
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
}
