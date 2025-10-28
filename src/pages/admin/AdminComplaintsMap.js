import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import StatusBadge from '../../components/common/StatusBadge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiHome, FiMapPin, FiRefreshCw, FiInfo, FiX } from 'react-icons/fi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getMarkerIcon = (status) => {
  const colors = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    completed: '#10b981',
    rejected: '#ef4444',
  };
  const color = colors[status] || colors.pending;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

function AdminComplaintsMap() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [center, setCenter] = useState([-7.0369, 109.8973]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTips, setShowTips] = useState(false);

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, statusFilter]);

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
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000');
      params.append('sort', 'desc');
      
      const response = await adminAPI.getAllComplaints(params.toString());
      
      if (response.success) {
        const complaintsWithCoords = response.data.filter(
          (c) => c.latitude && c.longitude && 
          parseFloat(c.latitude) !== 0 && parseFloat(c.longitude) !== 0
        );
        
        console.log('✅ Total complaints loaded:', response.data.length);
        console.log('✅ Complaints with coordinates:', complaintsWithCoords.length);
        
        setComplaints(complaintsWithCoords);

        if (complaintsWithCoords.length > 0) {
          setCenter([
            parseFloat(complaintsWithCoords[0].latitude),
            parseFloat(complaintsWithCoords[0].longitude),
          ]);
        }
      }
    } catch (error) {
      console.error('❌ Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const filterComplaints = () => {
    if (statusFilter === 'all') {
      setFilteredComplaints(complaints);
    } else {
      setFilteredComplaints(complaints.filter(c => c.status === statusFilter));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 mb-4"></div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Memuat peta pengaduan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
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
            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">Peta Pengaduan</h1>
          </div>
        </div>
      </nav>

      <div className="h-16"></div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex items-center bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-md font-semibold gap-2">
            <FiMapPin size={20} className="opacity-90" />
            <span className="text-sm">Total:</span>
            <span className="text-xl font-bold">{filteredComplaints.length}</span>
            <span className="text-xs opacity-75">/ {complaints.length}</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="in_progress">Diproses</option>
            <option value="completed">Selesai</option>
            <option value="rejected">Ditolak</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 text-sm shadow-sm"
          >
            <FiRefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{refreshing ? 'Memuat...' : 'Refresh'}</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-md overflow-hidden transition-colors">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b-2 border-slate-200 dark:border-slate-700 flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Menunggu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Diproses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Selesai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ditolak</span>
            </div>
          </div>

          {/* Map Container with Floating Tips Button */}
          <div className="relative h-[500px] lg:h-[600px]">
            {filteredComplaints.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center px-4">
                  <FiMapPin size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    Tidak Ada Lokasi
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {statusFilter !== 'all' 
                      ? 'Tidak ada pengaduan dengan status ini yang memiliki lokasi.'
                      : 'Tidak ada pengaduan dengan lokasi untuk ditampilkan.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Map - z-index 0 */}
                <div className="absolute inset-0 z-0">
                  <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    dragging={true}
                    touchZoom={true}
                    doubleClickZoom={true}
                    zoomControl={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredComplaints.map((complaint) => (
                      <Marker
                        key={complaint.id}
                        position={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}
                        icon={getMarkerIcon(complaint.status)}
                      >
                        <Popup maxWidth={280} minWidth={200}>
                          <div className="p-1">
                            <h3 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2">{complaint.title}</h3>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                              {complaint.description}
                            </p>
                            <div className="space-y-1 text-xs text-slate-600 mb-2">
                              <p><strong>Kategori:</strong> {complaint.category_name}</p>
                              <p><strong>Pelapor:</strong> {complaint.user_name}</p>
                              {complaint.location && <p><strong>Lokasi:</strong> {complaint.location}</p>}
                              <p><strong>Tanggal:</strong> {formatDate(complaint.created_at)}</p>
                            </div>
                            <div className="mb-2">
                              <StatusBadge status={complaint.status} size="sm" />
                            </div>
                            <button
                              onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                              className="w-full bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition text-xs font-semibold"
                            >
                              Lihat Detail
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>

                {/* Floating Tips Button - z-index 1000 (ABOVE MAP) */}
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="absolute top-4 right-4 z-[1000] w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
                  title="Tips Penggunaan"
                >
                  <FiInfo size={22} />
                </button>

                {/* Tips Popup - z-index 1001 */}
                {showTips && (
                  <div className="absolute top-20 right-4 z-[1001] animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 border-2 border-indigo-300 dark:border-indigo-600 rounded-xl shadow-2xl p-5 w-72">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">💡</div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-100">Tips Penggunaan</h3>
                        </div>
                        <button
                          onClick={() => setShowTips(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                        >
                          <FiX size={20} />
                        </button>
                      </div>
                      <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2.5">
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">•</span>
                          <span><strong>Klik marker</strong> untuk melihat detail pengaduan</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">•</span>
                          <span><strong>Warna marker:</strong> 🟡 Menunggu, 🔵 Diproses, 🟢 Selesai, 🔴 Ditolak</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">•</span>
                          <span><strong>Filter dropdown</strong> untuk melihat status tertentu</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">•</span>
                          <span><strong>Zoom & drag</strong> peta untuk navigasi lebih baik</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminComplaintsMap;
