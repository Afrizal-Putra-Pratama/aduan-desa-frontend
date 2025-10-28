import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../services/apiService';
import { FiBell, FiX, FiCheck, FiTrash2, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Auto refresh every 5 seconds
    const interval = setInterval(() => {
      console.log('⏱️ Auto-refresh notifications...');
      fetchNotifications();
    }, 5000);
    
    // Refresh saat window kembali focus
    const handleFocus = () => {
      console.log('🔵 Window focused - refreshing notifications');
      fetchNotifications();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Calculate dropdown position when bell is clicked
  useEffect(() => {
    if (showDropdown && buttonRef.current && !isMobile) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showDropdown, isMobile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const fetchNotifications = async () => {
    console.log('🔵 Fetching notifications...');
    setLoading(true);
    try {
      const response = await notificationsAPI.getList();
      console.log('📥 Notifications response:', response);
      
      if (response.success) {
        console.log('✅ Notifications loaded:', response.data.length, 'Unread:', response.unread_count);
        setNotifications(response.data);
        setUnreadCount(response.unread_count);
      } else {
        console.error('❌ Failed to load notifications:', response.message);
      }
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, event) => {
    console.log('🔵 CLICKED MARK AS READ - Notification ID:', notificationId);
    
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    try {
      const response = await notificationsAPI.markAsRead(notificationId);
      console.log('📥 Mark as read response:', response);
      
      if (response.success) {
        console.log('✅ Successfully marked as read');
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: 1 } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        setTimeout(() => fetchNotifications(), 500);
      } else {
        console.error('❌ Failed to mark as read:', response.message);
        alert('Gagal menandai sebagai dibaca: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleMarkAllAsRead = async (event) => {
    console.log('🔵 CLICKED MARK ALL AS READ');
    
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    try {
      const response = await notificationsAPI.markAllAsRead();
      console.log('📥 Mark all response:', response);
      
      if (response.success) {
        console.log('✅ Successfully marked all as read');
        fetchNotifications();
      } else {
        console.error('❌ Failed:', response.message);
        alert('Gagal: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    console.log('🔵 CLICKED DELETE - Notification ID:', notificationId);
    
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    try {
      const response = await notificationsAPI.deleteNotification(notificationId);
      console.log('📥 Delete response:', response);
      
      if (response.success) {
        console.log('✅ Successfully deleted');
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        const deletedNotif = notifications.find(n => n.id === notificationId);
        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setTimeout(() => fetchNotifications(), 500);
      } else {
        console.error('❌ Failed to delete:', response.message);
        alert('Gagal menghapus: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error deleting:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteAllRead = async (event) => {
    console.log('🔵 CLICKED DELETE ALL READ');
    
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (window.confirm('Hapus semua notifikasi yang sudah dibaca?')) {
      try {
        const response = await notificationsAPI.deleteAllRead();
        console.log('📥 Delete all response:', response);
        
        if (response.success) {
          console.log('✅ Successfully deleted all read, deleted:', response.deleted_count);
          fetchNotifications();
        } else {
          console.error('❌ Failed:', response.message);
          alert('Gagal: ' + response.message);
        }
      } catch (error) {
        console.error('❌ Error:', error);
        alert('Error: ' + error.message);
      }
    } else {
      console.log('❌ User cancelled delete all');
    }
  };

  const handleNotificationClick = (notification) => {
    console.log('🔵 Notification clicked:', notification.id);
    
    if (notification.complaint_id) {
      if (!notification.is_read) {
        handleMarkAsRead(notification.id, null);
      }
      setShowDropdown(false);
      navigate(`/complaints/${notification.complaint_id}`);
    }
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const notifDate = new Date(dateString);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  };

  const readNotifications = notifications.filter(n => n.is_read === 1);

  const dropdownContent = showDropdown && createPortal(
    <>
      <div 
        className="fixed inset-0 z-[9998] bg-black bg-opacity-20 dark:bg-opacity-40"
        onClick={() => setShowDropdown(false)}
      />
      
      <div 
        ref={dropdownRef}
        className={`fixed bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 z-[9999] transition-colors ${
          isMobile 
            ? 'left-4 right-4 top-20 max-w-full' 
            : 'w-80'
        }`}
        style={!isMobile ? {
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
          <h3 className="font-bold text-gray-800 dark:text-slate-100">Notifikasi</h3>
          <div className="flex items-center gap-2">
            {/* Manual Refresh Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchNotifications();
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded"
              title="Refresh notifikasi"
              disabled={loading}
            >
              <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded"
                title="Tandai semua dibaca"
              >
                <FiCheckCircle size={18} />
              </button>
            )}
            {readNotifications.length > 0 && (
              <button
                onClick={handleDeleteAllRead}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold transition p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                title="Hapus yang sudah dibaca"
              >
                <FiTrash2 size={18} />
              </button>
            )}
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition p-1"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className={`overflow-y-auto ${isMobile ? 'max-h-[60vh]' : 'max-h-96'}`}>
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400">
              <FiBell size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Tidak ada notifikasi</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition ${
                  notif.is_read ? 'bg-white dark:bg-slate-800' : 'bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-slate-100 mb-1 truncate">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mb-2 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{formatTime(notif.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!notif.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition flex-shrink-0 p-1 rounded"
                        title="Tandai sudah dibaca"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteNotification(notif.id, e)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition flex-shrink-0 p-1 rounded"
                      title="Hapus notifikasi"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {dropdownContent}
    </>
  );
}

export default NotificationBell;
