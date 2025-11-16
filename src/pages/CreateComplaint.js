import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI, complaintsAPI } from '../services/apiService';
import Button from '../components/common/Button';
import { useToast } from '../components/common/Toast';
import { FiArrowLeft, FiAlertCircle, FiCheckCircle, FiX, FiMapPin, FiUpload, FiTrash2 } from 'react-icons/fi';
import LocationPicker from '../components/LocationPicker';

const DRAFT_KEY = 'complaint_draft';

function CreateComplaint() {
  const navigate = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    location: '',
    priority: 'medium',
  });
  const [coordinates, setCoordinates] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPriorityTooltip, setShowPriorityTooltip] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Navbar scroll state
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ✅ Load draft from localStorage on mount
  useEffect(() => {
    fetchCategories();
    loadDraft();
  }, []);

  // ✅ Auto-save draft whenever form changes
  useEffect(() => {
    if (draftLoaded) {
      saveDraft();
    }
  }, [formData, coordinates, draftLoaded]);

  // Auto-hide navbar on scroll
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

  const fetchCategories = async () => {
    const response = await categoriesAPI.getList();
    if (response.success) {
      setCategories(response.data || response.categories || []);
    }
  };

  // ✅ Load draft from localStorage
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        
        if (draft.formData) {
          setFormData(draft.formData);
        }
        
        if (draft.coordinates) {
          setCoordinates(draft.coordinates);
        }
        
        console.log('Draft loaded from localStorage');
        toast.info('Draft sebelumnya telah dipulihkan');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    } finally {
      setDraftLoaded(true);
    }
  };

  // ✅ Save draft to localStorage
  const saveDraft = () => {
    try {
      const draft = {
        formData,
        coordinates,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // ✅ Clear draft after successful submit
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    console.log('✅ Draft cleared');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (position) => {
    console.log('📍 Location selected:', position);
    setCoordinates(position);
  };

  const handleResetCoordinates = () => {
    console.log('🗑️ Resetting coordinates');
    setCoordinates(null);
    setShowMap(false);
    setTimeout(() => setShowMap(true), 100);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > 5) {
      toast.error('❌ Maksimal 5 foto');
      return;
    }

    for (let file of files) {
      if (file.size > 5242880) {
        toast.error('❌ Ukuran foto maksimal 5MB');
        return;
      }
    }

    setPhotos([...photos, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
    
    toast.success(`✅ ${files.length} foto berhasil ditambahkan`);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(photoPreviews[index]);
    
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
    
    toast.info('🗑️ Foto dihapus');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.category_id) {
      setError('Pilih kategori terlebih dahulu');
      toast.error('❌ Pilih kategori terlebih dahulu');
      return;
    }
    
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('priority', formData.priority);
      
      if (coordinates) {
        formDataToSend.append('latitude', coordinates.lat);
        formDataToSend.append('longitude', coordinates.lng);
      }
      
      photos.forEach((photo) => {
        formDataToSend.append('photos[]', photo);
      });

      console.log('📤 Submitting complaint via complaintsAPI...');
      
      const response = await complaintsAPI.create(formDataToSend);

      console.log('📥 Response:', response);

      if (response.success) {
        clearDraft();
        toast.success('✅ Pengaduan berhasil dibuat!');
        setTimeout(() => navigate('/complaints'), 1500);
      } else {
        toast.error('❌ ' + (response.message || 'Gagal membuat pengaduan'));
        setError(response.message || 'Gagal membuat pengaduan');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('❌ Gagal membuat pengaduan. Silakan coba lagi.');
      setError('Gagal membuat pengaduan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = () => {
    const cat = categories.find(c => c.id === parseInt(formData.category_id));
    return cat ? cat.name : '-';
  };

  const getPriorityLabel = () => {
    const labels = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi'
    };
    return labels[formData.priority] || formData.priority;
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Navbar */}
      <nav 
        className={`bg-white dark:bg-slate-800 shadow-md fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium rounded-lg border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm"
          >
            <FiArrowLeft size={20} />
            <span className="hidden md:inline">Kembali</span>
          </button>
          
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 text-center px-2">
            Buat Pengaduan Baru
          </h1>
          
          <div className="w-20 md:w-28"></div>
        </div>
      </nav>

      <div className="h-16"></div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 md:p-8 transition-colors">
          {/* Error Alert (Fallback jika toast tidak cukup) */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-800 rounded-xl flex items-start gap-3 animate-fadeIn">
              <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
              <span className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</span>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl transition-colors">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Info:</strong> Data form akan tersimpan otomatis. Anda dapat melanjutkan mengisi form kapan saja.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Kategori */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Kategori Pengaduan <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-10 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem'
                }}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Judul */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Judul Pengaduan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Jalan Rusak di RT 02"
                required
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Deskripsi Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan detail masalah yang Anda adukan..."
                rows="6"
                required
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              ></textarea>
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Nama Lokasi
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Contoh: Desa Wonokerso RT 02 RW 03"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Opsional - Alamat lengkap lokasi pengaduan</p>
            </div>

            {/* Map Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Pilih Lokasi di Peta <span className="text-slate-400">(Opsional)</span>
                </label>
                
                <div className="flex gap-2">
                  {showMap ? (
                    <button
                      type="button"
                      onClick={() => setShowMap(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                    >
                      <FiX size={16} />
                      Tutup
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                    >
                      <FiMapPin size={16} />
                      Buka Peta
                    </button>
                  )}
                </div>
              </div>

              {showMap && (
                <div className="mt-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden relative z-0">
                  <LocationPicker 
                    key={coordinates ? 'with-coord' : 'no-coord'}
                    onLocationSelect={handleLocationSelect}
                    initialPosition={coordinates}
                  />
                </div>
              )}

              {coordinates && (
                <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Koordinat Terpilih</p>
                    <p className="text-sm font-mono text-indigo-800 dark:text-indigo-200">
                      {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetCoordinates}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <FiTrash2 size={14} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>
              )}
            </div>

            {/* Upload Foto */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Upload Foto Bukti
              </label>
              
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition shadow-md"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full px-4 py-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiUpload className="text-indigo-600 dark:text-indigo-400" size={28} />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Klik untuk upload foto
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      PNG, JPG maksimal 5MB · Maksimal 5 foto
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Prioritas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Tingkat Urgensi <span className="text-red-500">*</span>
                </label>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPriorityTooltip(!showPriorityTooltip);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium underline"
                >
                  Lihat Panduan
                </button>
              </div>
              
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem'
                }}
              >
                <option value="low">Rendah - Tidak mendesak</option>
                <option value="medium">Sedang - Perlu penanganan segera</option>
                <option value="high">Tinggi - Sangat mendesak!</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
              >
                Kirim Pengaduan
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full my-8 relative animate-scaleIn transition-colors">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors z-10"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-300" />
            </button>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="text-indigo-600 dark:text-indigo-400" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Konfirmasi Pengaduan</h3>
                <p className="text-slate-600 dark:text-slate-400">Pastikan data sudah benar sebelum mengirim</p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Kategori</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">{getCategoryName()}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Judul</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">{formData.title}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Deskripsi</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{formData.description}</p>
                </div>

                {formData.location && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Lokasi</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{formData.location}</p>
                  </div>
                )}

                {coordinates && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Koordinat</p>
                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</p>
                  </div>
                )}

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Tingkat Urgensi</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">{getPriorityLabel()}</p>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Foto Bukti ({photoPreviews.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {photoPreviews.map((preview, index) => (
                        <img 
                          key={index}
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                  variant="secondary"
                  className="flex-1"
                >
                  Edit Lagi
                </Button>
                <Button
                  onClick={handleConfirmSubmit}
                  loading={loading}
                  variant="primary"
                  className="flex-1"
                >
                  Ya, Kirim Sekarang
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Priority Tooltip Modal */}
      {showPriorityTooltip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scaleIn transition-colors">
            <button
              onClick={() => setShowPriorityTooltip(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">Panduan Tingkat Urgensi</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-2 border-slate-200 dark:border-slate-700 rounded-xl">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Rendah</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Tidak mendesak, bisa ditangani dalam waktu seminggu atau lebih</p>
                </div>
                
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl">
                  <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-1">Sedang</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Perlu penanganan dalam 2-3 hari</p>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                  <h4 className="font-bold text-red-800 dark:text-red-200 mb-1">Tinggi</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">Sangat mendesak, perlu ditangani dalam 24 jam</p>
                </div>
              </div>

              <Button
                onClick={() => setShowPriorityTooltip(false)}
                variant="primary"
                fullWidth
                className="mt-6"
              >
                Mengerti
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateComplaint;
