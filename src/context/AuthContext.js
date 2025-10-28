import React, { createContext, useState, useEffect, useContext } from 'react';
import { requestNotificationPermission } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stored session
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 Loading stored session...');
    console.log('Has token:', !!storedToken);
    console.log('Has user:', !!storedUser);
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        console.log('📦 Stored user:', parsedUser.name, '(ID:', parsedUser.id + ')');
        
        // ✅ Verify token matches user
        const parts = storedToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const tokenUserId = parseInt(payload.data?.id);
          const storedUserId = parseInt(parsedUser.id);
          
          console.log('Token user_id:', tokenUserId);
          console.log('Stored user_id:', storedUserId);
          
          if (tokenUserId === storedUserId) {
            console.log('✅ Valid session found - Token matches user');
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            console.warn('⚠️ Token mismatch on load - clearing session');
            console.warn('Token user_id:', tokenUserId);
            console.warn('Stored user_id:', storedUserId);
            localStorage.clear();
            sessionStorage.clear();
          }
        } else {
          console.warn('⚠️ Invalid token format - clearing session');
          localStorage.clear();
          sessionStorage.clear();
        }
      } catch (e) {
        console.error('❌ Session load error:', e);
        localStorage.clear();
        sessionStorage.clear();
      }
    } else {
      console.log('ℹ️ No stored session found');
    }
    
    setLoading(false);
  }, []);

  // Function untuk simpan FCM token ke backend
  const saveFCMToken = async (fcmToken) => {
    try {
      const response = await fetch('http://localhost/aduan-desa/api/users/save-fcm-token.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fcm_token: fcmToken })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ FCM token saved successfully');
      } else {
        console.error('❌ Failed to save FCM token:', result.message);
      }
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
    }
  };

  const login = async (userData, userToken) => {
    console.log('🔐 Setting up new session...');
    console.log('User:', userData.name, '(ID:', userData.id + ')');
    
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('✅ Session established');
    
    // 🔔 Request notification permission & save FCM token
    setTimeout(async () => {
      try {
        const fcmToken = await requestNotificationPermission();
        
        if (fcmToken) {
          console.log('🔑 FCM Token received:', fcmToken.substring(0, 30) + '...');
          await saveFCMToken(fcmToken);
        } else {
          console.log('⚠️ User denied notification permission or no token available');
        }
      } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
      }
    }, 1000);
  };

  const logout = () => {
    console.log('🚪 Logging out user:', user?.name);
    
    // ✅ Clear ALL data
    setUser(null);
    setToken(null);
    
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ Logout complete - All data cleared');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
