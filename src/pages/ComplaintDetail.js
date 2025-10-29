import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { complaintsAPI, deleteComplaint, categoriesAPI } from '../services/apiService';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import { FiArrowLeft, FiClock, FiMapPin, FiMessageSquare, FiAlertCircle, FiEdit, FiTrash2, FiImage } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import EditComplaintModal from '../components/EditComplaintModal';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/aduan-desa/api';
const BASE_URL = API_BASE_URL.replace('/api', '');

console.log('🔧 ComplaintDetail API_BASE_URL:', API_BASE_URL);
console.log('🔧 ComplaintDetail BASE_URL:', BASE_URL);

function ComplaintDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchComplaintDetail();
    fetchCategories();
  }, [id]);

  const fetchComplaintDetail = async () => {
    setLoading(true);
    const response = await complaintsAPI.getById(id);
    
    if (response.success) {
      setComplaint(response.data);
      console.log('📸 Photos data:', response.data.photos);
    } else {
      setError(response.message);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getList();
      if (response.success) {
        setCategories(response.categories || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    const result = await deleteComplaint(complaint.id);

    if (result.success) {
      setSuccessMessage('Pengaduan berhasil dihapus');
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/complaints');
      }, 2000);
    } else {
      setError('Gagal menghapus: ' + result.message);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchComplaintDetail();
    setSuccessMessage('Pengaduan berhasil diupdate');
    setShowSuccessModal(true);
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-700 border border-gray-300',
      medium: 'bg-orange-100 text-orange-700 border border-orange-300',
      high: 'bg-red-100 text-red-700 border border-red-300',
    };
    
    const labels = {
      low: 'Prioritas Rendah',
      medium: 'Prioritas Sedang',
      high: 'Prioritas Tinggi',
    };

    return (
      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${badges[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getImageURL = (photoPath) => {
    console.log('🖼️ Processing photo path:', photoPath);
    
    if (!photoPath) {
      console.warn('⚠️ No photo path provided');
      return 'https://via.placeholder.com/400x300?text=Foto+Tidak+Ditemukan';
    }
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      console.log('✅ Full URL:', photoPath);
      return photoPath;
    }
    
    const cleanPath = photoPath.startsWith('/') ? photoPath.substring(1) : photoPath;
    const fullUrl = `${BASE_URL}/${cleanPath}`;
    console.log('🔗 Built URL:', fullUrl);
    
    return fullUrl;
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

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
        <nav className="bg-white dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
            <button
              onClick={() => navigate('/complaints')}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FiArrowLeft size={20} />
              <span className="font-medium">Kembali</span>
            </button>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-800 rounded-xl flex items-start gap-3">
            <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
            <span className="text-red-800 dark:text-red-200 font-medium">{error || 'Pengaduan tidak ditemukan'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/complaints')}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
            <span className="font-medium">Kembali</span>
          </button>
          <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Detail Pengaduan</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-8 mb-6 transition-colors">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                {complaint.title}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                {complaint.category_name}
              </p>
              {getPriorityBadge(complaint.priority)}
            </div>
            <StatusBadge status={complaint.status} size="lg" />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <FiClock className="text-indigo-600 dark:text-indigo-400" />
              <span>{formatDate(complaint.created_at)}</span>
            </div>
            {complaint.location && (
              <div className="flex items-center gap-2">
                <FiMapPin className="text-indigo-600 dark:text-indigo-400" />
                <span>{complaint.location}</span>
              </div>
            )}
          </div>

          {complaint.status === 'pending' ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowEditModal(true)}
                variant="primary"
                icon={<FiEdit />}
                className="flex-1"
              >
                Edit Pengaduan
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="danger"
                icon={<FiTrash2 />}
                className="flex-1"
              >
                Hapus Pengaduan
              </Button>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-xl text-sm">
              <strong>ℹ️ Info:</strong> Pengaduan dengan status <strong>"{complaint.status}"</strong> tidak dapat diedit atau dihapus.
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-8 mb-6 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Detail Pengaduan</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {complaint.description}
          </p>
        </div>

        {complaint.latitude && complaint.longitude && 
         parseFloat(complaint.latitude) !== 0 && parseFloat(complaint.longitude) !== 0 && (
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-8 mb-6 transition-colors">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FiMapPin className="text-indigo-600 dark:text-indigo-400" />
              Lokasi Pengaduan
            </h2>
            <div className="border-2 border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden mb-4" style={{ height: '350px' }}>
              <MapContainer
                center={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
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
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Koordinat:</strong> {parseFloat(complaint.latitude).toFixed(6)}, {parseFloat(complaint.longitude).toFixed(6)}</p>
              {complaint.location && <p className="mt-2"><strong>Alamat:</strong> {complaint.location}</p>}
            </div>
          </div>
        )}

        {complaint.photos && complaint.photos.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-8 mb-6 transition-colors">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FiImage className="text-indigo-600 dark:text-indigo-400" />
              Foto Bukti ({complaint.photos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complaint.photos.map((photo) => {
                const imageUrl = getImageURL(photo.photo_path);
                return (
                  <div key={photo.id} className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                    <img 
                      src={imageUrl}
                      alt={photo.caption || 'Foto bukti'}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        console.error('❌ Image load error:', photo.photo_path);
                        console.error('❌ Tried URL:', imageUrl);
                        e.target.src = 'https://via.placeholder.com/400x300?text=Foto+Tidak+Ditemukan';
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully:', imageUrl);
                      }}
                    />
                    {photo.caption && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-8 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <FiMessageSquare className="text-indigo-600 dark:text-indigo-400" />
            Tanggapan Admin
          </h2>
          
          {complaint.responses && complaint.responses.length > 0 ? (
            <div className="space-y-4">
              {complaint.responses.map((response) => (
                <div key={response.id} className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-700 rounded-lg flex items-center justify-center text-white text-sm">
                        A
                      </div>
                      {response.admin_name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(response.created_at)}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{response.response}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageSquare size={32} className="text-slate-400 dark:text-slate-500" />
              </div>
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Belum ada tanggapan</p>
              <p className="text-sm">Admin akan segera menanggapi pengaduan Anda</p>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditComplaintModal
          complaint={complaint}
          categories={categories}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Pengaduan?"
        message="Pengaduan yang sudah dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin menghapus pengaduan ini?"
        confirmText="Hapus Sekarang"
        cancelText="Batal"
        type="danger"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil!"
        message={successMessage}
        type="success"
        autoClose={true}
        autoCloseDelay={2000}
        showButton={false}
      />
    </div>
  );
}

export default ComplaintDetail;
