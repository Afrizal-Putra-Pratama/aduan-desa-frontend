/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDMGA59mtHIuvM8E23XyWRXn74POksLaQE",
  authDomain: "skripsi-fcm.firebaseapp.com",
  projectId: "skripsi-fcm",
  storageBucket: "skripsi-fcm.firebasestorage.app",
  messagingSenderId: "65611754893",
  appId: "1:65611754893:web:d0f53b8b7d2196327061c4",
  measurementId: "G-LLZCBLEXMQ"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Notifikasi Baru';
  const notificationOptions = {
    body: payload.notification?.body || 'Ada update baru di sistem aduan',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: payload.data?.type || 'default',
    data: payload.data, // Pass data to notification click handler
    requireInteraction: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  // Determine URL based on notification type
  let targetUrl = '/';
  
  if (event.notification.data) {
    const data = event.notification.data;
    
    // For user notifications (admin updated status/response)
    if (data.type === 'status_update' || data.type === 'new_response') {
      targetUrl = `/complaints/${data.complaint_id}`;
    }
    
    // For admin notifications (new complaint)
    if (data.type === 'new_complaint') {
      targetUrl = '/admin/complaints';
    }
    
    // Custom click action
    if (data.click_action) {
      targetUrl = data.click_action;
    }
  }
  
  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window/tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('✅ Service worker activated');
  event.waitUntil(clients.claim());
});

// Log service worker installation
self.addEventListener('install', (event) => {
  console.log('🔧 Service worker installing...');
  self.skipWaiting();
});
