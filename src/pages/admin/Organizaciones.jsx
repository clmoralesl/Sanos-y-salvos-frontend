import React, { useState, useEffect } from 'react';
import { getOrganizaciones, deleteOrganizacion, createOrganizacion, updateOrganizacion } from '../../services/organizacionService';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import OrganizacionForm from '../../components/OrganizacionForm';

const Organizaciones = () => {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  useEffect(() => {
    fetchOrganizaciones();
  }, []);

  const fetchOrganizaciones = async () => {
    try {
      setLoading(true);
      const data = await getOrganizaciones();
      setOrganizaciones(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching organizaciones:", err);
      setError("No se pudieron cargar las organizaciones.");
      setOrganizaciones([
        { idOrganizacion: 1, nombreOrganizacion: 'Refugio San Francisco (Mock)', direccion: 'Av. Siempre Viva 123', telefono: '555-0101' },
        { idOrganizacion: 2, nombreOrganizacion: 'Patitas Felices (Mock)', direccion: 'Calle Falsa 456', telefono: '555-0202' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (org = null) => {
    setSelectedOrg(org);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (org) => {
    setSelectedOrg(org);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedOrg) {
        await updateOrganizacion(selectedOrg.idOrganizacion, formData);
      } else {
        await createOrganizacion(formData);
      }
      setIsFormOpen(false);
      fetchOrganizaciones();
    } catch (err) {
      alert("Error al guardar la organización");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrg) return;
    try {
      await deleteOrganizacion(selectedOrg.idOrganizacion);
      fetchOrganizaciones();
    } catch (err) {
      alert("Error al eliminar la organización");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Mantenedor de Organizaciones</h2>
        <Button onClick={() => handleOpenForm()}>
          + Nueva Organización
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
          <p>{error} (Mostrando datos de ejemplo)</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Cargando organizaciones...</div>
      ) : (
        <Table headers={['ID', 'Nombre', 'Dirección', 'Teléfono', 'Acciones']}>
          {organizaciones.map((org) => (
            <tr key={org.idOrganizacion}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.idOrganizacion}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{org.nombreOrganizacion}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.direccion}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.telefono}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button 
                  onClick={() => handleOpenForm(org)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleOpenDelete(org)}
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
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title={selectedOrg ? 'Editar Organización' : 'Nueva Organización'}
      >
        <OrganizacionForm 
          initialData={selectedOrg}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Organización"
        message={`¿Estás seguro de que deseas eliminar la organización "${selectedOrg?.nombreOrganizacion}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
};

export default Organizaciones;
