import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiHome, FiAlertCircle, FiCheckCircle, FiFolder } from 'react-icons/fi';

function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-hide navbar
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

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
    setLoading(true);
    try {
      const response = await adminAPI.getCategories();
      if (response.success) {
        setCategories(response.data);
      } else {
        setError('Gagal memuat kategori: ' + response.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditMode(true);
      setFormData({
        id: category.id,
        name: category.name,
        description: category.description || ''
      });
    } else {
      setEditMode(false);
      setFormData({
        id: null,
        name: '',
        description: ''
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ id: null, name: '', description: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Nama kategori wajib diisi');
      return;
    }

    setSubmitting(true);

    try {
      const response = editMode
        ? await adminAPI.updateCategory(formData)
        : await adminAPI.createCategory(formData);

      if (response.success) {
        setSuccess(editMode ? 'Kategori berhasil diperbarui!' : 'Kategori berhasil ditambahkan!');
        handleCloseModal();
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Gagal menyimpan kategori');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAttempt = (category) => {
    if (category.complaint_count > 0) {
      setError(`Kategori "${category.name}" tidak dapat dihapus karena masih digunakan oleh ${category.complaint_count} pengaduan.`);
      setTimeout(() => setError(''), 5000);
      return;
    }
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await adminAPI.deleteCategory(categoryToDelete.id);
      if (response.success) {
        setSuccess('Kategori berhasil dihapus!');
        setShowDeleteConfirm(false);
        setCategoryToDelete(null);
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Gagal menghapus kategori: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Error: ' + error.message);
    }
  };

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
            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">Manajemen Kategori</h1>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <FiPlus size={18} />
            <span className="hidden md:inline">Tambah Kategori</span>
            <span className="md:hidden">Tambah</span>
          </button>
        </div>
      </nav>

      <div className="h-16"></div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-xl flex items-start gap-3 shadow-sm">
            <FiCheckCircle className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={20} />
            <span className="text-sm text-green-800 dark:text-green-300 font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl flex items-start gap-3 shadow-sm">
            <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
            <span className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Memuat kategori...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Nama Kategori</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Pengaduan</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <FiFolder size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada kategori</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Klik "Tambah Kategori" untuk menambahkan</p>
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => (
                      <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {category.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {category.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                            {category.complaint_count} pengaduan
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenModal(category)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg transition-colors font-semibold"
                            >
                              <FiEdit2 size={14} />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAttempt(category)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                                category.complaint_count > 0
                                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                  : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400'
                              }`}
                              disabled={category.complaint_count > 0}
                            >
                              <FiTrash2 size={14} />
                              <span className="hidden sm:inline">Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiFolder className="text-indigo-600 dark:text-indigo-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {editMode ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl text-sm text-red-800 dark:text-red-300">
                  {error}
                </div>
              )}

              <Input
                label="Nama Kategori"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Infrastruktur"
                required
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition"
                  rows="3"
                  placeholder="Deskripsi kategori (opsional)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50"
                  disabled={submitting}
                >
                  <FiSave />
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setCategoryToDelete(null);
              }}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-slate-600 dark:text-slate-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Hapus Kategori?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Apakah Anda yakin ingin menghapus kategori ini?
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Kategori:</strong> {categoryToDelete.name}
              </p>
              {categoryToDelete.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {categoryToDelete.description}
                </p>
              )}
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-400 mb-1 text-sm">Perhatian</p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Kategori yang sudah dihapus tidak dapat dikembalikan.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCategoryToDelete(null);
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

export default AdminCategories;
