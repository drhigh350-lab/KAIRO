import React from 'react';
import { NavLink } from 'react-router-dom';

function Icon({ d }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ITEMS = [
  { to: '/', label: 'Today', end: true, d: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z' },
  { to: '/practice', label: 'Practice', d: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z' },
  { to: '/review', label: 'Review', d: 'M1 4v6h6M23 20v-6h-6M20.5 9a8.5 8.5 0 00-15-4.9L1 9m22 6l-4.5 4.9A8.5 8.5 0 013.5 15' },
  { to: '/learn', label: 'Learn', d: 'M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.5.4.8 1 .8 1.7V17h6.4v-.6c0-.7.3-1.3.8-1.7A7 7 0 0012 2z' },
  { to: '/progress', label: 'Progress', d: 'M3 3v18h18M7 15l4-5 3 3 5-7' }
];

export default function BottomNav() {
  return (
    <nav className="bottomnav" aria-label="Primary">
      {ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className="bottomnav__item"
        >
          <Icon d={item.d} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
