import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost/aduan-desa/api/auth/forgot-password.php',
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.success) {
        setShowSuccessModal(true);
        setEmail('');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error:', err);
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
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Lupa Password?
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Kami akan mengirimkan link reset ke email Anda
          </p>
        </div>

        {/* Card */}
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
                Email Terdaftar <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FiMail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Gunakan email yang Anda daftarkan saat registrasi
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
            </Button>
          </form>

          {/* Navigation Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <Link 
              to="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
            >
              <FiArrowLeft size={18} />
              <span>Kembali ke Login</span>
            </Link>

            <div className="text-center">
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
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
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2025 Desa Wonokerso
          </p>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative animate-scaleIn transition-colors">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-300" />
            </button>

            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Email Berhasil Dikirim!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Link reset password telah dikirim ke email Anda
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
                  <span>Buka email Anda dan cari email dari Sistem Aduan Desa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                  <span>Klik link reset password di email tersebut</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                  <span>Buat password baru Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                  <span>Login dengan password baru</span>
                </li>
              </ol>
            </div>

            {/* Important Note */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-6">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>⚠️ Penting:</strong> Link berlaku selama 1 jam. Jika tidak ada di inbox, cek folder spam/junk.
              </p>
            </div>

            {/* Action Button */}
            <Link to="/login">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => setShowSuccessModal(false)}
              >
                Mengerti, Kembali ke Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
