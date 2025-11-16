import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';
import { FiUser, FiPhone, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
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
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  // ✅ LOAD SAVED CREDENTIALS ON MOUNT (No Toast)
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

  // ✅ HANDLE SUCCESS MESSAGE FROM REGISTER
  useEffect(() => {
    if (location.state?.registrationSuccess) {
      const { username: regUsername, phone: regPhone } = location.state;
      
      // Set username dan phone dari register
      if (regUsername) setUsername(regUsername);
      if (regPhone) setPhone(regPhone);
      
      // Show success message
      toast.success('Registrasi berhasil! Silakan login untuk verifikasi nomor HP');
      
      // Clear state agar tidak muncul lagi saat refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, toast]);

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
        // Clear OTP saat phone berubah
        if (otpSent) {
          setOtpSent(false);
          setOtp('');
        }
      }
    }
  };

  // Handle Username Change
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    // Clear OTP saat username berubah
    if (otpSent) {
      setOtpSent(false);
      setOtp('');
    }
    setError('');
  };

  // ✅ Handle OTP Input + Auto-paste
  const handleOTPChange = (e) => {
    const value = e.target.value;
    
    // Allow only numbers
    if (value === '' || /^\d+$/.test(value)) {
      if (value.length <= 6) {
        setOtp(value);
        setError('');
      }
    }
  };

  // ✅ Handle Paste Event (Auto-paste OTP dari clipboard) - NO TOAST
  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Extract only numbers from pasted text
    const numbers = pastedData.replace(/\D/g, '');
    
    if (numbers.length > 0) {
      const otpValue = numbers.substring(0, 6);
      setOtp(otpValue);
      setError('');
      console.log('✅ OTP pasted:', otpValue);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!username.trim()) {
      setError('Username wajib diisi');
      toast.error('Username wajib diisi');
      return;
    }

    if (!phone.trim()) {
      setError('Nomor HP wajib diisi');
      toast.error('Nomor HP wajib diisi');
      return;
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      toast.error('❌ ' + phoneError);
      return;
    }

    setError('');
    setLoadingOTP(true);

    try {
      const response = await authAPI.loginRequestOTP(username, phone);

      if (response.success) {
        setOtpSent(true);
        setOtp('');
        setError('');
        toast.success('Kode OTP berhasil dikirim ke WhatsApp Anda');
      } else {
        setError(response.message);
        toast.error('❌ ' + response.message);
      }
    } catch (error) {
      setError('Gagal mengirim OTP. Silakan coba lagi.');
      toast.error('Gagal mengirim OTP. Silakan coba lagi.');
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
      toast.error('Username wajib diisi');
      return;
    }

    if (!phone.trim()) {
      setError('Nomor HP wajib diisi');
      toast.error('Nomor HP wajib diisi');
      return;
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      toast.error('❌ ' + phoneError);
      return;
    }

    if (!otp.trim() || otp.length !== 6) {
      setError('Kode OTP harus 6 digit');
      toast.error('Kode OTP harus 6 digit');
      return;
    }

    setLoadingLogin(true);

    try {
      const response = await authAPI.loginVerifyOTP(username, phone, otp);

      if (response.success) {
        // Save credentials if remember me checked
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
        
        toast.success('Login berhasil! Selamat datang ' + userData.name);
        
        login(userData, response.token);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(response.message);
        toast.error('❌ ' + response.message);
        setOtp('');
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
      setOtp('');
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
          {/* Error Alert (Fallback) */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-fadeIn">
              <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* OTP Sent Success (Visual Feedback) */}
          {otpSent && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-fadeIn">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    Kode OTP telah dikirim ke WhatsApp Anda
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Periksa pesan WhatsApp Anda untuk mendapatkan kode 6 digit
                  </p>
                </div>
              </div>
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
                  onChange={handleUsernameChange}
                  placeholder="Masukkan username Anda"
                  disabled={loadingOTP || loadingLogin}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={loadingOTP || loadingLogin}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loadingOTP || loadingLogin || !username.trim() || !phone.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-50 text-sm shadow-md hover:shadow-lg active:scale-95"
                >
                  {loadingOTP ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </span>
                  ) : otpSent ? 'Kirim Ulang' : 'Kirim OTP'}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Format: 08xxxxxxxxxx (10-13 digit)
              </p>
            </div>

            {/* OTP Input with Auto-paste */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">
                Kode OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={otp}
                onChange={handleOTPChange}
                onPaste={handleOTPPaste}
                maxLength={6}
                placeholder="000000"
                disabled={!otpSent || loadingLogin}
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-center text-xl font-mono tracking-[0.5em] disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
              {otpSent && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  Masukkan atau tempel kode 6 digit dari WhatsApp
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
                disabled={loadingLogin}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
              disabled={!otpSent || !otp || otp.length !== 6}
            >
              Masuk
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
