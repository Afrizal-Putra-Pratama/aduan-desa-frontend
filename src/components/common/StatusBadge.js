import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    pending: {
      label: 'Menunggu',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: '⏳'
    },
    in_progress: {
      label: 'Diproses',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '🔄'
    },
    completed: {
      label: 'Selesai',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '✅'
    },
    rejected: {
      label: 'Ditolak',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: '❌'
    },
    active: {
      label: 'Aktif',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '✓'
    },
    inactive: {
      label: 'Nonaktif',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: '○'
    }
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const config = statusConfig[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: '•'
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1 
        rounded-full font-semibold border
        ${config.color} 
        ${sizes[size]}
      `}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
