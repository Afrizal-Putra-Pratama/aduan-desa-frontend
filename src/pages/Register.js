import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import Button from '../components/common/Button';
import { FiUser, FiPhone, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';

function Register() {
  const navigate = useNavigate();

  // Form data
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Submit Registration (Langsung tanpa OTP)
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
        alert('✅ Registrasi berhasil! Silakan login untuk verifikasi nomor HP');
        navigate('/login');
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Gagal registrasi');
    } finally {
      setLoading(false);
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
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
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
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
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
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all"
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
    </div>
  );
}

export default Register;
