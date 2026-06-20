import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 16);
  }, [center, map]);
  return null;
};

const MapPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setPosition(newPos);
        onLocationSelect(newPos);
      } else {
        alert('No se encontró la dirección.');
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng);
      },
    });
    return position === null ? null : <Marker position={position}></Marker>;
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Busca una dirección o lugar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isSearching ? '...' : 'Buscar'}
        </button>
      </form>

      <div className="h-[400px] w-full rounded-2xl overflow-hidden border-2 border-blue-100 shadow-md relative z-10">
        <MapContainer 
          center={[-33.0245, -71.5518]} 
          zoom={13} 
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={position} />
          <LocationMarker />
        </MapContainer>
      </div>
      
      <div className="bg-blue-50 p-2 text-center text-[10px] text-blue-600 font-bold uppercase tracking-tight rounded-lg">
        {position 
          ? `Ubicación: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` 
          : 'Selecciona un punto en el mapa'}
      </div>
    </div>
  );
};

export default MapPicker;
