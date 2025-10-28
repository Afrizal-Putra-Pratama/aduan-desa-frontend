import React from 'react';
import { FiX } from 'react-icons/fi';

function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Konfirmasi",
  message = "Apakah Anda yakin?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "danger" // danger, warning, info
}) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: '🗑️',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icon: '⚠️',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      confirmBtn: 'bg-orange-600 hover:bg-orange-700 text-white'
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const style = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full relative animate-scaleIn transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
        >
          <FiX size={20} className="text-slate-600 dark:text-slate-300" />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${style.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <span className="text-4xl">{style.icon}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {title}
            </h3>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-3 ${style.confirmBtn} font-semibold rounded-lg transition-colors shadow-md`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
