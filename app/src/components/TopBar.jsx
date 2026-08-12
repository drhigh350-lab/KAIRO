import React from 'react';
import { useEngine } from '../engine/EngineProvider.jsx';

export default function TopBar({ onProfileClick }) {
  const { engine } = useEngine();
  const initial = (engine.profile.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="topbar">
      <span className="topbar__mark">Kairo</span>
      <button
        className="topbar__profile"
        onClick={onProfileClick}
        aria-label="Profile and settings"
      >
        {initial}
      </button>
    </div>
  );
}
