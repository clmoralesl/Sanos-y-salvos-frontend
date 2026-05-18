import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReportes } from '../services/reporteService';

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
        setReportes(activos);
      } catch (err) {
        console.error("Error cargando feed:", err);
        setError("No pudimos cargar los reportes. Inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchReportes();
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center text-blue-600 font-bold animate-pulse text-xl">
      Buscando mascotas en la red...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10 text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Casos Activos</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Explora los reportes más recientes de mascotas perdidas y hallazgos en tu zona.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-10">
          {error}
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
                {/* Placeholder para cuando tengamos fotos reales */}
                <div className="text-5xl group-hover:scale-110 transition-transform duration-500">🐾</div>
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black uppercase shadow-lg ${
                  reporte.tipoReporte.includes('Perdida') ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {reporte.tipoReporte}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{reporte.nombreMascota}</h3>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">{reporte.nombreUsuario}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(reporte.fechaReporte).toLocaleDateString()}
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
