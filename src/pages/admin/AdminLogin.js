import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import { requestNotificationPermission } from '../../config/firebase';
import Button from '../../components/common/Button';
import ThemeToggle from '../../components/common/ThemeToggle';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import logoWonokerso from '../../assets/logo-wonokerso.svg';

// InputField component
const InputField = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  </div>
);

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_admin_email');
    const savedPassword = localStorage.getItem('remembered_admin_password');
    
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(atob(savedPassword));
      setRememberMe(true);
      console.log('✅ Loaded saved admin credentials');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔵 Attempting admin login...');

    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi');
      setLoading(false);
      return;
    }

    try {
      const response = await adminAPI.login(email.trim(), password);
      
      console.log('📥 Login response:', response);

      if (response.success) {
        if (rememberMe) {
          localStorage.setItem('remembered_admin_email', email);
          localStorage.setItem('remembered_admin_password', btoa(password));
          console.log('💾 Admin credentials saved');
        } else {
          localStorage.removeItem('remembered_admin_email');
          localStorage.removeItem('remembered_admin_password');
          console.log('🗑️ Admin credentials removed');
        }

        localStorage.setItem('admin_token', response.token);
        localStorage.setItem('admin_data', JSON.stringify(response.admin));
        console.log('✅ Admin login successful');
        
        setTimeout(async () => {
          try {
            console.log('🔔 Requesting admin notification permission...');
            
            const fcmToken = await requestNotificationPermission();
            
            if (fcmToken) {
              console.log('🔑 Admin FCM Token received:', fcmToken.substring(0, 30) + '...');
              
              const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/aduan-desa/api';
              
              const saveResponse = await fetch(`${API_URL}/admin/save-fcm-token.php`, {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer ' + response.token,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fcm_token: fcmToken })
              });
              
              const saveResult = await saveResponse.json();
              
              if (saveResult.success) {
                console.log('✅ Admin FCM token saved to backend');
              } else {
                console.error('❌ Failed to save admin FCM token:', saveResult.message);
              }
            } else {
              console.log('ℹ️ FCM not available - requires HTTPS or localhost');
            }
          } catch (error) {
            console.warn('⚠️ Error requesting admin notification (non-critical):', error.message);
          }
        }, 1000);
        
        navigate('/admin/dashboard');
      } else {
        console.log('❌ Login failed:', response.message);
        setError(response.message || 'Email atau password salah');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <img 
              src={logoWonokerso} 
              alt="Logo Desa Wonokerso"
              className="w-16 h-16 object-contain drop-shadow-lg"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Portal Admin
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Sistem Aduan Desa Wonokerso
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 sm:p-8 transition-colors">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Login Admin
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Akses khusus untuk administrator
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 animate-fadeIn">
              <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 font-medium">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email Admin"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="admin@wonokerso.go.id"
              icon={<FiMail size={16} />}
              disabled={loading}
              required
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Masukkan password admin"
              icon={<FiLock size={16} />}
              disabled={loading}
              required
            />

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors select-none">
                  Ingat saya
                </span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
              >
                {loading ? 'Memproses...' : 'Login sebagai Admin'}
              </Button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 transition-colors">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-0.5">
                    Izinkan Notifikasi
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Untuk menerima alert pengaduan baru
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2025 Desa Wonokerso
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
