import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { complaintsAPI } from '../../services/apiService';
import { adminAPI } from '../../services/adminAPI';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { FiArrowLeft, FiClock, FiMapPin, FiUser, FiMessageSquare, FiAlertCircle, FiCheckCircle, FiFolder, FiMail, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function AdminComplaintDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  const [responseText, setResponseText] = useState('');
  const [addingResponse, setAddingResponse] = useState(false);

  const [updatingPublic, setUpdatingPublic] = useState(false);
  const [showPublicConfirm, setShowPublicConfirm] = useState(false);

  // Auto-hide navbar
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    fetchComplaintDetail();
  }, [id]);

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

  const fetchComplaintDetail = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await complaintsAPI.getById(id);
      if (response.success) {
        setComplaint(response.data);
        setNewStatus(response.data.status);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error.message || 'Error saat memuat pengaduan.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdateAttempt = () => {
    if (newStatus === complaint.status) {
      setError('Status tidak berubah');
      return;
    }
    setShowStatusConfirm(true);
  };

  const confirmUpdateStatus = async () => {
    setShowStatusConfirm(false);
    setUpdatingStatus(true);
    setError('');
    setSuccess('');

    const response = await adminAPI.updateStatus(complaint.id, newStatus);
    if (response.success) {
      setSuccess('Status berhasil diupdate!');
      fetchComplaintDetail();
    } else {
      setError(response.message);
    }
    setUpdatingStatus(false);
  };

  const handleAddResponse = async e => {
    e.preventDefault();
    if (!responseText.trim()) {
      setError('Respon tidak boleh kosong');
      return;
    }

    setAddingResponse(true);
    setError('');
    setSuccess('');

    const response = await adminAPI.addResponse(complaint.id, responseText);

    if (response.success) {
      setSuccess('Respon berhasil ditambahkan!');
      setResponseText('');
      fetchComplaintDetail();
    } else {
      setError(response.message);
    }
    setAddingResponse(false);
  };

  const handleTogglePublicAttempt = () => {
    setShowPublicConfirm(true);
  };

  const confirmTogglePublic = async () => {
    setShowPublicConfirm(false);
    if (updatingPublic) return;
    setUpdatingPublic(true);

    try {
      const newValue = complaint.is_public ? 0 : 1;
      const res = await adminAPI.togglePublic(complaint.id, newValue);
      if (res.success) {
        setComplaint(prev => ({ ...prev, is_public: newValue }));
        setSuccess(`Pengaduan sudah ${newValue ? 'dipublikasikan' : 'diprivasikan'}`);
      } else {
        setError('Gagal update status publik: ' + res.message);
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setUpdatingPublic(false);
  };

  const getPriorityBadge = priority => {
    const badges = {
      low: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      medium: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    const labels = {
      low: '🟢 Rendah',
      medium: '🟡 Sedang',
      high: '🔴 Tinggi',
    };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${badges[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Menunggu',
      in_progress: 'Diproses',
      completed: 'Selesai',
      rejected: 'Ditolak',
    };
    return labels[status] || status;
  };

  const formatDate = dateString => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Memuat detail pengaduan...</p>
        </div>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
        <nav className="bg-white dark:bg-slate-800 border-b border-slate-300 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/complaints')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium border border-slate-200 dark:border-slate-600"
            >
              <FiArrowLeft size={20} />
              <span>Kembali</span>
            </button>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle size={40} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Pengaduan Tidak Ditemukan
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error || 'Pengaduan tidak ditemukan atau sudah dihapus.'}
            </p>
            <Button
              onClick={() => navigate('/admin/complaints')}
              variant="primary"
              icon={<FiArrowLeft />}
            >
              Kembali ke Daftar Pengaduan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Auto-Hide Navbar */}
      <nav 
        className={`bg-white dark:bg-slate-800 shadow-md fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/complaints')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium border border-slate-200 dark:border-slate-600"
          >
            <FiArrowLeft size={20} />
            <span>Kembali</span>
          </button>
          <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">Detail Pengaduan</h1>
        </div>
      </nav>

      <div className="h-16"></div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alerts */}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-xl flex items-start gap-3 shadow-sm">
                <FiCheckCircle className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={20} />
                <span className="text-sm text-green-800 dark:text-green-200 font-medium">{success}</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl flex items-start gap-3 shadow-sm">
                <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
                <span className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</span>
              </div>
            )}

            {/* Header Card with Highlighted User Info */}
            <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md overflow-hidden">
              {/* User Info - HIGHLIGHTED */}
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <FiUser size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{complaint.user_name}</h3>
                    <div className="flex items-center gap-2 text-indigo-100 text-sm">
                      <FiMail size={14} />
                      <span>{complaint.user_email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-indigo-100 text-sm">
                  <FiClock size={14} />
                  <span>Dibuat: {formatDate(complaint.created_at)}</span>
                </div>
              </div>

              {/* Complaint Info */}
              <div className="p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">{complaint.title}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <FiFolder className="text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium">{complaint.category_name}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge status={complaint.status} />
                  {getPriorityBadge(complaint.priority)}
                </div>
                {complaint.location && (
                  <div className="mt-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <FiMapPin className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm">{complaint.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Detail Pengaduan</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{complaint.description}</p>
            </div>

            {/* Map */}
            {complaint.latitude && complaint.longitude &&
              parseFloat(complaint.latitude) !== 0 && parseFloat(complaint.longitude) !== 0 && (
              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Lokasi Pengaduan</h2>
                <div className="border-2 border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden relative z-0" style={{ height: '350px' }}>
                  <MapContainer
                    center={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}
                    zoom={15}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}>
                      <Popup>
                        <div className="text-sm">
                          <strong>{complaint.title}</strong><br />
                          {complaint.location}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                    <strong>Koordinat:</strong> {parseFloat(complaint.latitude).toFixed(6)}, {parseFloat(complaint.longitude).toFixed(6)}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold text-sm"
                  >
                    Buka di Google Maps →
                  </a>
                </div>
              </div>
            )}

            {/* Photos */}
            {complaint.photos && complaint.photos.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Foto Bukti</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complaint.photos.map(photo => (
                    <div key={photo.id} className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <img
                        src={`http://localhost/aduan-desa/uploads/complaints/${photo.photo_path}`}
                        alt={photo.caption || 'Foto bukti'}
                        className="w-full h-48 object-cover"
                        onError={e => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Foto+Tidak+Ditemukan';
                        }}
                      />
                      {photo.caption && (
                        <p className="p-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Responses */}
            <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <FiMessageSquare /> Riwayat Respon
              </h2>
              {complaint.responses && complaint.responses.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {complaint.responses.map(response => (
                    <div key={response.id} className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-indigo-700 dark:text-indigo-400">{response.admin_name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(response.created_at)}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">{response.response}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <FiMessageSquare size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">Belum ada respon</p>
                </div>
              )}
              
              <form onSubmit={handleAddResponse} className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Tambah Respon Baru</label>
                <textarea
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Tulis respon untuk user..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-3"
                />
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={addingResponse}
                  disabled={!responseText.trim()}
                >
                  {addingResponse ? 'Mengirim...' : 'Kirim Respon'}
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 sticky top-20 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Aksi Admin</h3>

              {/* Update Status - PROMINENT BUTTON */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Update Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
                >
                  <option value="pending">Menunggu</option>
                  <option value="in_progress">Diproses</option>
                  <option value="completed">Selesai</option>
                  <option value="rejected">Ditolak</option>
                </select>
                <button
                  onClick={handleStatusUpdateAttempt}
                  disabled={updatingStatus || newStatus === complaint.status}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>

              {/* Public Toggle - NO ICON, PROMINENT */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Publikasi</label>
                <button
                  onClick={handleTogglePublicAttempt}
                  disabled={updatingPublic}
                  className={`w-full px-6 py-3 ${complaint.is_public ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:bg-slate-400 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed`}
                >
                  {updatingPublic ? 'Updating...' : (complaint.is_public ? 'Sembunyikan' : 'Publikasikan')}
                </button>
              </div>

              {/* Info - HIGHLIGHTED */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3">Informasi</h4>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">ID Pengaduan</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">#{complaint.id}</span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-600"></div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Dibuat</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatDate(complaint.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Terakhir Update</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatDate(complaint.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => setShowStatusConfirm(false)}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Konfirmasi Update Status</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Apakah Anda yakin ingin mengubah status pengaduan ini?
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Status Saat Ini</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{getStatusLabel(complaint.status)}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-600 mb-3"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Status Baru</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">{getStatusLabel(newStatus)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusConfirm(false)}
                className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmUpdateStatus}
                className="flex-1 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                Ya, Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Toggle Confirmation Modal */}
      {showPublicConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => setShowPublicConfirm(false)}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-400" />
            </button>

            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${complaint.is_public ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                {complaint.is_public ? (
                  <FiEyeOff className="text-orange-600 dark:text-orange-400" size={32} />
                ) : (
                  <FiEye className="text-indigo-600 dark:text-indigo-400" size={32} />
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {complaint.is_public ? 'Sembunyikan Pengaduan?' : 'Publikasikan Pengaduan?'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {complaint.is_public 
                  ? 'Pengaduan ini akan disembunyikan dari publik.'
                  : 'Pengaduan ini akan ditampilkan ke publik.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPublicConfirm(false)}
                className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmTogglePublic}
                className={`flex-1 px-5 py-3 ${complaint.is_public ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-lg transition-colors shadow-md`}
              >
                {complaint.is_public ? 'Ya, Sembunyikan' : 'Ya, Publikasikan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminComplaintDetail;
