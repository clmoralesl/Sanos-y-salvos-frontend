import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDetalleReporte } from '../../services/bffService';
import { cerrarReporte, deleteReporte, updateReporte } from '../../services/reporteService';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ReporteForm from '../../components/ReporteForm';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

const AdminReporteDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchDetalle = async () => {
    try {
      setLoading(true);
      const data = await getDetalleReporte(id);
      setDetalle(data);
    } catch (err) {
      console.error("Error cargando detalle admin:", err);
      setError("No se pudo cargar la información técnica del reporte.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalle();
  }, [id]);

  const handleEditSubmit = async (formData) => {
    try {
      await updateReporte(id, formData);
      setToast({ message: 'Reporte actualizado exitosamente', type: 'success' });
      setIsEditOpen(false);
      fetchDetalle();
    } catch (err) {
      setToast({ message: 'Error al actualizar el reporte', type: 'error' });
    }
  };

  const handleConfirmCerrar = async () => {
    try {
      await cerrarReporte(id);
      setToast({ message: 'Caso marcado como resuelto', type: 'success' });
      fetchDetalle();
    } catch (err) {
      setToast({ message: 'Error al cerrar el caso', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteReporte(id);
      setToast({ message: 'Reporte eliminado permanentemente', type: 'success' });
      setTimeout(() => navigate('/admin/reportes'), 1500);
    } catch (err) {
      setToast({ message: 'Error al eliminar reporte', type: 'error' });
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Cargando auditoría técnica...</div>;
  if (error) return <div className="p-10 text-red-600 bg-red-50 rounded-xl m-8 border border-red-200">{error}</div>;

  return (
    <div className="space-y-6 text-slate-800">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <nav className="text-sm text-gray-500">
          <Link to="/admin/reportes" className="hover:text-blue-600">Lista de Reportes</Link> / <span>Auditoría #{id}</span>
        </nav>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setIsEditOpen(true)}>Editar Datos</Button>
          {detalle.estadoReporte === 'Activo' && (
            <Button variant="success" onClick={() => setIsCloseOpen(true)}>Resolver Caso</Button>
          )}
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>Eliminar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Datos Maestros del Reporte</h3>
              <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                detalle.estadoReporte === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {detalle.estadoReporte}
              </span>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Tipo de Incidencia</p>
                <p className="text-sm font-medium">{detalle.tipoReporte}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Fecha de Publicación</p>
                <p className="text-sm font-medium">{new Date(detalle.fechaRegistro).toLocaleString()}</p>
              </div>
              <div className="col-span-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-400 font-bold uppercase mb-1 tracking-widest text-center">Visto por última vez</p>
                <p className="text-center text-xl font-black text-blue-700">
                  {new Date(detalle.fechaIncidente).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Metadata Geoespacial (H3)</p>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <p>INDEX_H3: {detalle.ubicacion.codigoH3}</p>
                  <p>COORDINATES: [{detalle.ubicacion.latitud}, {detalle.ubicacion.longitud}]</p>
                  <p>SPECIFIC_ADDR: {detalle.ubicacion.direccionEspecifica || 'N/A'}</p>
                  <p>LOCATION: {detalle.ubicacion.comuna}, {detalle.ubicacion.region}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Entidad Mascota Asociada</h3>
            </div>
            <div className="p-6 flex items-start space-x-6">
              <div className="w-32 h-32 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center text-slate-300 overflow-hidden">
                <img src={localStorage.getItem(`report_photo_${id}`) || localStorage.getItem(`pet_photo_${detalle.mascota.id}`) || (detalle.mascota.fotos?.length > 0 ? detalle.mascota.fotos[0] : '/pet_placeholder.jpg')} alt="Pet" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="flex-grow grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Nombre</p>
                  <p className="text-sm font-medium">{detalle.mascota.nombre}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Raza / Especie</p>
                  <p className="text-sm font-medium">{detalle.mascota.raza} ({detalle.mascota.especie})</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Color Primario</p>
                  <p className="text-sm font-medium">{detalle.mascota.colorPrimario || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Color Secundario</p>
                  <p className="text-sm font-medium">{detalle.mascota.colorSecundario || 'Ninguno'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Tamaño</p>
                  <p className="text-sm font-medium">{detalle.mascota.tamanio}</p>
                </div>
                {detalle.mascota.caracteristicas && detalle.mascota.caracteristicas.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Características (Tags)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {detalle.mascota.caracteristicas.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-bold border border-slate-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Descripción en DB</p>
                  <p className="text-xs text-slate-600 italic">"{detalle.mascota.descripcion}"</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-slate-800 text-white rounded-xl shadow-lg overflow-hidden border border-slate-700">
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/50">
              <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">Información del Autor</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg">
                  {detalle.usuario.nombre.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold">{detalle.usuario.nombre}</p>
                  <p className="text-[10px] text-slate-400">Usuario Verificado</p>
                </div>
              </div>
              <div className="pt-4 space-y-3 border-t border-slate-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono">{detalle.usuario.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Teléfono:</span>
                  <span>{detalle.usuario.telefono}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Reporte Administrativo"
      >
        <ReporteForm 
          initialData={{
            ...detalle,
            idMascota: detalle.mascota.id,
            idUbicacionReporte: detalle.ubicacion.id
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isCloseOpen}
        onClose={() => setIsCloseOpen(false)}
        onConfirm={handleConfirmCerrar}
        title="Validación Administrativa: Cerrar Caso"
        message="¿Confirmas que este caso ha sido resuelto? Esto desactivará el reporte de los feeds públicos."
        confirmText="Confirmar Resolución"
        type="primary"
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="ELIMINAR REPORTE"
        message="Estás a punto de borrar un reporte permanentemente. ¿Proceder?"
        confirmText="BORRAR"
      />
    </div>
  );
};

export default AdminReporteDetalle;
