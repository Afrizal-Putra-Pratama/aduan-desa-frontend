import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// ✅ MOVE OUTSIDE - FIXED!
const InputField = ({ label, helperText, icon, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />
    </div>
    {helperText && (
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        {helperText}
      </p>
    )}
  </div>
);

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const response = await authAPI.register(dataToSend);
      
      if (response.success) {
        setSuccess('Registrasi berhasil! Mengalihkan ke login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.message || 'Registrasi gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 py-8 transition-colors">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Daftar Akun Baru
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sistem Aduan Desa Wonokerso
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8 transition-colors">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-xs md:text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          )}
          
          {/* Success Alert */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
              <FiCheckCircle className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-xs md:text-sm text-green-800 dark:text-green-200 font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Nama Lengkap"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                icon={<FiUser size={18} />}
                required
              />

              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                icon={<FiMail size={18} />}
                helperText="Gunakan email aktif untuk verifikasi"
                required
              />

              <InputField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                icon={<FiLock size={18} />}
                helperText="Kombinasi huruf dan angka lebih aman"
                required
              />

              <InputField
                label="Konfirmasi Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                icon={<FiLock size={18} />}
                required
              />

              <InputField
                label="Nomor HP"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                icon={<FiPhone size={18} />}
                helperText="Opsional, untuk notifikasi penting"
              />

              <InputField
                label="Alamat"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Desa Wonokerso"
                icon={<FiMapPin size={18} />}
                helperText="Opsional, alamat lengkap Anda"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-xs md:text-sm text-slate-600 dark:text-slate-400">
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

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © 2025 Desa Wonokerso
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
