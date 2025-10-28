import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI, categoriesAPI } from '../services/apiService';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { FiArrowLeft, FiSearch, FiFilter, FiUser, FiCalendar, FiFolder, FiFileText } from 'react-icons/fi';

function PublicComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dynamic items per page
  const [isMobile, setIsMobile] = useState(false);
  
  // Navbar scroll state
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Auto-hide navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        // Scrolling up or at top
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setShowNavbar(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const complaintsPerPage = isMobile ? 5 : 9;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, categoryFilter, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, categoriesRes] = await Promise.all([
        complaintsAPI.getPublicList(),
        categoriesAPI.getList()
      ]);

      if (complaintsRes.success) {
        const sorted = complaintsRes.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setComplaints(sorted);
        setFilteredComplaints(sorted);
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      const categoryId = parseInt(categoryFilter);
      filtered = filtered.filter(c => parseInt(c.category_id) === categoryId);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredComplaints(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const indexOfLastComplaint = currentPage * complaintsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - complaintsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirstComplaint, indexOfLastComplaint);
  const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Memuat pengaduan publik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      {/* Navbar - AUTO-HIDE WITH SMOOTH SHADOW */}
      <nav 
        className={`bg-white dark:bg-slate-800 shadow-md fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium rounded-lg border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm"
          >
            <FiArrowLeft size={20} />
            <span>Kembali</span>
          </button>
        </div>
      </nav>

      {/* Spacer untuk kompensasi fixed navbar */}
      <div className="h-16"></div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <FiFileText className="text-indigo-600 dark:text-indigo-400" size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3">
            Pengaduan Publik
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Transparansi laporan warga desa untuk kemajuan bersama
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-full">
            <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              {filteredComplaints.length} Pengaduan Tersedia
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 mb-6 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <FiFilter className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Filter & Pencarian</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Cari Pengaduan
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari judul atau deskripsi..."
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Kategori
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem'
                }}
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem'
                }}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="in_progress">Diproses</option>
                <option value="completed">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Filter Info & Reset */}
          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Menampilkan <strong className="text-indigo-600 dark:text-indigo-400">{filteredComplaints.length}</strong> dari <strong>{complaints.length}</strong> pengaduan
              </span>
              <Button
                onClick={resetFilters}
                variant="danger"
                size="sm"
              >
                Reset Filter
              </Button>
            </div>
          )}
        </div>

        {/* Complaints Grid */}
        {currentComplaints.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-12 text-center transition-colors">
            <div className="text-6xl mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' ? '🔍' : '📭'}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Tidak Ada Pengaduan
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Tidak ada pengaduan yang cocok dengan filter Anda.'
                : 'Belum ada pengaduan publik yang dipublikasikan.'}
            </p>
            {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <Button onClick={resetFilters} variant="primary">
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all p-6 cursor-pointer group"
                  onClick={() => navigate(`/complaints/${complaint.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                      <FiFolder className="text-indigo-600 dark:text-indigo-400" size={14} />
                      <span className="truncate">{complaint.category_name}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {complaint.title}
                  </h3>

                  <div className="mb-4">
                    <StatusBadge status={complaint.status} size="sm" />
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Detail Pengaduan
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <FiUser className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={14} />
                      <span className="truncate">Oleh: <strong>{complaint.user_name}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <FiCalendar className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={14} />
                      <span>{new Date(complaint.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-4 transition-colors">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Halaman <strong className="text-indigo-600 dark:text-indigo-400">{currentPage}</strong> dari <strong>{totalPages}</strong>
                    <span className="hidden sm:inline"> • Menampilkan {complaintsPerPage} per halaman</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-700 dark:text-slate-200 transition text-sm"
                    >
                      ← Prev
                    </button>

                    <div className="hidden sm:flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                            currentPage === i + 1
                              ? 'bg-indigo-600 text-white border-2 border-indigo-600'
                              : 'bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-700 dark:text-slate-200 transition text-sm"
                    >
                      Next →
                    </button>
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

export default PublicComplaints;
