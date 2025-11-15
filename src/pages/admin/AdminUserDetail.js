import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCalendar, FiKey, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ResetPasswordModal from '../../components/ResetPasswordModal';

function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUserDetail();
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

  const handleResetPassword = () => {
    setShowResetModal(true);
  };

  const handleResetSuccess = () => {
    setShowResetModal(false);
    alert('Password berhasil direset!');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus user "${userDetail.user.name}"?\n\nSemua pengaduan user ini juga akan dihapus!`)) {
      return;
    }
    const response = await adminAPI.deleteUser(id);
    if (response.success) {
      alert('User berhasil dihapus!');
      navigate('/admin/users');
    } else {
      alert('Gagal menghapus user: ' + response.message);
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
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Memuat detail user...</p>
        </div>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">User tidak ditemukan</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Kembali ke Daftar User
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header / Navbar - Simplified */}
      <div className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold text-sm sm:text-base"
            >
              <FiArrowLeft />
              <span>Kembali</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Detail User
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card with Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
              {/* Avatar and Name */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                  {userDetail.user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-800 break-words">{userDetail.user.name}</h2>
                <p className="text-sm text-gray-500">User ID: #{userDetail.user.id}</p>
              </div>

              {/* User Info */}
              <div className="space-y-4 text-left mb-6">
                <div className="flex items-start gap-3 bg-indigo-50 p-3 rounded-lg">
                  <FiMail className="text-indigo-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold">Email</p>
                    <p className="text-sm font-semibold text-gray-800 break-words">{userDetail.user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-purple-50 p-3 rounded-lg">
                  <FiPhone className="text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold">Telepon</p>
                    <p className="text-sm font-semibold text-gray-800 break-words">{userDetail.user.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-pink-50 p-3 rounded-lg">
                  <FiMapPin className="text-pink-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold">Alamat</p>
                    <p className="text-sm font-semibold text-gray-800 break-words">{userDetail.user.address || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
                  <FiCalendar className="text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-semibold">Bergabung</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(userDetail.user.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleResetPassword}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition font-semibold shadow-md"
                >
                  <FiKey />
                  <span>Reset Password</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold shadow-md"
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
            <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Riwayat Pengaduan ({complaints.length})
              </h3>

              {complaints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada pengaduan dari user ini</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedComplaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-md transition cursor-pointer bg-gradient-to-r from-white to-indigo-50"
                        onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 mb-1 truncate">
                              {complaint.title}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2 break-words">{complaint.description}</p>
                          </div>
                          <div className="ml-0 sm:ml-4 flex-shrink-0">
                            {getStatusBadge(complaint.status)}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row text-xs text-gray-500 gap-2">
                          <span>📁 {complaint.category_name}</span>
                          <span>🕒 {formatDate(complaint.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                      >
                        <FiChevronLeft />
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-semibold">
                          Halaman {currentPage} dari {totalPages}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
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

      {/* Reset Password Modal */}
      {showResetModal && (
        <ResetPasswordModal
          user={userDetail.user}
          onClose={() => setShowResetModal(false)}
          onSuccess={handleResetSuccess}
        />
      )}
    </div>
  );
}

export default AdminUserDetail;
