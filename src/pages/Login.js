import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { FiUser, FiPhone, FiAlertCircle } from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';

function Login() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [loadingOTP, setLoadingOTP] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // ✅ LOAD SAVED CREDENTIALS ON MOUNT
  useEffect(() => {
    const savedUsername = localStorage.getItem('remembered_username');
    const savedPhone = localStorage.getItem('remembered_phone');
    
    if (savedUsername && savedPhone) {
      setUsername(savedUsername);
      setPhone(savedPhone);
      setRememberMe(true);
      console.log('✅ Loaded saved credentials');
    }
  }, []);

  // Validasi No HP
  const validatePhone = (phoneNumber) => {
    if (!/^\d+$/.test(phoneNumber)) {
      return 'Nomor HP hanya boleh berisi angka';
    }
    if (!phoneNumber.startsWith('08')) {
      return 'Nomor HP harus diawali dengan 08';
    }
    if (phoneNumber.length < 10 || phoneNumber.length > 13) {
      return 'Nomor HP harus 10-13 digit';
    }
    return null;
  };

  // Handle Phone Input (Hanya Angka)
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      if (value.length <= 13) {
        setPhone(value);
      }
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!username.trim()) {
      setError('Username wajib diisi');
      return;
    }

    if (!phone.trim()) {
      setError('Nomor HP wajib diisi');
      return;
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setError('');
    setLoadingOTP(true);

    try {
      // ✅ KIRIM USERNAME DAN PHONE (backend akan validasi match)
      const response = await authAPI.loginRequestOTP(username, phone);

      if (response.success) {
        setOtpSent(true);
        setError('');
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Gagal mengirim OTP');
    } finally {
      setLoadingOTP(false);
    }
  };

  // Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username wajib diisi');
      return;
    }

    if (!phone.trim()) {
      setError('Nomor HP wajib diisi');
      return;
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    if (!otp.trim() || otp.length !== 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }

    setLoadingLogin(true);

    try {
      // ✅ KIRIM USERNAME, PHONE, DAN OTP (backend akan validasi match)
      const response = await authAPI.loginVerifyOTP(username, phone, otp);

      if (response.success) {
        // ✅ SAVE CREDENTIALS IF REMEMBER ME CHECKED
        if (rememberMe) {
          localStorage.setItem('remembered_username', username);
          localStorage.setItem('remembered_phone', phone);
          console.log('✅ Credentials saved');
        } else {
          localStorage.removeItem('remembered_username');
          localStorage.removeItem('remembered_phone');
          console.log('🗑️ Credentials removed');
        }

        const userData = {
          ...response.user,
          id: parseInt(response.user.id)
        };
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        login(userData, response.token);
        navigate('/dashboard');
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Terjadi kesalahan');
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Sistem Aduan Desa
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Desa Wonokerso
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 transition-colors">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                {error}
              </p>
            </div>
          )}

          {otpSent && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                ✓ Kode OTP telah dikirim ke WhatsApp Anda
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FiUser size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setOtpSent(false);
                    setError('');
                  }}
                  placeholder="Masukkan username Anda"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* No HP Input + Button Kirim OTP */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">
                Nomor HP
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <FiPhone size={18} />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="08123456789"
                    maxLength={13}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loadingOTP || !username.trim() || !phone.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-50 text-sm"
                >
                  {loadingOTP ? 'Mengirim...' : otpSent ? 'Kirim Ulang' : 'Kirim OTP'}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Format: 08xxxxxxxxxx (10-13 digit)
              </p>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">
                Kode OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setOtp(value);
                  }
                }}
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-center text-xl font-mono tracking-[0.5em]"
                required
              />
              {otpSent && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  Masukkan kode 6 digit dari WhatsApp
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Ingat username dan nomor HP saya
              </label>
            </div>

            {/* Button Masuk */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loadingLogin}
              disabled={!otp || otp.length !== 6}
            >
              {loadingLogin ? 'Memverifikasi...' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
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

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2025 Desa Wonokerso
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
