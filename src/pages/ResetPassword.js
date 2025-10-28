import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';
import { FiLock, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import axios from 'axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    console.log('🔵 Sending reset request:', { token, password: '***' });
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost/aduan-desa/api/auth/reset-password.php',
        { token, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('✅ Response:', response.data);

      if (response.data.success) {
        setShowSuccessModal(true);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Invalid Token Page
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Token Tidak Valid
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Link reset password sudah kadaluarsa
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8 text-center transition-colors">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Silakan request link reset password baru untuk melanjutkan.
            </p>
            <Button
              onClick={() => navigate('/forgot-password')}
              variant="primary"
              fullWidth
              size="lg"
            >
              Request Reset Password Baru
            </Button>
            <div className="mt-4">
              <Link 
                to="/login"
                className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors text-sm"
              >
                <FiArrowLeft size={18} />
                <span>Kembali ke Login</span>
              </Link>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-500">© 2025 Desa Wonokerso</p>
          </div>
        </div>
      </div>
    );
  }

  // Reset Password Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Buat Password Baru
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Masukkan password baru Anda
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8 transition-colors">
          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Password Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FiLock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Gunakan kombinasi huruf dan angka untuk keamanan
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FiLock size={18} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
            >
              {loading ? 'Memproses...' : 'Reset Password'}
            </Button>
          </form>

          {/* Navigation */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link 
              to="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
            >
              <FiArrowLeft size={18} />
              <span>Kembali ke Login</span>
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">© 2025 Desa Wonokerso</p>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative animate-scaleIn transition-colors">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Password Berhasil Direset!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Password Anda telah berhasil diperbarui
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Langkah Selanjutnya:
              </p>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                  <span>Klik tombol di bawah untuk ke halaman login</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                  <span>Login menggunakan email dan password baru Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                  <span>Mulai gunakan sistem seperti biasa</span>
                </li>
              </ol>
            </div>

            {/* Important Note */}
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-3 mb-6">
              <p className="text-xs text-green-800 dark:text-green-200">
                <strong>✅ Tips:</strong> Simpan password baru Anda di tempat yang aman dan jangan bagikan ke siapapun.
              </p>
            </div>

            {/* Action Button */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => navigate('/login')}
            >
              Login Sekarang
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
