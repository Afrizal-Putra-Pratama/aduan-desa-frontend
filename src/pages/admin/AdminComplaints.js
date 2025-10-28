import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { FiFilter, FiX, FiEye, FiDownload, FiHome, FiRefreshCw, FiSearch, FiFileText, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { exportComplaintsToExcel } from '../../utils/exportExcel';

// ========================================
// FILTER INPUT COMPONENT - MOVED OUTSIDE!
// ========================================
const FilterInput = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500`}
      />
    </div>
  </div>
);

function AdminComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    fetchComplaints();
  }, [currentPage, itemsPerPage, sortOrder]);

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

  const fetchComplaints = async () => {
    setLoading(true);
    
    const timestamp = new Date().getTime();
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    params.append('page', currentPage);
    params.append('limit', itemsPerPage);
    params.append('sort', sortOrder);
    params.append('_', timestamp);
    
    const response = await adminAPI.getAllComplaints(params.toString());
    
    if (response.success) {
      console.log('✅ Complaints loaded:', response.data.length);
      setComplaints(response.data);
      setTotalItems(response.total || response.data.length);
    } else {
      console.error('❌ Failed to load complaints:', response.message);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchComplaints();
    setRefreshing(false);
  };

  const handleToggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setCurrentPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComplaints();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      date_from: '',
      date_to: '',
      search: ''
    });
    setCurrentPage(1);
    setTimeout(() => {
      fetchComplaints();
    }, 100);
  };

  const handleExport = () => {
    if (complaints.length === 0) {
      alert('Tidak ada data untuk di-export');
      return;
    }
    exportComplaintsToExcel(complaints);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const getPriorityBadge = (priority) => {
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
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <nav 
        className={`bg-white dark:bg-slate-800 shadow-md fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
            Kelola Pengaduan
          </h1>
        </div>
      </nav>

      <div className="h-16"></div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium border border-slate-200 dark:border-slate-600"
          >
            <FiHome size={18} />
            <span className="hidden md:inline">Dashboard</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 shadow-sm"
          >
            <FiRefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden md:inline">{refreshing ? 'Memuat...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleToggleSort}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            {sortOrder === 'desc' ? <FiTrendingDown size={18} /> : <FiTrendingUp size={18} />}
            <span className="hidden md:inline">
              {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
            </span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <FiFilter size={18} />
            <span className="hidden md:inline">{showFilters ? 'Tutup Filter' : 'Filter'}</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              <FiX size={18} />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium ml-auto shadow-sm"
          >
            <FiDownload size={18} />
            <span className="hidden md:inline">Export Excel</span>
          </button>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 mb-6 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <FiFilter className="text-indigo-600 dark:text-indigo-400" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Filter Pengaduan</h3>
            </div>
            
            <form onSubmit={handleApplyFilters}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FilterInput
                  label="Cari Kata Kunci"
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Judul atau deskripsi..."
                  icon={<FiSearch size={18} />}
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  >
                    <option value="">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="in_progress">Diproses</option>
                    <option value="completed">Selesai</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Prioritas</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  >
                    <option value="">Semua Prioritas</option>
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>

                <FilterInput
                  label="Tanggal Mulai"
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />

                <FilterInput
                  label="Tanggal Akhir"
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button type="submit" variant="primary" fullWidth>Terapkan Filter</Button>
                <Button type="button" onClick={handleClearFilters} variant="secondary" className="px-8">Reset</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-6 mb-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiFileText className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {totalItems} <span className="text-lg font-normal text-slate-600 dark:text-slate-400">Pengaduan</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Urutkan: <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {sortOrder === 'desc' ? 'Terbaru → Terlama' : 'Terlama → Terbaru'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Halaman</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{currentPage} / {totalPages}</p>
              </div>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
              <div className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Per Halaman</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{itemsPerPage}</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Memuat data...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-12 text-center transition-colors">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Tidak Ada Pengaduan</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {activeFilterCount > 0 ? 'Tidak ada pengaduan yang cocok dengan filter Anda.' : 'Belum ada pengaduan yang masuk.'}
            </p>
            {activeFilterCount > 0 && (
              <Button onClick={handleClearFilters} variant="primary">Reset Filter</Button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Judul</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Prioritas</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        #{complaint.id}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="max-w-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{complaint.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{complaint.category_name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {complaint.user_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={complaint.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(complaint.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(complaint.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg transition-colors font-semibold"
                        >
                          <FiEye size={16} />
                          <span className="hidden sm:inline">Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminComplaints;
