import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI, categoriesAPI } from '../services/apiService';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { FiArrowLeft, FiClock, FiMapPin, FiAlertCircle, FiSearch, FiFilter, FiFolder, FiUser } from 'react-icons/fi';

function ComplaintsList() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  const itemsPerPage = isMobile ? 5 : 9;

  useEffect(() => {
    fetchComplaints();
    fetchCategories();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    const response = await complaintsAPI.getList();
    if (response.success) {
      setComplaints(response.data);
    } else {
      setError(response.message);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const response = await categoriesAPI.getList();
    if (response.success) {
      setCategories(response.data);
    }
  };

  const getFilteredComplaints = () => {
    let filtered = [...complaints];
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => parseInt(c.category_id) === parseInt(filterCategory));
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return filtered;
  };

  const filteredComplaints = getFilteredComplaints();
  const totalItems = filteredComplaints.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterStatus('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStatus, sortBy]);

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      medium: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    const labels = { low: '🟢 Rendah', medium: '🟡 Sedang', high: '🔴 Tinggi' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[priority]}`}>{labels[priority]}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Memuat pengaduan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <nav className={`bg-white dark:bg-slate-800 shadow-md fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium rounded-lg border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
            <FiArrowLeft size={20} />
            <span className="hidden md:inline">Kembali</span>
          </button>
        </div>
      </nav>

      <div className="h-16"></div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl mb-6 transition-colors">
          <div className="px-4 py-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3">Pengaduan Saya</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Kelola dan pantau status pengaduan Anda</p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-full">
              <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{filteredComplaints.length} Pengaduan</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl flex items-start gap-3">
            <FiAlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
            <span className="text-red-800 dark:text-red-300 font-medium">{error}</span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 mb-6 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <FiFilter className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Filter & Pencarian</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Cari Pengaduan</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari judul atau deskripsi..." className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Kategori</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full pl-4 pr-10 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none cursor-pointer" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem'}}>
                <option value="all">Semua Kategori</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full pl-4 pr-10 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none cursor-pointer" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem'}}>
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="in_progress">Diproses</option>
                <option value="completed">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Urutkan</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full pl-4 pr-10 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none cursor-pointer" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem'}}>
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          </div>
          
          {(searchQuery || filterCategory !== 'all' || filterStatus !== 'all' || sortBy !== 'newest') && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Menampilkan <strong className="text-indigo-600 dark:text-indigo-400">{filteredComplaints.length}</strong> dari <strong>{complaints.length}</strong> pengaduan
              </span>
              <Button onClick={resetFilters} variant="danger" size="sm">Reset Filter</Button>
            </div>
          )}
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-12 text-center transition-colors">
            <div className="text-6xl mb-4">{searchQuery || filterCategory !== 'all' || filterStatus !== 'all' ? '🔍' : '📭'}</div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{searchQuery || filterCategory !== 'all' || filterStatus !== 'all' ? 'Tidak Ada Hasil' : 'Belum Ada Pengaduan'}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{searchQuery || filterCategory !== 'all' || filterStatus !== 'all' ? 'Tidak ada pengaduan yang cocok dengan filter Anda.' : 'Anda belum membuat pengaduan. Buat pengaduan pertama Anda sekarang!'}</p>
            <Button onClick={(searchQuery || filterCategory !== 'all' || filterStatus !== 'all') ? resetFilters : () => navigate('/complaints/create')} variant="primary">{(searchQuery || filterCategory !== 'all' || filterStatus !== 'all') ? 'Reset Filter' : 'Buat Pengaduan Baru'}</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedComplaints.map((complaint) => (
                <div key={complaint.id} className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all p-6 cursor-pointer group" onClick={() => navigate(`/complaints/${complaint.id}`)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                      <FiFolder className="text-indigo-600 dark:text-indigo-400" size={14} />
                      <span className="truncate">{complaint.category_name}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{complaint.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <StatusBadge status={complaint.status} size="sm" />
                    {getPriorityBadge(complaint.priority)}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm mb-4 line-clamp-3 leading-relaxed">{complaint.description}</p>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <FiClock className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={14} />
                      <span>{new Date(complaint.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    {complaint.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <FiMapPin className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={14} />
                        <span className="truncate">{complaint.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-4 transition-colors">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Halaman <strong className="text-indigo-600 dark:text-indigo-400">{currentPage}</strong> dari <strong>{totalPages}</strong>
                    <span className="hidden sm:inline"> • Menampilkan {itemsPerPage} per halaman</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-700 dark:text-slate-200 transition text-sm">← Prev</button>
                    <div className="hidden sm:flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-2 rounded-lg font-medium transition text-sm ${currentPage === i + 1 ? 'bg-indigo-600 text-white border-2 border-indigo-600' : 'bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>{i + 1}</button>
                      ))}
                    </div>
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-700 dark:text-slate-200 transition text-sm">Next →</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ComplaintsList;
