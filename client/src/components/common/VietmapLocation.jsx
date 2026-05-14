import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon bị mất do webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const VietmapLocation = ({
  latitude = 16.0471,
  longitude = 108.2068,
  zoom = 15,
  buildingName = 'Tòa nhà',
  address = '',
  height = '300px',
}) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    // Khởi tạo map
    mapInstance.current = L.map(mapContainer.current, {
      center: [latitude, longitude],
      zoom: zoom,
      zoomControl: true,
    });

    // Tile layer OpenStreetMap - free, no CORS
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Custom marker màu indigo
    const customIcon = L.divIcon({
      html: `
        <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 7.73 14 22 14 22s14-14.27 14-22C28 6.27 21.73 0 14 0z" fill="#4f46e5"/>
          <circle cx="14" cy="14" r="6" fill="white"/>
        </svg>`,
      className: '',
      iconSize: [28, 36],
      iconAnchor: [14, 36],
      popupAnchor: [0, -36],
    });

    // Marker + popup
    const popupContent = `
      <div style="min-width:180px; font-family: sans-serif; padding: 4px 0;">
        <p style="margin:0 0 4px; font-size:14px; font-weight:600; color:#111;">${buildingName}</p>
        ${address ? `<p style="margin:0 0 8px; font-size:12px; color:#555;"> ${address}</p>` : ''}
        <a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}"
           target="_blank" rel="noopener noreferrer"
           style="font-size:12px; color:#4f46e5; text-decoration:none;">
          🗺️ Xem trên Google Maps →
        </a>
      </div>`;

    L.marker([latitude, longitude], { icon: customIcon })
      .addTo(mapInstance.current)
      .bindPopup(popupContent)
      .openPopup();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Cập nhật vị trí khi props thay đổi
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setView([latitude, longitude], zoom);
    }
  }, [latitude, longitude, zoom]);

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height, borderRadius: '8px', zIndex: 0 }}
    />
  );
};

export default VietmapLocation;
