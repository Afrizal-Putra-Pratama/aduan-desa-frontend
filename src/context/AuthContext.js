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
        
        // Verify token matches user
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
            
            // Save remember me data before clear
            const savedUsername = localStorage.getItem('remembered_username');
            const savedPhone = localStorage.getItem('remembered_phone');
            
            localStorage.clear();
            sessionStorage.clear();
            
            // Restore remember me data
            if (savedUsername) localStorage.setItem('remembered_username', savedUsername);
            if (savedPhone) localStorage.setItem('remembered_phone', savedPhone);
          }
        } else {
          console.warn('⚠️ Invalid token format - clearing session');
          
          // Save remember me data before clear
          const savedUsername = localStorage.getItem('remembered_username');
          const savedPhone = localStorage.getItem('remembered_phone');
          
          localStorage.clear();
          sessionStorage.clear();
          
          // Restore remember me data
          if (savedUsername) localStorage.setItem('remembered_username', savedUsername);
          if (savedPhone) localStorage.setItem('remembered_phone', savedPhone);
        }
      } catch (e) {
        console.error('❌ Session load error:', e);
        
        // Save remember me data before clear
        const savedUsername = localStorage.getItem('remembered_username');
        const savedPhone = localStorage.getItem('remembered_phone');
        
        localStorage.clear();
        sessionStorage.clear();
        
        // Restore remember me data
        if (savedUsername) localStorage.setItem('remembered_username', savedUsername);
        if (savedPhone) localStorage.setItem('remembered_phone', savedPhone);
      }
    } else {
      console.log('ℹ️ No stored session found');
    }
    
    setLoading(false);
  }, []);

  // Save FCM Token
  const saveFCMToken = async (fcmToken) => {
    try {
      const apiUrl = 'https://econometric-unvicariously-anjelica.ngrok-free.dev/aduan-desa/api/users/save-fcm-token.php';
      
      console.log('💾 Saving FCM token to:', apiUrl);
      console.log('🔑 FCM Token (preview):', fcmToken.substring(0, 30) + '...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({ fcm_token: fcmToken })
      });
      
      const result = await response.json();
      console.log('💾 Save FCM response:', result);
      
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
    
    // Request notification permission & save FCM token
    setTimeout(async () => {
      try {
        console.log('🔔 Requesting notification permission...');
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
    
    // SAVE REMEMBER ME DATA BEFORE LOGOUT
    const savedUsername = localStorage.getItem('remembered_username');
    const savedPhone = localStorage.getItem('remembered_phone');
    
    console.log('💾 Preserving remember me data:', { 
      username: savedUsername, 
      phone: savedPhone ? savedPhone.substring(0, 5) + '***' : null 
    });
    
    // Clear auth data
    setUser(null);
    setToken(null);
    
    localStorage.clear();
    sessionStorage.clear();
    
    // RESTORE REMEMBER ME DATA AFTER LOGOUT
    if (savedUsername) {
      localStorage.setItem('remembered_username', savedUsername);
      console.log('✅ Username preserved:', savedUsername);
    }
    if (savedPhone) {
      localStorage.setItem('remembered_phone', savedPhone);
      console.log('✅ Phone preserved:', savedPhone.substring(0, 5) + '***');
    }
    
    console.log('✅ Logout complete - Remember me data preserved');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
