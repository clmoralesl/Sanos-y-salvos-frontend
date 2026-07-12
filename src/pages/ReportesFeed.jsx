import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReportes } from '../services/reporteService';
import { getUbicacionById } from '../services/geoService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const ReportesFeed = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        setLoading(true);
        const data = await getReportes();
        const activos = data.filter(r => r.estadoReporte === 'Activo');

        const conCoords = await Promise.all(activos.map(async (r) => {
          try {
            if (r.idUbicacionReporte) {
              const loc = await getUbicacionById(r.idUbicacionReporte);
              return {
                ...r,
                latitud: loc.latitud,
                longitud: loc.longitud,
                comunaNombre: loc.comuna?.nombre,
                regionNombre: loc.comuna?.region?.nombre_region
              };
            }
          } catch (e) {
            return { ...r, latitud: null, longitud: null };
          }
          return { ...r, latitud: null, longitud: null };
        }));

        setReportes(conCoords);
      } catch (err) {
        setError("No pudimos cargar los reportes. Inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchReportes();
  }, []);

  const getMarkerIcon = (tipo) => {
    const color = tipo.toLowerCase().includes('perdida') ? '#dc2626' : '#16a34a';
    return L.divIcon({
      html: `<span style="background-color: ${color}; width: 16px; height: 16px; display: block; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></span>`,
      className: 'custom-pin',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center text-blue-600 font-bold animate-pulse text-xl">
      Buscando mascotas en la red...
    </div>
  );

  const reportesConMapa = reportes.filter(r => r.latitud && r.longitud);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Casos Activos</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Explora los reportes más recientes de mascotas perdidas y hallazgos en tu zona.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {reportesConMapa.length > 0 && (
        <div className="h-[450px] w-full rounded-3xl overflow-hidden border border-gray-100 shadow-lg relative z-10">
          <MapContainer
            center={[-33.0245, -71.5518]}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {reportesConMapa.map(reporte => (
              <Marker
                key={reporte.idReporte}
                position={[reporte.latitud, reporte.longitud]}
                icon={getMarkerIcon(reporte.tipoReporte)}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-slate-800">
                    <div className="font-bold text-sm">{reporte.nombreMascota}</div>
                    <div className="text-xs uppercase font-semibold text-blue-600">{reporte.tipoReporte}</div>
                    {reporte.comunaNombre && <div className="text-xs text-gray-500">{reporte.comunaNombre}</div>}
                    <button
                      onClick={() => navigate(`/reportes/${reporte.idReporte}`)}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition"
                    >
                      Ver Ficha Completa
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {reportes.length === 0 && !error ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg">No hay reportes activos en este momento. ✨</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reportes.map((reporte) => (
            <div 
              key={reporte.idReporte} 
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(`/reportes/${reporte.idReporte}`)}
            >
              <div className="relative h-56 bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden">
                <img 
                  src={localStorage.getItem(`report_photo_${reporte.idReporte}`) || localStorage.getItem(`pet_photo_${reporte.idMascota}`) || '/pet_placeholder.jpg'} 
                  alt={reporte.nombreMascota} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black uppercase shadow-lg ${
                  reporte.tipoReporte.toLowerCase().includes('perdida') ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {reporte.tipoReporte}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{reporte.nombreMascota}</h3>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">{reporte.nombreUsuario}</p>
                    {reporte.comunaNombre && (
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        📍 {reporte.comunaNombre}, {reporte.regionNombre}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(reporte.fechaRegistro).toLocaleDateString()}
                  </span>
                  <button className="text-blue-600 text-sm font-bold flex items-center group-hover:underline">
                    Ver Detalles
                    <svg className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportesFeed;
