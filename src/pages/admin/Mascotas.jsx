import React, { useState, useEffect } from 'react';
import { getMascotas, deleteMascota, createMascota, updateMascota } from '../../services/mascotaService';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import MascotaForm from '../../components/MascotaForm';

const Mascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);

  useEffect(() => {
    fetchMascotas();
  }, []);

  const fetchMascotas = async () => {
    try {
      setLoading(true);
      const data = await getMascotas();
      setMascotas(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching mascotas:", err);
      setError("No se pudieron cargar las mascotas.");
      setMascotas([
        { idMascota: 1, nombreMascota: 'Bobby', descripcion: 'Perro café', raza: 'Labrador', tamanio: 'Grande' },
        { idMascota: 2, nombreMascota: 'Luna', descripcion: 'Gata blanca', raza: 'Siamés', tamanio: 'Pequeño' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDelete = (mascota) => {
    setSelectedMascota(mascota);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMascota) return;
    try {
      await deleteMascota(selectedMascota.idMascota);
      fetchMascotas();
    } catch (err) {
      alert("Error al eliminar la mascota");
    }
  };

  const handleOpenModal = (mascota = null) => {
    setSelectedMascota(mascota);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedMascota) {
        await updateMascota(selectedMascota.idMascota, formData);
      } else {
        await createMascota(formData);
      }
      setIsModalOpen(false);
      fetchMascotas();
    } catch (err) {
      alert("Error al guardar la mascota");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Mantenedor de Mascotas</h2>
        <Button onClick={() => handleOpenModal()}>
          + Nueva Mascota
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
          <p>{error} (Mostrando datos de ejemplo)</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Cargando mascotas...</div>
      ) : (
        <Table headers={['ID', 'Nombre', 'Dueño', 'Raza', 'Tamaño', 'Acciones']}>
          {mascotas.map((mascota) => (
            <tr key={mascota.idMascota}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mascota.idMascota}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mascota.nombreMascota}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mascota.nombreDueno || 'Sin Dueño'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mascota.nombreRaza || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mascota.descripcionTamanio || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button 
                  onClick={() => handleOpenModal(mascota)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleOpenDelete(mascota)}
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
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedMascota ? 'Editar Mascota' : 'Nueva Mascota'}
      >
        <MascotaForm 
          initialData={selectedMascota}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Mascota"
        message={`¿Estás seguro de que deseas eliminar a "${selectedMascota?.nombreMascota}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
};

export default Mascotas;
