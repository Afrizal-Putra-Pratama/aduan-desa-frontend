import axios from 'axios';


// API Base URL
const API_BASE_URL = 'https://econometric-unvicariously-anjelica.ngrok-free.dev';
console.log('🔧 API_BASE_URL:', API_BASE_URL);





// Helper function untuk request dengan token
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const token = localStorage.getItem('token');
    
    console.log('🔵 API Request:', {
      endpoint,
      method,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN'
    });
    
    const config = {
      method,
      url: `${API_BASE_URL}/${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      },
      timeout: 10000,
    };


    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Token added to headers');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }


    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }


    console.log('📤 Request config:', config);
    
    const response = await axios(config);
    
    console.log('📥 Response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    if (error.response) {
      console.error('Server error response:', error.response.data);
      return error.response.data || { success: false, message: 'Server error' };
    } else if (error.request) {
      console.error('No response from server');
      return { success: false, message: 'Tidak ada respon dari server. Pastikan server berjalan.' };
    } else {
      console.error('Request setup error:', error.message);
      return { success: false, message: 'Kesalahan: ' + error.message };
    }
  }
};


// =============================
// Auth API
// =============================
export const authAPI = {
  // ✅ REGISTER LAMA (keep for backward compatibility)
  register: async (userData) => {
    return await apiRequest('auth/register.php', 'POST', userData);
  },
  
  // ✅ LOGIN LAMA (keep for backward compatibility)
  login: async (credentials) => {
    return await apiRequest('auth/login.php', 'POST', credentials);
  },


  // 🆕 REGISTER DIRECT (TANPA OTP) - DIPAKAI
  registerDirect: async (data) => {
    console.log('🔵 Register Direct - No OTP');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register-without-otp.php`,
        {
          username: data.username,
          phone: data.phone,
          address: data.address
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          },
          timeout: 10000
        }
      );
      console.log('✅ Registration complete:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal registrasi'
      };
    }
  },


  // 🆕 REGISTER STEP 1: Send OTP (FOR FUTURE USE)
  registerStep1: async (data) => {
    console.log('🔵 Register Step 1 - Sending OTP');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register-with-otp.php`,
        {
          step: 'register',
          username: data.username,
          phone: data.phone,
          address: data.address
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          },
          timeout: 15000
        }
      );
      console.log('✅ OTP sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Register Step 1 error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim OTP. Pastikan WhatsApp bot berjalan.'
      };
    }
  },


  // 🆕 REGISTER STEP 2: Verify OTP (FOR FUTURE USE)
  registerStep2: async (data) => {
    console.log('🔵 Register Step 2 - Verifying OTP');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register-with-otp.php`,
        {
          step: 'verify',
          username: data.username,
          phone: data.phone,
          address: data.address,
          otp: data.otp
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          },
          timeout: 10000
        }
      );
      console.log('✅ Registration complete:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Register Step 2 error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal verifikasi OTP'
      };
    }
  },


  // 🆕 LOGIN STEP 1: Request OTP (Username + Phone) - UPDATED
  loginRequestOTP: async (username, phone) => {
    console.log('🔵 Login - Requesting OTP for:', username, phone);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login-with-otp.php`,
        {
          step: 'request_otp',
          username: username,
          phone: phone
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          },
          timeout: 15000
        }
      );
      console.log('✅ OTP sent for login:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login request OTP error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim OTP'
      };
    }
  },


  // 🆕 LOGIN STEP 2: Verify OTP & Login (Username + Phone + OTP) - UPDATED
  loginVerifyOTP: async (username, phone, otp) => {
    console.log('🔵 Login - Verifying OTP');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login-with-otp.php`,
        {
          step: 'verify_otp',
          username: username,
          phone: phone,
          otp: otp
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          },
          timeout: 10000
        }
      );
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login verify OTP error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal verifikasi OTP'
      };
    }
  }
};


// =============================
// Categories API
// =============================
export const categoriesAPI = {
  getList: async () => {
    return await apiRequest('categories/list.php', 'GET');
  }
};


// =============================
// Complaints API
// =============================
export const complaintsAPI = {
  getList: async () => {
    return await apiRequest('complaints/list.php', 'GET');
  },
  
  getAdminList: async () => {
    return await apiRequest('complaints/admin-list.php', 'GET');
  },
  
  getById: async (id) => {
    return await apiRequest(`complaints/detail.php?id=${id}`, 'GET');
  },
  
  create: async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/complaints/create.php`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'ngrok-skip-browser-warning': '69420',
          },
          timeout: 30000,
        }
      );
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (error.response) return error.response.data;
      return { success: false, message: 'Network error' };
    }
  },

  // 🆕 CHECK DUPLICATE - FUNGSI BARU
  checkDuplicate: async (data) => {
    console.log('🔍 Checking duplicate for:', data);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/complaints/check-duplicate.php`,
        {
          title: data.title,
          description: data.description
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420'
          },
          timeout: 10000
        }
      );
      console.log('✅ Duplicate check result:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Check duplicate error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengecek duplikat'
      };
    }
  },

  getPublicList: async (queryString = '') => {
    try {
      const endpoint = queryString 
        ? `complaints/public-list.php?${queryString}` 
        : 'complaints/public-list.php';
      const response = await apiRequest(endpoint, 'GET');
      return response;
    } catch (error) {
      console.error('API Error getting public complaints:', error);
      return { success: false, message: error.message };
    }
  },
  
  getAdminStats: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/get-stats.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Get admin stats error:', error);
      return { success: false, message: error.message };
    }
  },
};


// =============================
// Profile API
// =============================
export const profileAPI = {
  get: async () => await apiRequest('profile/get.php', 'GET'),
  update: async (data) => await apiRequest('profile/update.php', 'POST', data),
  changePassword: async (data) => await apiRequest('profile/change-password.php', 'POST', data)
};


// =============================
// Notifications API
// =============================
export const notificationsAPI = {
  getList: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/list.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Get notifications error:', error);
      return { success: false, message: error.message };
    }
  },


  markAsRead: async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/mark-as-read.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({ notification_id: notificationId })
      });
      return await response.json();
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, message: error.message };
    }
  },


  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-as-read.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { success: false, message: error.message };
    }
  },


  deleteNotification: async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/delete.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({ notification_id: notificationId })
      });
      return await response.json();
    } catch (error) {
      console.error('Delete notification error:', error);
      return { success: false, message: error.message };
    }
  },


  deleteAllRead: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/delete-all-read.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Delete all read error:', error);
      return { success: false, message: error.message };
    }
  }
};


// =============================
// Update complaint
// =============================
export const updateComplaint = async (id, complaintData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/complaints/update.php?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420'
      },
      body: JSON.stringify(complaintData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update complaint error:', error);
    return { success: false, message: error.message };
  }
};


// =============================
// Delete complaint
// =============================
export const deleteComplaint = async (id) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/complaints/delete.php?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete complaint error:', error);
    return { success: false, message: error.message };
  }
};


// =============================
// Dashboard API
// =============================
export const dashboardAPI = {
  getStats: async () => await apiRequest('dashboard/stats.php', 'GET'),
};
