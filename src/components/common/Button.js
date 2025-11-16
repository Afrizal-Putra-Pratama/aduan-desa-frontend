import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 relative overflow-hidden';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-200 dark:focus:ring-indigo-900 shadow-md hover:shadow-lg active:scale-95',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 shadow-sm hover:shadow-md active:scale-95',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-200 dark:focus:ring-green-900 shadow-md hover:shadow-lg active:scale-95',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-200 dark:focus:ring-red-900 shadow-md hover:shadow-lg active:scale-95',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-200 dark:focus:ring-yellow-900 shadow-md hover:shadow-lg active:scale-95',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20 active:scale-95',
    ghost: 'text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/20 active:scale-95',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {loading && (
        <span className="absolute inset-0 bg-current opacity-10 animate-pulse"></span>
      )}
      
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
