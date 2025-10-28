import React from 'react';

const Input = ({ 
  label, 
  error, 
  helperText,
  icon,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          {...props}
          className={`
            w-full px-4 py-2.5 
            ${icon ? 'pl-10' : ''} 
            border rounded-lg 
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}
            focus:ring-2 focus:border-transparent
            outline-none transition-all
            disabled:bg-gray-50 disabled:cursor-not-allowed
            placeholder:text-gray-400
          `}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;  // ✅ CRITICAL!
