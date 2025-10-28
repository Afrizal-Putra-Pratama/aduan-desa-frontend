import React, { createContext, useState, useEffect, useContext } from 'react';
import { requestNotificationPermission } from '../config/firebase';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const storedAdmin = localStorage.getItem('admin_data');
    
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const saveFCMToken = async (fcmToken) => {
    try {
      const response = await fetch('http://localhost/aduan-desa/api/admin/save-fcm-token.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ 
          fcm_token: fcmToken,
          device_info: navigator.userAgent
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Admin FCM token saved');
      } else {
        console.error('❌ Failed to save admin FCM token:', result.message);
      }
    } catch (error) {
      console.error('❌ Error saving admin FCM token:', error);
    }
  };

  const login = async (adminData, adminToken) => {
    console.log('🔐 Admin login...');
    
    setAdmin(adminData);
    setToken(adminToken);
    localStorage.setItem('admin_token', adminToken);
    localStorage.setItem('admin_data', JSON.stringify(adminData));
    
    console.log('✅ Admin logged in');
    
    // Request notification permission
    setTimeout(async () => {
      try {
        const fcmToken = await requestNotificationPermission();
        
        if (fcmToken) {
          console.log('🔑 Admin FCM Token received');
          await saveFCMToken(fcmToken);
        }
      } catch (error) {
        console.error('❌ Error requesting admin notification permission:', error);
      }
    }, 1000);
  };

  const logout = () => {
    console.log('🚪 Admin logout');
    
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    
    console.log('✅ Admin logged out');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
