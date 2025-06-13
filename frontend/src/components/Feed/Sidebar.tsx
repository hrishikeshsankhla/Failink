import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Fail Tags', to: '/' },
  { label: 'Interview Implosions', to: '/interview-implosions' },
  { label: 'Startup Graveyard', to: '/startup-graveyard' },
  { label: 'Career Catastrophes', to: '/career-catastrophes' },
  { label: 'Resume Regrets', to: '/resume-regrets' },
  { label: 'Office Oddities', to: '/office-oddities' },
  { label: 'Communities', to: '/communities' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-white rounded-xl shadow p-3 flex flex-col h-full min-h-[600px] w-56 border border-gray-100">
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 transition-colors ${
                    isActive ? 'bg-indigo-100 text-indigo-700 font-semibold' : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-6 pt-4 border-t border-gray-100 space-y-1">
        <NavLink to="/profile" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 text-sm">
          <span className="mr-2">👤</span> My Profile
        </NavLink>
        <NavLink to="/chat" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 text-sm">
          <span className="mr-2">💬</span> Chat with Aunt Karen
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar; 