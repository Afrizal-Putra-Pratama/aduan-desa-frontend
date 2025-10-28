import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component untuk handle klik peta
function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      console.log('📍 Map clicked:', e.latlng);
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="text-sm">
          <strong>Lokasi Pengaduan</strong><br />
          Lat: {position.lat.toFixed(6)}<br />
          Lng: {position.lng.toFixed(6)}
        </div>
      </Popup>
    </Marker>
  );
}

function LocationPicker({ onLocationSelect, initialPosition, onReset }) {
  // Default: Desa Wonokerso, Jawa Tengah
  const defaultCenter = { lat: -7.550676, lng: 110.828316 };
  const [position, setPosition] = useState(initialPosition || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🗺️ LocationPicker mounted');
  }, []);

  useEffect(() => {
    if (position) {
      console.log('📍 Position updated:', position);
      onLocationSelect(position);
    }
  }, [position, onLocationSelect]);

  const getCurrentLocation = () => {
    console.log('📍 Getting current location...');
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          console.log('✅ Location found:', newPos);
          setPosition(newPos);
          setLoading(false);
        },
        (error) => {
          console.error('❌ Error getting location:', error);
          let errorMsg = 'Tidak dapat mengakses lokasi. ';
          
          if (error.code === 1) {
            errorMsg += 'Izinkan akses lokasi di browser Anda.';
          } else if (error.code === 2) {
            errorMsg += 'Lokasi tidak tersedia.';
          } else if (error.code === 3) {
            errorMsg += 'Timeout. Coba lagi.';
          }
          
          alert(errorMsg);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Browser tidak support geolocation');
      setLoading(false);
    }
  };

  const centerPosition = position || defaultCenter;

  return (
    <div className="space-y-3">
      {/* Button - RESPONSIVE SIZE */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '📍 Mengambil...' : '📍 Gunakan Lokasi Saya'}
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300">
        <p className="font-semibold mb-1">📌 Cara memilih lokasi:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Klik tombol "Gunakan Lokasi Saya" untuk auto-detect</li>
          <li>Atau klik langsung di peta untuk pilih lokasi</li>
          <li>Drag peta untuk mencari lokasi yang tepat</li>
          <li>Zoom in/out dengan scroll mouse atau tombol +/-</li>
        </ol>
      </div>

      {/* Selected Location Info */}
      {position && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg text-sm">
          <p className="text-green-800 dark:text-green-200">
            ✅ <strong>Lokasi terpilih:</strong><br />
            Latitude: {position.lat.toFixed(6)}<br />
            Longitude: {position.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Map Container */}
      <div className="border-2 border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden shadow-lg" style={{ height: '400px' }}>
        <MapContainer
          center={[centerPosition.lat, centerPosition.lng]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
    </div>
  );
}

export default LocationPicker;
