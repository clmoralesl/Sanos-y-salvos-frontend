import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReportes, cerrarReporte, deleteReporte, updateReporte } from '../../services/reporteService';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ReporteForm from '../../components/ReporteForm';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState(null);

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      setLoading(true);
      const data = await getReportes();
      setReportes(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching reportes:", err);
      setError("No se pudieron cargar los reportes.");
      setReportes([
        { idReporte: 1, fechaReporte: '2024-05-18', tipoReporte: 'Perdido', estadoReporte: 'Activo', nombreMascota: 'Bobby', nombreUsuario: 'Maria Perez', idMascota: 1, idUbicacionReporte: 1 },
        { idReporte: 2, fechaReporte: '2024-05-19', tipoReporte: 'Encontrado', estadoReporte: 'Cerrado', nombreMascota: 'Luna', nombreUsuario: 'Juan Soto', idMascota: 2, idUbicacionReporte: 2 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (reporte) => {
    setSelectedReporte(reporte);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      await updateReporte(selectedReporte.idReporte, formData);
      setToast({ message: 'Reporte actualizado correctamente', type: 'success' });
      setIsEditOpen(false);
      fetchReportes();
    } catch (err) {
      setToast({ message: 'Error al actualizar el reporte', type: 'error' });
    }
  };

  const handleOpenClose = (reporte) => {
    setSelectedReporte(reporte);
    setIsCloseOpen(true);
  };

  const handleOpenDelete = (reporte) => {
    setSelectedReporte(reporte);
    setIsDeleteOpen(true);
  };

  const handleConfirmCerrar = async () => {
    if (!selectedReporte) return;
    try {
      await cerrarReporte(selectedReporte.idReporte);
      setToast({ message: 'Caso resuelto', type: 'success' });
      fetchReportes();
    } catch (err) {
      setToast({ message: 'Error al cerrar el reporte', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedReporte) return;
    try {
      await deleteReporte(selectedReporte.idReporte);
      setToast({ message: 'Reporte eliminado', type: 'success' });
      setReportes(reportes.filter(r => r.idReporte !== selectedReporte.idReporte));
    } catch (err) {
      setToast({ message: 'Error al eliminar el reporte', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Mantenedor de Reportes</h2>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
          <p>{error} (Mostrando datos de ejemplo)</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Cargando reportes...</div>
      ) : (
        <Table headers={['ID', 'Fecha', 'Tipo', 'Estado', 'Mascota', 'Usuario', 'Acciones']}>
          {reportes.map((reporte) => (
            <tr key={reporte.idReporte}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                <Link to={`/admin/reportes/${reporte.idReporte}`} className="hover:underline">
                  #{reporte.idReporte}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(reporte.fechaReporte).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  reporte.tipoReporte.includes('Perdida') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {reporte.tipoReporte}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  reporte.estadoReporte === 'Activo' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {reporte.estadoReporte}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reporte.nombreMascota}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reporte.nombreUsuario}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button 
                  onClick={() => handleOpenEdit(reporte)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Editar
                </button>
                {reporte.estadoReporte === 'Activo' && (
                  <button 
                    onClick={() => handleOpenClose(reporte)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Cerrar
                  </button>
                )}
                <button 
                  onClick={() => handleOpenDelete(reporte)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Reporte"
      >
        <ReporteForm 
          initialData={selectedReporte}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isCloseOpen}
        onClose={() => setIsCloseOpen(false)}
        onConfirm={handleConfirmCerrar}
        title="Cerrar Reporte"
        message={`¿Deseas marcar el reporte de "${selectedReporte?.nombreMascota}" como resuelto/cerrado?`}
        confirmText="Cerrar Caso"
        type="primary"
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Reporte"
        message={`¿Estás seguro de que deseas eliminar este reporte? Esta acción es permanente.`}
        confirmText="Eliminar"
      />
    </div>
  );
};

export default Reportes;
