import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getMe } from '../services/usuarioService';
import { getReportes, cerrarReporte } from '../services/reporteService';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const MisReportes = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();
  const [localUser, setLocalUser] = useState(null);

  const [profile, setProfile] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reportToClose, setReportToClose] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      setLocalUser(JSON.parse(userJson));
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const myProfile = await getMe();
      setProfile(myProfile);

      const allReports = await getReportes();
      const filtered = allReports.filter(r => r.idUsuario === myProfile.idUsuario);
      setReportes(filtered);
    } catch (err) {
      console.error('Error fetching my reports:', err);
      setError('No se pudieron cargar tus reportes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !localStorage.getItem('currentUser')) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, isLoading]);

  const handleCerrar = (id) => {
    setReportToClose(id);
    setShowConfirmModal(true);
  };

  const handleConfirmClose = async () => {
    if (!reportToClose) return;
    try {
      await cerrarReporte(reportToClose);
      setToast({ message: 'El reporte ha sido marcado como resuelto.', type: 'success' });
      await fetchData();
    } catch (err) {
      console.error('Error closing report:', err);
      setToast({ message: 'No se pudo cerrar el reporte.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-blue-600 font-bold animate-pulse">Cargando tus reportes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-slate-800">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmClose}
        title="Resolver Reporte"
        message="¿Estás seguro de dar por resuelto/cerrar este reporte? Esta acción no se puede deshacer."
        confirmText="Confirmar"
        type="primary"
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Mis Reportes publicados</h1>
          <p className="text-slate-500 mt-1">Administra tus reportes de avistamientos o mascotas perdidas.</p>
        </div>
        <Link to="/reportar" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md text-sm">
          + Publicar Nuevo Reporte
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6">
          {error}
        </div>
      )}

      {reportes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-12 text-center">
          <span className="text-5xl">📋</span>
          <h3 className="text-xl font-bold text-slate-700 mt-4">Aún no has publicado ningún reporte</h3>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto">
            Cuando reportes una mascota perdida o avistamiento aparecerá en este panel de control directo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportes.map((reporte) => (
            <div key={reporte.idReporte} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">Reporte #{reporte.idReporte}</span>
                    <h3 className="text-lg font-black text-slate-800 mt-0.5">{reporte.nombreMascota}</h3>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-tight mt-0.5">{reporte.tipoReporte}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    reporte.estadoReporte === 'Activo' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {reporte.estadoReporte}
                  </span>
                </div>

                <div className="flex space-x-4">
                  <div className="w-20 h-20 bg-gray-150 rounded-xl overflow-hidden flex-shrink-0 border">
                    <img
                      src={localStorage.getItem(`report_photo_${reporte.idReporte}`) || localStorage.getItem(`pet_photo_${reporte.idMascota}`) || '/pet_placeholder.jpg'}
                      alt={reporte.nombreMascota}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm space-y-1 text-slate-600">
                    <p><strong>Especie:</strong> {reporte.especieMascota}</p>
                    <p><strong>Fecha Incidente:</strong> {new Date(reporte.fechaIncidente).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex justify-between gap-3">
                <Link to={`/reportes/${reporte.idReporte}`} className="flex-1 bg-white hover:bg-slate-100 border text-slate-700 text-center py-2 rounded-xl text-xs font-bold transition shadow-sm">
                  Ver / Editar Detalles
                </Link>
                {reporte.estadoReporte === 'Activo' && (
                  <button
                    onClick={() => handleCerrar(reporte.idReporte)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-bold transition shadow-md"
                  >
                    ✓ Dar por Resuelto
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisReportes;
