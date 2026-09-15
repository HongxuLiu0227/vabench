import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview' },
    { path: '/developer', label: 'Developers' },
    { path: '/games', label: 'Games' },
    { path: '/genres', label: 'Genres' },
    { path: '/platforms', label: 'Platforms' },
    { path: '/players', label: 'Players' },
  ];

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <h1>Metacritic Games Analysis</h1>
      </div>
      <div className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};
