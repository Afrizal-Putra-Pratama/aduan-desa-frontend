import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiKey, FiTrash2 } from 'react-icons/fi';
import ResetPasswordModal from '../../components/ResetPasswordModal';

function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    const response = await adminAPI.getUserDetail(id);
    
    if (response.success) {
      console.log('✅ User detail loaded:', response.data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Memuat detail user...</p>
        </div>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold"
              >
                <FiArrowLeft />
                Kembali
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Detail User
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleResetPassword}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                <FiKey />
                Reset Password
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                <FiTrash2 />
                Hapus User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {userDetail.user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{userDetail.user.name}</h2>
                <p className="text-sm text-gray-500">User ID: #{userDetail.user.id}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiMail className="text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-800 break-all">{userDetail.user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiPhone className="text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Telepon</p>
                    <p className="text-sm font-semibold text-gray-800">{userDetail.user.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiMapPin className="text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Alamat</p>
                    <p className="text-sm font-semibold text-gray-800">{userDetail.user.address || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiCalendar className="text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Bergabung</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(userDetail.user.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Complaints */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-blue-600">{userDetail.stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{userDetail.stats.pending}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Diproses</p>
                <p className="text-3xl font-bold text-purple-600">{userDetail.stats.in_progress}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Selesai</p>
                <p className="text-3xl font-bold text-green-600">{userDetail.stats.completed}</p>
              </div>
            </div>

            {/* Complaints List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Riwayat Pengaduan ({userDetail.complaints.length})
              </h3>

              {userDetail.complaints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada pengaduan dari user ini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userDetail.complaints.map((complaint) => (
                    <div 
                      key={complaint.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{complaint.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(complaint.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📁 {complaint.category_name}</span>
                        <span>🕒 {formatDate(complaint.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
