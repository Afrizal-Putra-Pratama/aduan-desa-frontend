import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDMGA59mtHIuvM8E23XyWRXn74POksLaQE",
  authDomain: "skripsi-fcm.firebaseapp.com",
  projectId: "skripsi-fcm",
  storageBucket: "skripsi-fcm.firebasestorage.app",
  messagingSenderId: "65611754893",
  appId: "1:65611754893:web:d0f53b8b7d2196327061c4",
  measurementId: "G-LLZCBLEXMQ"
};

// VAPID Key
const VAPID_KEY = "BFaYxPRPFkrSj_vVTky9KFqZzv7_20AqJqxc_tk6ciFwxEcGsjIMKf_VKp-6TLPLZxZJjnDBstfAAfZLYTAb1Hw";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request Notification Permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token) {
        console.log('🔑 FCM Token:', token);
        return token;
      } else {
        console.log('❌ No token available');
        return null;
      }
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('📨 Foreground message received:', payload);
      resolve(payload);
    });
  });

// Export for direct use
export { messaging, getToken, onMessage, VAPID_KEY };
export default messaging;
