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
      console.log('✅ Admin session restored');
    }
    setLoading(false);
  }, []);

// ✅ SIMPLE: Pakai Ngrok URL untuk semua environment
const saveFCMToken = async (fcmToken) => {
  try {
    // ✅ Pakai Ngrok URL (untuk laptop & HP)
    const apiUrl = 'https://econometric-unvicariously-anjelica.ngrok-free.dev/aduan-desa/api/admin/save-fcm-token.php';
    
    console.log('💾 Saving Admin FCM token to:', apiUrl);
    console.log('🔑 Admin FCM Token (preview):', fcmToken.substring(0, 30) + '...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        'ngrok-skip-browser-warning': '69420'
      },
      body: JSON.stringify({ 
        fcm_token: fcmToken,
        device_info: navigator.userAgent
      })
    });
    
    const result = await response.json();
    console.log('💾 Admin FCM response:', result);
    
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
    console.log('🔐 Admin login...', adminData.username);
    
    setAdmin(adminData);
    setToken(adminToken);
    localStorage.setItem('admin_token', adminToken);
    localStorage.setItem('admin_data', JSON.stringify(adminData));
    
    console.log('✅ Admin logged in');
    
    // Request notification permission
    setTimeout(async () => {
      try {
        console.log('🔔 Requesting admin notification permission...');
        const fcmToken = await requestNotificationPermission();
        
        if (fcmToken) {
          console.log('🔑 Admin FCM Token received:', fcmToken.substring(0, 30) + '...');
          await saveFCMToken(fcmToken);
        } else {
          console.log('⚠️ Admin denied notification permission or no token available');
        }
      } catch (error) {
        console.error('❌ Error requesting admin notification permission:', error);
      }
    }, 1000);
  };

  const logout = () => {
    console.log('🚪 Admin logout:', admin?.username);
    
    // ✅ SAVE REMEMBER ME DATA BEFORE LOGOUT
    const savedUsername = localStorage.getItem('admin_remembered_username');
    const savedPassword = localStorage.getItem('admin_remembered_password');
    
    console.log('💾 Preserving admin remember me data:', { 
      username: savedUsername ? '✅' : '❌',
      password: savedPassword ? '✅' : '❌'
    });
    
    // Clear auth data
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    
    // ✅ RESTORE REMEMBER ME DATA AFTER LOGOUT
    if (savedUsername) {
      localStorage.setItem('admin_remembered_username', savedUsername);
      console.log('✅ Admin username preserved:', savedUsername);
    }
    if (savedPassword) {
      localStorage.setItem('admin_remembered_password', savedPassword);
      console.log('✅ Admin password preserved');
    }
    
    console.log('✅ Admin logged out - Remember me data preserved');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
