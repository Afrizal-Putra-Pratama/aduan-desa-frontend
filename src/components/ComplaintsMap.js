import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useNavigate } from 'react-router-dom';


// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker colors by status
const getMarkerIcon = (status) => {
  const iconUrls = {
    pending: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    in_progress: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    completed: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    rejected: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  };

  return new L.Icon({
    iconUrl: iconUrls[status] || iconUrls.pending,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

function ComplaintsMap({ complaints }) {
  const navigate = useNavigate();
  
  // Filter complaints with valid coordinates
  const validComplaints = complaints.filter(
    c => c.latitude && c.longitude && 
         parseFloat(c.latitude) !== 0 && parseFloat(c.longitude) !== 0
  );

  // Default center: Desa Wonokerso, Jawa Tengah
  const defaultCenter = [-7.550676, 110.828316];
  
  // Calculate center from complaints
  const center = validComplaints.length > 0
    ? [
        validComplaints.reduce((sum, c) => sum + parseFloat(c.latitude), 0) / validComplaints.length,
        validComplaints.reduce((sum, c) => sum + parseFloat(c.longitude), 0) / validComplaints.length,
      ]
    : defaultCenter;

  const getStatusLabel = (status) => {
    const labels = {
      pending: '⏳ Menunggu',
      in_progress: '🔄 Diproses',
      completed: '✅ Selesai',
      rejected: '❌ Ditolak',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-4">
      {validComplaints.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
          <p className="text-yellow-800">
            📍 Belum ada pengaduan dengan lokasi yang valid untuk ditampilkan di peta.
          </p>
          <p className="text-yellow-600 text-sm mt-2">
            Pengaduan harus memiliki koordinat lokasi agar dapat ditampilkan di peta.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800">
          <p>
            📌 <strong>{validComplaints.length} pengaduan</strong> ditampilkan di peta. 
            Klik marker untuk melihat detail.
          </p>
        </div>
      )}

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg" style={{ height: '600px' }}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          
          {validComplaints.map((complaint) => (
            <Marker
              key={complaint.id}
              position={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}
              icon={getMarkerIcon(complaint.status)}
            >
              <Popup>
                <div style={{ maxWidth: '200px' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{complaint.title}</h3>
                  <p style={{ fontSize: '12px', marginBottom: '4px' }}>{getStatusLabel(complaint.status)}</p>
                  <p style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                    {complaint.description.substring(0, 80)}...
                  </p>
                  <p style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                    📍 {complaint.location || 'Lokasi tidak tersedia'}
                  </p>
                  <button
                    onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                    style={{
                      width: '100%',
                      backgroundColor: '#4F46E5',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Lihat Detail
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-slate-800 border border-gray-300 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Legenda Status:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span>⏳ Menunggu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
            <span>🔄 Diproses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-400"></div>
            <span>✅ Selesai</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-400"></div>
            <span>❌ Ditolak</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintsMap;
