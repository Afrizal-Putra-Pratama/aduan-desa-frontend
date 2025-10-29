import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
let messaging = null;

const initMessaging = async () => {
  try {
    const isLocalHost = window.location.hostname === 'localhost';
    const isHttps = window.location.protocol === 'https:';
    
    if (!isLocalHost && !isHttps) {
      console.warn('⚠️ Firebase Messaging requires HTTPS. Skipping initialization.');
      return null;
    }
    
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      console.log('✅ Firebase Messaging initialized');
      
      // ✅ NEW: Setup foreground message listener immediately
      setupForegroundListener();
      
      return messaging;
    } else {
      console.warn('⚠️ Firebase Messaging not supported in this browser');
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Firebase Messaging initialization skipped:', error.message);
    return null;
  }
};

// ✅ NEW: Foreground notification handler
const setupForegroundListener = () => {
  if (!messaging) return;
  
  onMessage(messaging, (payload) => {
    console.log('📬 Foreground message received:', payload);
    
    // Show notification manually when app is open
    if (Notification.permission === 'granted') {
      const notificationTitle = payload.notification?.title || 'Notifikasi Baru';
      const notificationOptions = {
        body: payload.notification?.body || 'Ada update baru di sistem aduan',
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: payload.data?.type || 'default',
        requireInteraction: true,
        data: payload.data,
        silent: false
      };

      // Create and show notification
      const notification = new Notification(notificationTitle, notificationOptions);
      
      // Handle notification click
      notification.onclick = function(event) {
        event.preventDefault();
        
        // Determine URL based on notification type
        let targetUrl = '/';
        if (payload.data) {
          if (payload.data.type === 'status_update' || payload.data.type === 'new_response') {
            targetUrl = `/complaints/${payload.data.complaint_id}`;
          } else if (payload.data.type === 'new_complaint') {
            targetUrl = '/admin/complaints';
          } else if (payload.data.click_action) {
            targetUrl = payload.data.click_action;
          }
        }
        
        // Focus window and navigate
        window.focus();
        window.location.href = targetUrl;
        notification.close();
      };
      
      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
      
      // Play sound (optional)
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(err => console.log('Audio play failed:', err));
      } catch (err) {
        console.log('Audio not available');
      }
    } else {
      console.log('⚠️ Notification permission not granted');
    }
  });
};

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      await initMessaging();
    }
    
    if (!messaging) {
      console.log('ℹ️ Notifications not available (requires HTTPS)');
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });
      
      console.log('🔑 FCM Token:', token);
      return token;
    } else {
      console.log('⚠️ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Notification error:', error.message);
    return null;
  }
};

// ✅ DEPRECATED: Use setupForegroundListener instead
// Keep for backward compatibility
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      console.log('ℹ️ Messaging not initialized');
      return;
    }
    
    onMessage(messaging, (payload) => {
      console.log('📬 Message received:', payload);
      resolve(payload);
    });
  });

export { app, messaging, initMessaging };
