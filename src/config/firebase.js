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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging conditionally
let messaging = null;

// ✅ CHECK IF MESSAGING IS SUPPORTED
const initMessaging = async () => {
  try {
    // Check if running on HTTPS or localhost
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

// Listen for messages
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

export { app, messaging };
