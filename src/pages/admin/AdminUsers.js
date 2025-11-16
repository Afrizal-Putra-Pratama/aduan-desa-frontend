import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { FiSearch, FiEye, FiTrash2, FiHome, FiRefreshCw, FiUsers, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const searchInput = useRef();

  // Auto-hide navbar
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

useEffect(() => {
  fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  const timeoutId = setTimeout(() => {
    setCurrentPage(1);
    fetchUsers(search);
  }, 500);
  return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [search]);


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const fetchUsers = async (s = search) => {
    setLoading(true);
    const response = await adminAPI.getUsers(s);
    if (response.success) {
      setUsers(response.data);
      setError('');
    } else {
      setUsers([]);
      setError('Gagal memuat users: ' + response.message);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers('');
    setSearch('');
    setCurrentPage(1);
    setRefreshing(false);
    searchInput.current && searchInput.current.focus();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearch('');
      setCurrentPage(1);
      fetchUsers('');
      searchInput.current && searchInput.current.blur();
    }
  };

  const handleDeleteAttempt = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const response = await adminAPI.deleteUser(userToDelete.id);
    if (response.success) {
      setSuccess('User berhasil dihapus!');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Gagal menghapus user: ' + response.message);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Auto-Hide Navbar */}
      <nav 
        className={`bg-white dark:bg-slate-800 shadow-md fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium border border-slate-200 dark:border-slate-600"
            >
              <FiHome size={18} />
              <span className="hidden md:inline">Dashboard</span>
            </button>
            <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">Kelola User</h1>
          </div>
        </div>
      </nav>

      <div className="h-16"></div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-xl flex items-start gap-3 shadow-sm">
            <FiCheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
            <span className="text-sm text-green-800 dark:text-green-300 font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl flex items-start gap-3 shadow-sm">
            <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
            <span className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6">
          {/* Total Info Card */}
          <div className="flex items-center bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-md font-semibold gap-2">
            <FiUsers size={20} className="opacity-90" />
            <span className="text-sm">Total User:</span>
            <span className="text-xl font-bold">{totalItems}</span>
            {totalPages > 1 && (
              <span className="text-xs opacity-75 ml-1">(Hal {currentPage}/{totalPages})</span>
            )}
          </div>

          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                ref={searchInput}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Cari nama atau telepon..."
                className="w-full pl-10 pr-10 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              {!!search && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"
                  onClick={() => { 
                    setSearch(''); 
                    setCurrentPage(1);
                    fetchUsers(''); 
                    searchInput.current && searchInput.current.focus(); 
                  }}
                >
                  <FiX size={18} />
                </button>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition font-semibold disabled:opacity-50 shadow-sm"
            >
              <FiRefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Memuat...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Memuat data user...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-12 text-center transition-colors">
            <FiUsers size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Tidak Ada User</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{search ? 'Tidak ada user yang cocok dengan pencarian.' : 'Belum ada user terdaftar.'}</p>
            {!!search && (
              <Button onClick={() => { 
                setSearch(''); 
                setCurrentPage(1);
                fetchUsers(''); 
              }} variant="primary">
                Reset Pencarian
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Telepon</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Pengaduan</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Bergabung</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{user.total_complaints}</span>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {user.pending_complaints} pending · {user.completed_complaints} selesai
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAttempt(user)}
                            className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                            title="Hapus User"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setUserToDelete(null);
              }}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Hapus User?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Apakah Anda yakin ingin menghapus user ini?
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Nama:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{userToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Telepon:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{userToDelete.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Pengaduan:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{userToDelete.total_complaints}</span>
                </div>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-400 mb-1 text-sm">Perhatian</p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Semua pengaduan user ini akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
