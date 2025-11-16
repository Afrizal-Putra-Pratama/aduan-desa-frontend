import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import Button from '../components/common/Button';
import { FiUser, FiPhone, FiMapPin, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';

function Register() {
  const navigate = useNavigate();

  // Form data
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Validasi Username (Bebas)
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
        // ✅ Tampilkan modal success
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

  // ✅ Handle redirect ke login dari modal
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
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-fadeIn">
              <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                {error}
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
                    setError('');
                  }}
                  placeholder="Nama atau username Anda"
                  maxLength={50}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Bebas, minimal 3 karakter
              </p>
            </div>

            {/* No HP Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">
                Nomor HP
              </label>
              <div className="relative">
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
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Format: 08xxxxxxxxxx (10-13 digit, untuk verifikasi login)
              </p>
            </div>

            {/* Alamat Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">
                Alamat Lengkap
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400 dark:text-slate-500">
                  <FiMapPin size={18} />
                </div>
                <textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setError('');
                  }}
                  placeholder="RT/RW, Dusun, Desa"
                  rows={3}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Minimal 10 karakter
              </p>
            </div>

            {/* Button Daftar */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
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

      {/* ✅ Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scaleIn transition-colors">
            <button
              onClick={handleGoToLogin}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-300" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <FiCheckCircle className="text-green-600 dark:text-green-400" size={40} />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                Registrasi Berhasil!
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Akun Anda telah berhasil dibuat. Silakan login untuk memverifikasi nomor HP dan mulai menggunakan sistem.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Info:</strong> Login pertama akan mengirim kode OTP ke WhatsApp Anda untuk verifikasi.
                </p>
              </div>

              <button
                onClick={handleGoToLogin}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
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
