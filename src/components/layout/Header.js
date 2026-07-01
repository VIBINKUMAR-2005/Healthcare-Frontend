import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const now = new Date();
  const timeOfDay = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Greeting */}
      <div className="hidden md:block">
        <p className="text-gray-800 font-semibold">{timeOfDay}, {user?.name?.split(' ')[0]}!</p>
        <p className="text-gray-500 text-xs">
          {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full capitalize">
          {user?.role}
        </span>
        <div className="bg-blue-600 h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
