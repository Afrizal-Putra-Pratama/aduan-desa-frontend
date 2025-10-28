import React, { useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

function SuccessModal({ 
  isOpen, 
  onClose, 
  title = "Berhasil!",
  message = "Operasi berhasil dilakukan",
  type = "success", // success, error, info
  autoClose = true,
  autoCloseDelay = 2000,
  showButton = true
}) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const typeStyles = {
    success: {
      icon: <FiCheckCircle size={48} />,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      emoji: '✅',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    error: {
      icon: <FiAlertCircle size={48} />,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      emoji: '❌',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    info: {
      icon: <FiInfo size={48} />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      emoji: 'ℹ️',
      borderColor: 'border-blue-200 dark:border-blue-800'
    }
  };

  const style = typeStyles[type] || typeStyles.success;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full relative animate-scaleIn transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
        >
          <FiX size={20} className="text-slate-600 dark:text-slate-300" />
        </button>

        <div className="p-6 md:p-8 text-center">
          <div className={`w-20 h-20 ${style.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 ${style.iconColor}`}>
            {style.icon}
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
            {title}
          </h3>
          
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            {message}
          </p>

          {showButton && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              OK
            </button>
          )}

          {autoClose && !showButton && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
              Menutup otomatis dalam {autoCloseDelay / 1000} detik...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
