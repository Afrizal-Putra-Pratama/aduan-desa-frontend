import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://econometric-unvicariously-anjelica.ngrok-free.dev';

export const adminAPI = {
  // Login admin
  login: async (email, password) => {
    console.log('🔵 Admin login attempt');
    console.log('📤 Sending data:', { email: email, password: '***' });
    
    try {
      const res = await axios.post(`${API_BASE_URL}/admin/login.php`, {
        email: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
        }
      });
      
      console.log('✅ Admin login response:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Admin login error:', error);
      console.error('❌ Error response:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Network error' 
      };
    }
  },

  // GET ALL COMPLAINTS
  getAllComplaints: async (queryParams = '') => {
    console.log('🔵 Getting all complaints (admin) with params:', queryParams);
    const token = localStorage.getItem('admin_token');
    
    const timestamp = new Date().getTime();
    const separator = queryParams ? '&' : '?';
    const url = `${API_BASE_URL}/complaints/admin-list.php${queryParams ? '?' + queryParams : ''}${separator}_t=${timestamp}`;
    
    console.log('📍 Request URL:', url);
    
    try {
      const res = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
        }
      });
      
      console.log('✅ Complaints loaded:', res.data.count, 'complaints');
      return res.data;
    } catch (error) {
      console.error('❌ Error getting complaints:', error);
      return { success: false, message: 'Failed to load complaints' };
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    console.log('🔵 Getting dashboard stats');
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/dashboard/stats.php`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
          }
        }
      );
      
      console.log('✅ Dashboard stats:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return { success: false, message: 'Failed to load stats' };
    }
  },

  // Update complaint status
  updateStatus: async (complaintId, status) => {
    console.log('🔵 Updating complaint status:', complaintId, status);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/update-status.php`,
        { complaint_id: complaintId, status: status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
          }
        }
      );
      
      console.log('✅ Status updated:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error updating status:', error);
      return { success: false, message: error.response?.data?.message || 'Network error' };
    }
  },

  // Add response to complaint
  addResponse: async (complaintId, response) => {
    console.log('🔵 Adding response to complaint:', complaintId);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/add-response.php`,
        { complaint_id: complaintId, response: response },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
          }
        }
      );
      
      console.log('✅ Response added:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error adding response:', error);
      return { success: false, message: error.response?.data?.message || 'Network error' };
    }
  },

  // CATEGORY MANAGEMENT
  getCategories: async () => {
    console.log('🔵 Getting categories');
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/categories/list.php`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
        }
      });
      console.log('✅ Categories loaded:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error getting categories:', error);
      return { success: false, message: 'Failed to load categories' };
    }
  },

  createCategory: async (categoryData) => {
    console.log('🔵 Creating category:', categoryData);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/categories/create.php`,
        categoryData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
          } 
        }
      );
      console.log('✅ Category created:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error creating category:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create category' 
      };
    }
  },

  updateCategory: async (categoryData) => {
    console.log('🔵 Updating category:', categoryData);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/categories/update.php`,
        categoryData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
          } 
        }
      );
      console.log('✅ Category updated:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error updating category:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update category' 
      };
    }
  },

  deleteCategory: async (categoryId) => {
    console.log('🔵 Deleting category:', categoryId);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/categories/delete.php`,
        { id: categoryId },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
          } 
        }
      );
      console.log('✅ Category deleted:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete category' 
      };
    }
  },

  // USER MANAGEMENT
  getUsers: async (search = '') => {
    console.log('🔵 Getting users, search:', search);
    const token = localStorage.getItem('admin_token');
    
    const timestamp = new Date().getTime();
    const searchParam = search ? `search=${encodeURIComponent(search)}&` : '';
    const url = `${API_BASE_URL}/admin/users/list.php?${searchParam}_t=${timestamp}`;
    
    try {
      const res = await axios.get(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
        }
      });
      console.log('✅ Users loaded:', res.data.count, 'users');
      return res.data;
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return { success: false, message: 'Failed to load users' };
    }
  },

  getUserDetail: async (userId) => {
    console.log('🔵 Getting user detail:', userId);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users/detail.php?id=${userId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
        }
      });
      console.log('✅ User detail loaded:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error getting user detail:', error);
      return { success: false, message: 'Failed to load user detail' };
    }
  },

  deleteUser: async (userId) => {
    console.log('🔵 Deleting user:', userId);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/users/delete.php`,
        { user_id: userId },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
          } 
        }
      );
      console.log('✅ User deleted:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete user' 
      };
    }
  },

  resetPassword: async (userId, newPassword) => {
    console.log('🔵 Resetting password for user:', userId);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/users/reset-password.php`,
        { user_id: userId, new_password: newPassword },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
          } 
        }
      );
      console.log('✅ Password reset:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  },

  // COMPLAINTS PUBLISH
  togglePublic: async (complaintId, isPublic) => {
    console.log('🔵 Toggling complaint public:', complaintId, isPublic);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/toggle-public.php`,
        { complaint_id: complaintId, is_public: isPublic },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420' // ✅ NGROK BYPASS
          } 
        }
      );
      return res.data;
    } catch (error) {
      console.error('❌ Error toggling complaint public:', error);
      return { success: false, message: error.message };
    }
  },
};
