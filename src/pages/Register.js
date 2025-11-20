import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import Button from '../components/common/Button';
import { FiUser, FiPhone, FiMapPin, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';
import logoWonokerso from '../assets/logo-wonokerso.svg';

function Register() {
  const navigate = useNavigate();

  // Form data
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Validasi Username
  const validateUsername = (username) => {
    if (username.length < 3 || username.length > 50) {
      return 'Username harus 3-50 karakter';
    }
    return null;
  };

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

  // Submit Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi username
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    // Validasi phone
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    // Validasi address
    if (!address.trim() || address.trim().length < 10) {
      setError('Alamat minimal 10 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.registerDirect({
        username,
        phone,
        address
      });

      if (response.success) {
        setShowSuccessModal(true);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Gagal registrasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Handle redirect ke login dari modal
  const handleGoToLogin = () => {
    navigate('/login', { 
      state: { 
        registrationSuccess: true,
        username: username,
        phone: phone
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors">
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
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Daftar Akun Baru
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Desa Wonokerso
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 transition-colors">
  {/* Error Alert */}
  {error && (
    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 animate-fadeIn">
      <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={18} />
      <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 font-medium">
        {error}
      </p>
    </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-4">
    {/* Username Input */}
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-white mb-1.5">
        Username
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <FiUser size={16} />
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError('');
          }}
          placeholder="Nama atau username Anda"
          maxLength={50}
          disabled={loading}
          className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Minimal 3 karakter
      </p>
    </div>

    {/* No HP Input */}
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-white mb-1.5">
        Nomor HP
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <FiPhone size={16} />
        </div>
        <input
          type="text"
          inputMode="numeric"
          pattern="\d*"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="08123456789"
          maxLength={13}
          disabled={loading}
          className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Format: 08xxxxxxxxxx (10-13 digit)
      </p>
    </div>

    {/* Alamat Input */}
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-white mb-1.5">
        Alamat Lengkap
      </label>
      <div className="relative">
        <div className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500">
          <FiMapPin size={16} />
        </div>
        <textarea
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setError('');
          }}
          placeholder="RT/RW, Dusun, Desa"
          rows={2}
          disabled={loading}
          className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Minimal 10 karakter
      </p>
    </div>

    {/* Button Daftar */}
    <div className="pt-2">
      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        loading={loading}
      >
        {loading ? 'Mendaftar...' : 'Daftar'}
      </Button>
    </div>
  </form>

  {/* Login Link */}
  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
    <p className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
      Sudah punya akun?{' '}
      <Link 
        to="/login" 
        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
      >
        Login di sini
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

      {/* Success Modal - Responsive */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-scaleIn transition-colors">
            <button
              onClick={handleGoToLogin}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={18} className="text-slate-600 dark:text-slate-300" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
                <FiCheckCircle className="text-green-600 dark:text-green-400" size={36} />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3">
                Registrasi Berhasil!
              </h3>
              
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                Akun Anda telah berhasil dibuat. Silakan login untuk memverifikasi nomor HP dan mulai menggunakan sistem.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  <strong>Info:</strong> Login pertama akan mengirim kode OTP ke WhatsApp Anda untuk verifikasi.
                </p>
              </div>

              <button
                onClick={handleGoToLogin}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Lanjut ke Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
