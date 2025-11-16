import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../../services/apiService';
import Button from '../../components/common/Button';
import ThemeToggle from '../../components/common/ThemeToggle';
import { FiLogOut, FiUsers, FiFileText, FiClock, FiCheckCircle, FiAlertCircle, FiMap, FiGrid, FiRefreshCw, FiXCircle, FiEye, FiFilter, FiBell, FiX } from 'react-icons/fi';
import AdminDashboardChart from '../../components/AdminDashboardChart';

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Logout modal states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('admin_data') || 'null');
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminData || !adminToken) {
      navigate('/admin/login');
      return;
    }
    
    setAdmin(adminData);
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await complaintsAPI.getAdminStats();
      
      if (response.success) {
        setStats(response.stats);
        setChartData(response.chartData || []);
      } else {
        setError('Gagal memuat data: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      setError('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show logout confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // ✅ Confirm and execute logout
  const confirmLogout = () => {
    setLoggingOut(true);
    
    setTimeout(() => {
      // Preserve remember me data
      const savedEmail = localStorage.getItem('remembered_admin_email');
      const savedPassword = localStorage.getItem('remembered_admin_password');
      
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_data');
      
      // Restore remember me data
      if (savedEmail) localStorage.setItem('remembered_admin_email', savedEmail);
      if (savedPassword) localStorage.setItem('remembered_admin_password', savedPassword);
      
      navigate('/admin/login');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
            <span className="hidden sm:inline">Admin Panel - Desa Wonokerso</span>
            <span className="sm:hidden">Admin Panel</span>
          </h1>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm font-medium"
            >
              <FiLogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl shadow-lg p-6 md:p-8 mb-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Selamat Datang, {admin?.name}!
          </h2>
          <p className="text-base md:text-lg text-indigo-100 dark:text-indigo-200">
            {admin?.email}
          </p>
        </div>

        {/* Error Alert */}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FiFileText className="text-white" size={20} />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Total Aduan</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg hover:border-yellow-300 dark:hover:border-yellow-600 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <FiClock className="text-white" size={20} />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Menunggu</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{stats.pending}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FiUsers className="text-white" size={20} />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Diproses</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.in_progress}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="text-white" size={20} />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Selesai</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.completed}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg hover:border-red-300 dark:hover:border-red-600 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <FiXCircle className="text-white" size={20} />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Ditolak</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-500">{stats.rejected}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <AdminDashboardChart data={chartData} stats={stats} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 md:p-8 mb-8 transition-colors">
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Menu Admin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <button
              onClick={() => navigate('/admin/complaints')}
              className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:from-indigo-700 hover:to-indigo-800 dark:hover:from-indigo-800 dark:hover:to-indigo-900 transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                <FiFileText className="text-white" size={26} />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Kelola Pengaduan</h4>
              <p className="text-sm text-indigo-100">Lihat dan proses semua pengaduan</p>
            </button>

            <button
              onClick={() => navigate('/admin/categories')}
              className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:from-indigo-700 hover:to-indigo-800 dark:hover:from-indigo-800 dark:hover:to-indigo-900 transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                <FiGrid className="text-white" size={26} />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Kelola Kategori</h4>
              <p className="text-sm text-indigo-100">Manage kategori pengaduan</p>
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:from-indigo-700 hover:to-indigo-800 dark:hover:from-indigo-800 dark:hover:to-indigo-900 transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                <FiUsers className="text-white" size={26} />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Kelola User</h4>
              <p className="text-sm text-indigo-100">Manage user & statistik</p>
            </button>

            <button
              onClick={() => navigate('/admin/map')}
              className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:from-indigo-700 hover:to-indigo-800 dark:hover:from-indigo-800 dark:hover:to-indigo-900 transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                <FiMap className="text-white" size={26} />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Peta Pengaduan</h4>
              <p className="text-sm text-indigo-100">Lihat lokasi pengaduan di peta</p>
            </button>
          </div>
        </div>

        {/* Tips Admin */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-md p-6 md:p-8 transition-colors">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-3xl md:text-4xl">💡</div>
            <h4 className="font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100">
              Tips untuk Admin
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiEye className="text-indigo-600 dark:text-indigo-400" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">Monitor Pengaduan</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Cek pengaduan baru secara berkala</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiFilter className="text-indigo-600 dark:text-indigo-400" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">Update Status</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Ubah status pengaduan yang sudah ditangani</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiBell className="text-indigo-600 dark:text-indigo-400" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">Respons Cepat</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Berikan tanggapan dalam 24 jam</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Logout Confirmation Modal */}
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
                Logout dari Admin Panel?
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Apakah Anda yakin ingin keluar dari akun admin <strong>{admin?.name}</strong>?
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

export default AdminDashboard;
