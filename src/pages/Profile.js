import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/apiService';
import Button from '../components/common/Button';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiLock, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';

function Profile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      if (isMounted) {
        await fetchProfile();
      }
    };
    
    loadProfile();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await profileAPI.get();
      
      if (response && response.success) {
        setUser(response.data);
        setProfileForm({
          name: response.data.name,
          phone: response.data.phone || ''
        });
        setError('');
      } else {
        setError(response?.message || 'Gagal memuat profile');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleProfileSubmitAttempt = (e) => {
    e.preventDefault();
    setError('');
    
    if (profileForm.phone && profileForm.phone.length < 12) {
      setError('Nomor telepon minimal 12 digit');
      return;
    }
    
    setShowProfileConfirm(true);
  };

  const handlePasswordSubmitAttempt = (e) => {
    e.preventDefault();
    setError('');
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }
    
    setShowPasswordConfirm(true);
  };

  const confirmProfileUpdate = async () => {
    setShowProfileConfirm(false);
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await profileAPI.update(profileForm);
      
      if (response && response.success) {
        setSuccess('Profile berhasil diupdate!');
        setError('');
        setTimeout(() => fetchProfile(), 500);
      } else {
        setError(response?.message || 'Gagal update profile');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat update profile');
    } finally {
      setSaving(false);
    }
  };

  const confirmPasswordChange = async () => {
    setShowPasswordConfirm(false);
    setSaving(true);

    try {
      const response = await profileAPI.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      
      if (response && response.success) {
        setSuccess('Password berhasil diubah!');
        setError('');
        
        setPasswordForm({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setError(response?.message || 'Gagal ubah password');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat ubah password');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Memuat profile...</p>
        </div>
      </div>
    );
  }

  // Custom Input Component with Dark Mode
  const CustomInput = ({ label, helperText, icon: Icon, ...props }) => (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Icon size={20} />
          </div>
        )}
        <input
          {...props}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500`}
        />
      </div>
      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{helperText}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Kembali</span>
          </button>
          <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Profile Saya</h1>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-800 rounded-xl flex items-start gap-3">
            <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
            <span className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-800 rounded-xl flex items-start gap-3">
            <FiCheckCircle className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={20} />
            <span className="text-sm text-green-800 dark:text-green-200 font-medium">{success}</span>
          </div>
        )}

        {/* Profile Info Card */}
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-8 mb-6 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <FiUser className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Informasi Akun</h2>
          </div>
          
          <form onSubmit={handleProfileSubmitAttempt} className="space-y-5">
            <CustomInput
              label="Nama Lengkap"
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              icon={FiUser}
              required
            />

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Email tidak dapat diubah</p>
            </div>

            <CustomInput
              label="Nomor Telepon"
              type="tel"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              icon={FiPhone}
              placeholder="081234567890"
              helperText="Minimal 12 digit (contoh: 081234567890)"
              minLength={12}
            />

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-8 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <FiLock className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ubah Password</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmitAttempt} className="space-y-5">
            <CustomInput
              label="Password Lama"
              type="password"
              name="old_password"
              value={passwordForm.old_password}
              onChange={handlePasswordChange}
              icon={FiLock}
              required
            />

            <CustomInput
              label="Password Baru"
              type="password"
              name="new_password"
              value={passwordForm.new_password}
              onChange={handlePasswordChange}
              icon={FiLock}
              helperText="Minimal 6 karakter"
              required
              minLength={6}
            />

            <CustomInput
              label="Konfirmasi Password Baru"
              type="password"
              name="confirm_password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordChange}
              icon={FiLock}
              helperText="Ulangi password baru"
              required
              minLength={6}
            />

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiLock size={20} />
                {saving ? 'Mengubah...' : 'Ubah Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 transition-colors">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Tips Keamanan:</strong> Gunakan password yang kuat dengan kombinasi huruf besar, huruf kecil, angka, dan simbol.
          </p>
        </div>
      </div>

      {/* Profile Confirmation Modal */}
      {showProfileConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-scaleIn transition-colors">
            <button
              onClick={() => setShowProfileConfirm(false)}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-300" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-indigo-600 dark:text-indigo-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Konfirmasi Perubahan</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Apakah Anda yakin ingin menyimpan perubahan data profile Anda?
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Nama Lengkap</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{profileForm.name}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Nomor Telepon</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{profileForm.phone || 'Tidak diisi'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowProfileConfirm(false)}
                className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmProfileUpdate}
                className="flex-1 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Confirmation Modal */}
      {showPasswordConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-scaleIn transition-colors">
            <button
              onClick={() => setShowPasswordConfirm(false)}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-300" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiLock className="text-orange-600 dark:text-orange-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Ubah Password?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Password Anda akan diubah. Pastikan Anda mengingat password baru.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-6 transition-colors">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <p className="font-semibold text-orange-800 dark:text-orange-200 mb-1">Perhatian</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Setelah password diubah, Anda mungkin perlu login ulang di perangkat lain.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordConfirm(false)}
                className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmPasswordChange}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                Ya, Ubah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
