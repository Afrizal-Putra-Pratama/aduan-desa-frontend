import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { complaintsAPI } from '../services/apiService';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';
import { FiPlus, FiList, FiLogOut, FiClock, FiCheckCircle, FiAlertCircle, FiUser, FiGlobe, FiRefreshCw, FiBarChart2, FiSettings, FiMapPin, FiCamera, FiEye, FiX } from 'react-icons/fi';
import NotificationBell from '../components/NotificationBell';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const fetchStats = async () => {
    console.log('🔵 Fetching dashboard stats...');
    setLoading(true);
    setError(null);
    
    try {
      const response = await complaintsAPI.getList();
      console.log('📥 Stats response:', response);
      
      if (response.success) {
        const complaints = response.data || [];
        console.log('✅ Complaints loaded:', complaints.length);
        
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = parseInt(storedUser.id);
        
        const wrongUserComplaints = complaints.filter(c => {
          const complaintUserId = parseInt(c.user_id);
          return complaintUserId !== currentUserId;
        });
        
        if (wrongUserComplaints.length > 0) {
          console.error('❌ DATA LEAK DETECTED!');
          setError('Kesalahan data! Ada pengaduan dari user lain. Silakan logout dan login ulang.');
          return;
        }
        
        const statsData = {
          total: complaints.length,
          pending: complaints.filter(c => c.status === 'pending').length,
          in_progress: complaints.filter(c => c.status === 'in_progress').length,
          completed: complaints.filter(c => c.status === 'completed').length,
        };
        
        setStats(statsData);
      } else {
        setError('Gagal memuat data: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      setError('Terjadi kesalahan saat memuat data. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setLoggingOut(true);
    
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 sticky top-0 z-50 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
            <span className="hidden sm:inline">Sistem Aduan Desa</span>
            <span className="sm:hidden">Aduan Desa</span>
          </h1>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="notification-bell-wrapper">
              <NotificationBell />
            </div>
            
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                title="Profile Menu"
              >
                <FiUser className="text-indigo-700 dark:text-indigo-300" size={20} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-scaleIn">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.phone}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <FiSettings className="text-slate-600 dark:text-slate-400" size={18} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Pengaturan Profile
                    </span>
                  </button>

                  <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FiLogOut className="text-red-600 dark:text-red-400" size={18} />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl shadow-lg p-6 md:p-8 mb-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Selamat Datang, {user?.name}!
          </h2>
          <p className="text-base md:text-lg text-indigo-100 dark:text-indigo-200">
            Kelola pengaduan Anda dengan mudah dan cepat
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-800 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-red-600 dark:text-red-400" size={24} />
              <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
            </div>
            <Button
              onClick={fetchStats}
              variant="danger"
              size="sm"
              icon={<FiRefreshCw />}
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Pengaduan</p>
                <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <FiList className="text-white" size={26} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 hover:shadow-xl hover:border-yellow-300 dark:hover:border-yellow-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Menunggu</p>
                <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-500">{stats.pending}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
                <FiClock className="text-white" size={26} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Diproses</p>
                <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{stats.in_progress}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <FiBarChart2 className="text-white" size={26} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 hover:shadow-xl hover:border-green-300 dark:hover:border-green-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Selesai</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-500">{stats.completed}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <FiCheckCircle className="text-white" size={26} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/public-complaints')}
            className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 transition-all transform hover:-translate-y-1 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiGlobe className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                  Pengaduan Publik
                </h3>
                <p className="text-xs md:text-sm text-blue-100">
                  Lihat laporan warga lain yang dipublikasikan
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/complaints/create')}
            className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-2xl hover:from-indigo-700 hover:to-indigo-800 dark:hover:from-indigo-800 dark:hover:to-indigo-900 transition-all transform hover:-translate-y-1 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiPlus className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                  Buat Pengaduan Baru
                </h3>
                <p className="text-xs md:text-sm text-indigo-100">
                  Laporkan keluhan atau masalah di desa Anda
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/complaints')}
            className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-2xl hover:from-indigo-700 hover:to-indigo-800 dark:hover:from-indigo-800 dark:hover:to-indigo-900 transition-all transform hover:-translate-y-1 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiList className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                  Pengaduan Saya
                </h3>
                <p className="text-xs md:text-sm text-indigo-100">
                  Cek status dan tanggapan pengaduan Anda
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Tips Box */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-md p-6 md:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-3xl md:text-4xl">💡</div>
            <h4 className="font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100">
              Tips Membuat Pengaduan Efektif
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiEye className="text-indigo-600 dark:text-indigo-400" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">Deskripsi Jelas</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Jelaskan masalah secara detail dan spesifik</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiCamera className="text-indigo-600 dark:text-indigo-400" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">Upload Foto Bukti</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Lampirkan foto untuk mempercepat proses</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMapPin className="text-indigo-600 dark:text-indigo-400" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">Tandai Lokasi</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Gunakan peta untuk menandai lokasi kejadian</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="text-indigo-600 dark:text-indigo-400" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">Pantau Status</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Cek notifikasi untuk update tanggapan admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scaleIn transition-colors">
            <button
              onClick={() => setShowLogoutModal(false)}
              disabled={loggingOut}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-300" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLogOut className="text-red-600 dark:text-red-400" size={40} />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                Logout dari Akun?
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Apakah Anda yakin ingin keluar dari akun <strong>{user?.name}</strong>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={confirmLogout}
                  disabled={loggingOut}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Logout...</span>
                    </>
                  ) : (
                    'Ya, Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
