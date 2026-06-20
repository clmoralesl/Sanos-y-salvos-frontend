import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReportes } from '../services/reporteService';
import { getUbicacionById } from '../services/geoService';

const Home = () => {
  const navigate = useNavigate();
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchRecent = async () => {
      try {
        const data = await getReportes();
        const activos = data.filter(r => r.estadoReporte === 'Activo');
        
        activos.sort((a, b) => b.idReporte - a.idReporte);
        const top3 = activos.slice(0, 3);

        const top3ConLoc = await Promise.all(top3.map(async (r) => {
          try {
            if (r.idUbicacionReporte) {
              const loc = await getUbicacionById(r.idUbicacionReporte);
              return {
                ...r,
                comunaNombre: loc.comuna?.nombre
              };
            }
          } catch (e) {
            return r;
          }
          return r;
        }));

        setRecentReports(top3ConLoc);
      } catch (err) {
        console.error("Error loading recent reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Ayúdanos a traerlos <span className="text-blue-600">Sanos y Salvos</span>
        </h2>
        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
          La plataforma colaborativa para reportar mascotas perdidas y avistamientos en tiempo real usando tecnología geoespacial.
        </p>
        <div className="mt-10 flex justify-center space-x-4">
          <button 
            onClick={() => navigate('/reportar')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-lg transition"
          >
            Reportar Mascota Perdida
          </button>
          <button 
            onClick={() => navigate('/buscar')}
            className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Ver Casos Activos
          </button>
        </div>
      </div>

      <div className="mt-20">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Casos Activos Recientes</h3>
        {loading ? (
          <div className="text-center text-slate-500">Cargando reportes recientes...</div>
        ) : recentReports.length === 0 ? (
          <div className="text-center text-slate-400">No hay casos activos registrados.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentReports.map((reporte) => (
              <div 
                key={reporte.idReporte} 
                className="bg-white rounded-xl shadow-md overflow-hidden border cursor-pointer hover:shadow-xl transition"
                onClick={() => navigate(`/reportes/${reporte.idReporte}`)}
              >
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  <img 
                    src={localStorage.getItem(`report_photo_${reporte.idReporte}`) || localStorage.getItem(`pet_photo_${reporte.idMascota}`) || '/pet_placeholder.jpg'} 
                    alt={reporte.nombreMascota} 
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    reporte.tipoReporte.toLowerCase().includes('perdida') ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {reporte.tipoReporte}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-gray-900">{reporte.nombreMascota}</h4>
                    <span className="text-xs text-gray-500 font-mono">#{reporte.idReporte}</span>
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">
                    {reporte.comunaNombre ? `📍 En ${reporte.comunaNombre}` : 'Ubicación no disponible'}
                  </p>
                  <button className="mt-4 w-full bg-slate-50 hover:bg-slate-100 text-blue-600 text-sm font-semibold py-2 rounded-lg transition">
                    Ver detalles &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
