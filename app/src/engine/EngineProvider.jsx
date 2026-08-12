import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { KairoEngine } from '../../../src/index.js';
import { seedDemoContent } from './demoContent.js';

/**
 * The one and only integration boundary between the V1 shell and the
 * Kairo engine. Every screen reads/writes through `useEngine()` — no
 * screen imports anything from src/ directly, and no screen re-derives a
 * value the engine already computes (retention state, macro-state,
 * session plans, scores...). This provider owns exactly one job: create
 * the engine, initialize it, seed demo content in this credential-less
 * shell, and give the tree a way to ask for a re-render after a mutation.
 *
 * DEMO_STUDENT_ID is fixed rather than per-visitor because this shell has
 * no auth (see demoContent.js) — IndexedDB persistence means reloading
 * the page resumes the same demo student instead of re-seeding.
 */
const DEMO_STUDENT_ID = 'kairo_v1_shell_demo';

const EngineContext = createContext(null);

export function EngineProvider({ children }) {
  const engineRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  if (!engineRef.current) {
    engineRef.current = new KairoEngine({
      studentId: DEMO_STUDENT_ID,
      name: 'Ada',
      examDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
      targetSubjects: ['Chemistry', 'Biology'],
      targetCourse: 'Medicine and Surgery',
      targetUniversity: 'University of Lagos'
    });
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await engineRef.current.init();
      seedDemoContent(engineRef.current);
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // The engine has no observable/event-emitter surface (by design — it's a
  // plain library, not a UI framework). Screens call refresh() after any
  // engine call that mutates state so React re-reads fresh derived values
  // on the next render, rather than the shell re-implementing an event
  // system on top of it.
  const refresh = () => setVersion(v => v + 1);

  return (
    <EngineContext.Provider value={{ engine: engineRef.current, ready, version, refresh }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngine() {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useEngine() must be used inside <EngineProvider>');
  return ctx;
}
