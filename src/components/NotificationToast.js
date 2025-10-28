import React, { useEffect, useState } from 'react';
import { onMessageListener } from '../config/firebase';
import { FiX, FiCheckCircle } from 'react-icons/fi';

function NotificationToast() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        console.log('📨 Foreground notification received:', payload);
        
        setNotification({
          title: payload.notification?.title || 'Notifikasi Baru',
          body: payload.notification?.body || ''
        });
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'Notifikasi Baru', {
            body: payload.notification?.body || '',
            icon: '/logo192.png',
            badge: '/logo192.png',
            tag: 'notification-' + Date.now()
          });
        }
        
        // Auto hide after 6 seconds
        setTimeout(() => {
          setNotification(null);
        }, 6000);
      })
      .catch((err) => console.error('❌ Notification listener error:', err));
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] animate-slideInRight">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-l-4 border-indigo-500 p-4 max-w-sm min-w-[320px]">
        <div className="flex items-start gap-3">
          {/* Icon - Simple & Clean */}
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <FiCheckCircle className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 line-clamp-2">
              {notification.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
              {notification.body}
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => setNotification(null)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Close notification"
          >
            <FiX size={18} />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full animate-shrink" />
        </div>
      </div>
    </div>
  );
}

export default NotificationToast;
