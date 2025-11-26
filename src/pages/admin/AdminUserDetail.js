import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import { FiArrowLeft, FiPhone, FiMapPin, FiCalendar, FiTrash2, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import Button from '../../components/common/Button';

function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUserDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    const response = await adminAPI.getUserDetail(id);
    if (response.success) {
      setUserDetail(response.data);
    } else {
      alert('Gagal memuat detail user: ' + response.message);
      navigate('/admin/users');
    }
    setLoading(false);
  };

  // Ganti alert confirm dengan modal, ini fungsi panggil saat konfirmasi hapus
  const handleDeleteConfirmed = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.deleteUser(id);
      if (response.success) {
        alert('User berhasil dihapus!');
        navigate('/admin/users');
      } else {
        setError('Gagal menghapus user: ' + response.message);
      }
    } catch (err) {
      setError('Gagal menghapus user, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels = {
      pending: '⏳ Menunggu',
      in_progress: '🔄 Diproses',
      completed: '✅ Selesai',
      rejected: '❌ Ditolak',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Pagination logic
  const complaints = userDetail?.complaints || [];
  const totalPages = Math.ceil(complaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedComplaints = complaints.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Memuat detail user...</p>
        </div>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 text-lg">User tidak ditemukan</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold"
          >
            Kembali ke Daftar User
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Header / Navbar */}
      <div className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-sm sm:text-base transition-colors"
            >
              <FiArrowLeft />
              <span>Kembali</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Detail User
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 transition-colors">
              {/* Avatar and Name */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                  {userDetail.user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 break-words">{userDetail.user.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">User ID: #{userDetail.user.id}</p>
              </div>

              {/* User Info */}
              <div className="space-y-4 text-left mb-6">
                <div className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <FiPhone className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Telepon</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-words">{userDetail.user.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
                  <FiMapPin className="text-pink-600 dark:text-pink-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Alamat</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-words">{userDetail.user.address || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <FiCalendar className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Bergabung</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatDate(userDetail.user.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition font-semibold shadow-md"
                >
                  <FiTrash2 />
                  <span>Hapus User</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats & Complaints */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
                <p className="text-xs mb-1 opacity-90">Total</p>
                <p className="text-3xl font-bold">{userDetail.stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-5 text-white">
                <p className="text-xs mb-1 opacity-90">Pending</p>
                <p className="text-3xl font-bold">{userDetail.stats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
                <p className="text-xs mb-1 opacity-90">Diproses</p>
                <p className="text-3xl font-bold">{userDetail.stats.in_progress}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
                <p className="text-xs mb-1 opacity-90">Selesai</p>
                <p className="text-3xl font-bold">{userDetail.stats.completed}</p>
              </div>
            </div>

            {/* Complaints List with Pagination */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                Riwayat Pengaduan ({complaints.length})
              </h3>

              {complaints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">Belum ada pengaduan dari user ini</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedComplaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition cursor-pointer bg-gradient-to-r from-white to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20"
                        onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate">
                              {complaint.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 break-words">{complaint.description}</p>
                          </div>
                          <div className="ml-0 sm:ml-4 flex-shrink-0">
                            {getStatusBadge(complaint.status)}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row text-xs text-slate-500 dark:text-slate-400 gap-2">
                          <span>📁 {complaint.category_name}</span>
                          <span>🕒 {formatDate(complaint.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                      >
                        <FiChevronLeft />
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
                          Halaman {currentPage} dari {totalPages}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                      >
                        <span className="hidden sm:inline">Selanjutnya</span>
                        <FiChevronRight />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition"
              aria-label="Close modal"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">
              Konfirmasi Hapus User
            </h2>
            <p className="mb-6 text-slate-700 dark:text-slate-300">
              Yakin ingin menghapus user <strong>"{userDetail.user.name}"</strong>? <br />
              Semua pengaduan user ini juga akan dihapus!
            </p>
            {error && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>
            )}
            <div className="flex gap-4 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirmed} loading={loading}>
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserDetail;
