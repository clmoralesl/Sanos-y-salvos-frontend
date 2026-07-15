import React, { useState, useEffect } from 'react';
import { getOrganizaciones, updateOrganizacionEstado } from '../../services/organizacionService';
import { getUsuarios } from '../../services/usuarioService';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const SolicitudesOrganizaciones = () => {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [creador, setCreador] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const orgsData = await getOrganizaciones();
      const usersData = await getUsuarios();
      
      setOrganizaciones(orgsData.filter(org => org.estado === 'PENDIENTE'));
      setUsuarios(usersData);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("No se pudieron cargar las solicitudes.");
      setOrganizaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (id, estado) => {
    try {
      await updateOrganizacionEstado(id, estado);
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Error al actualizar estado");
    }
  };

  const handleVerDetalles = (org) => {
    setSelectedOrg(org);

    const orgCreator = usuarios.find(u => u.idOrganizacion === org.idOrganizacion && u.descripcionTipoCuenta === 'ADMIN_ORG');
    setCreador(orgCreator);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Solicitudes de Organizaciones</h2>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Cargando solicitudes...</div>
      ) : (
        <Table headers={['ID', 'Nombre', 'RUT Org.', 'RUT Rep.', 'Estado', 'Acciones']}>
          {organizaciones.map((org) => (
            <tr key={org.idOrganizacion}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.idOrganizacion}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{org.nombreOrganizacion}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.rut || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.rutRepresentante || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {org.estado || 'PENDIENTE'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onClick={() => handleVerDetalles(org)} className="text-blue-600 hover:text-blue-900 font-bold bg-blue-50 px-3 py-1 rounded">Ver Detalles</button>
              </td>
            </tr>
          ))}
          {organizaciones.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">No hay solicitudes pendientes en este momento.</td>
            </tr>
          )}
        </Table>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalles de Solicitud">
        {selectedOrg && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-3">Datos del Refugio</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500 block text-xs uppercase font-bold">Nombre</span><span className="font-medium">{selectedOrg.nombreOrganizacion}</span></div>
                <div><span className="text-slate-500 block text-xs uppercase font-bold">RUT Organización</span><span className="font-medium">{selectedOrg.rut || 'No especificado'}</span></div>
                <div><span className="text-slate-500 block text-xs uppercase font-bold">Teléfono</span><span className="font-medium">{selectedOrg.telefono || 'No especificado'}</span></div>
                <div className="col-span-2"><span className="text-slate-500 block text-xs uppercase font-bold">Dirección</span><span className="font-medium">{selectedOrg.direccion || 'No especificada'}</span></div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border">
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-3">Datos del Solicitante (Dueño)</h3>
              {creador ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500 block text-xs uppercase font-bold">Nombre</span><span className="font-medium">{creador.nombre}</span></div>
                  <div><span className="text-slate-500 block text-xs uppercase font-bold">RUT Representante</span><span className="font-medium">{selectedOrg.rutRepresentante || 'No especificado'}</span></div>
                  <div><span className="text-slate-500 block text-xs uppercase font-bold">Email</span><span className="font-medium">{creador.email}</span></div>
                  <div><span className="text-slate-500 block text-xs uppercase font-bold">Teléfono Personal</span><span className="font-medium">{creador.telefono || 'No especificado'}</span></div>
                </div>
              ) : (
                <p className="text-yellow-600 text-sm">No se encontraron los datos del solicitante. Esto puede ocurrir si el usuario fue eliminado.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                onClick={() => handleUpdateEstado(selectedOrg.idOrganizacion, 'RECHAZADA')} 
                className="px-4 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50"
              >
                Rechazar
              </button>
              <button 
                onClick={() => handleUpdateEstado(selectedOrg.idOrganizacion, 'ACTIVA')} 
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
              >
                Aprobar Organización
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SolicitudesOrganizaciones;
