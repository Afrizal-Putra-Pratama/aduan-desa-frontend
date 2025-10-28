import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    
    if (savedEmail && savedPassword) {
      setFormData({
        email: savedEmail,
        password: atob(savedPassword)
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🧹 Clearing old session data...');
      
      const emailToRemember = formData.email;
      const passwordToRemember = formData.password;
      const shouldRemember = rememberMe;
      
      localStorage.clear();
      sessionStorage.clear();
      
      if (shouldRemember) {
        localStorage.setItem('remembered_email', emailToRemember);
        localStorage.setItem('remembered_password', btoa(passwordToRemember));
        console.log('💾 Credentials saved for next login');
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
        console.log('🗑️ Saved credentials removed');
      }
      
      console.log('📤 Login request:', { email: formData.email, password: '***' });
      const response = await authAPI.login(formData);
      console.log('📥 Login response:', response);

      if (response.success) {
        const userData = {
          ...response.user,
          id: parseInt(response.user.id)
        };
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Login successful!');
        login(userData, response.token);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Email atau password salah');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
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
        {/* Header - COMPACT */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Sistem Aduan Desa
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Desa Wonokerso
          </p>
        </div>

        {/* Card - COMPACT */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8 transition-colors">
          <div className="mb-5">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Login
            </h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Error Alert - COMPACT */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-xs md:text-sm text-red-800 dark:text-red-200 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Form - COMPACT SPACING */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              icon={<FiMail />}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              icon={<FiLock />}
              required
            />
            
            <div className="flex items-center justify-between text-xs md:text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors select-none">
                  Ingat saya
                </span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          {/* Register Link - COMPACT */}
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-xs md:text-sm text-slate-600 dark:text-slate-400">
              Belum punya akun?{' '}
              <Link 
                to="/register" 
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Footer - COMPACT */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2025 Desa Wonokerso
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
