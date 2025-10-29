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

// ✅ IMPROVED: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Notifikasi Baru';
  const notificationOptions = {
    body: payload.notification?.body || 'Ada update baru di sistem aduan',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: payload.data?.type || 'default',
    data: payload.data,
    requireInteraction: true, // ✅ Changed to true
    silent: false,
    vibrate: [200, 100, 200]
  };

  console.log('🔔 Showing notification:', notificationTitle);

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ NEW: Handle push event directly (more reliable)
self.addEventListener('push', function(event) {
  console.log('📥 Push event received:', event);
  
  if (!event.data) {
    console.log('⚠️ Push event has no data');
    return;
  }
  
  try {
    const payload = event.data.json();
    console.log('📦 Push payload:', payload);
    
    // Extract notification data
    const notificationData = payload.notification || {};
    const customData = payload.data || {};
    
    const notificationTitle = notificationData.title || customData.title || '📢 Notifikasi Baru';
    const notificationOptions = {
      body: notificationData.body || customData.body || 'Ada update baru',
      icon: notificationData.icon || '/logo192.png',
      badge: '/logo192.png',
      tag: customData.type || 'notification-' + Date.now(),
      data: customData,
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200],
      actions: customData.type === 'new_complaint' ? [
        { action: 'view', title: '👁️ Lihat' },
        { action: 'close', title: '✖️ Tutup' }
      ] : []
    };
    
    console.log('🔔 Showing push notification:', notificationTitle);
    
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (error) {
    console.error('❌ Error handling push event:', error);
  }
});

// ✅ IMPROVED: Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  // Handle action buttons
  if (event.action === 'close') {
    return;
  }
  
  // Determine URL
  let targetUrl = '/';
  
  if (event.notification.data) {
    const data = event.notification.data;
    
    if (data.click_action) {
      targetUrl = data.click_action;
    } else if (data.type === 'status_update' || data.type === 'new_response') {
      targetUrl = `/complaints/${data.complaint_id}`;
    } else if (data.type === 'new_complaint') {
      targetUrl = `/admin/complaints`;
    }
  }
  
  console.log('🔗 Opening URL:', targetUrl);
  
  // Open URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if already open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ✅ Service worker activation
self.addEventListener('activate', (event) => {
  console.log('✅ Service worker activated');
  event.waitUntil(clients.claim());
});

// ✅ Service worker installation
self.addEventListener('install', (event) => {
  console.log('🔧 Service worker installing...');
  self.skipWaiting();
});

// ✅ NEW: Log all messages for debugging
self.addEventListener('message', (event) => {
  console.log('📨 Message from client:', event.data);
});
