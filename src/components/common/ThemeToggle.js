import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-11 h-7 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Toggle circle - SMALLER */}
      <span
        className={`absolute left-0.5 w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-4' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <FiMoon className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <FiSun className="w-3.5 h-3.5 text-yellow-500" />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
