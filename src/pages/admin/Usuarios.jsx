import React, { useState, useEffect } from 'react';
import { getUsuarios, getMe, registrarUsuario, updateMe, deleteMe, updateUsuarioMembresia } from '../../services/usuarioService';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import UsuarioForm from '../../components/UsuarioForm';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data.filter(u => u.estadoMembresia !== 'PENDIENTE'));
      setError(null);
    } catch (err) {
      console.error("Error fetching usuarios:", err);
      setError("No se pudieron cargar los usuarios.");
      setUsuarios([
        { idUsuario: 1, nombre: 'Maria Perez (Mock)', email: 'maria@mail.com', telefono: '555-5555', tipoCuenta: 'Estándar', estadoMembresia: 'NINGUNO' },
        { idUsuario: 2, nombre: 'Juan Soto (Mock)', email: 'juan@mail.com', telefono: '555-0101', tipoCuenta: 'Estándar', estadoMembresia: 'PENDIENTE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (user = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedUser) {
        if (selectedUser.idUsuario === 1) {
          await updateMe(formData);
        } else {
          alert("Edición simulada para usuarios externos");
        }
      } else {
        await registrarUsuario({ ...formData, auth0Id: `auth0|gen_${Date.now()}` });
      }
      setIsFormOpen(false);
      fetchUsuarios();
    } catch (err) {
      alert("Error al guardar el usuario");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedUser?.idUsuario === 1) {
        await deleteMe();
      }
      alert("Usuario eliminado correctamente");
      fetchUsuarios();
    } catch (err) {
      alert("Error al eliminar el usuario");
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Mantenedor de Usuarios (y Voluntarios)</h2>
        <Button onClick={() => handleOpenForm()}>
          + Nuevo Usuario
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
          <p>{error} (Mostrando datos de ejemplo)</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Cargando usuarios...</div>
      ) : (
        <Table headers={['ID', 'Nombre', 'Email', 'Teléfono', 'Tipo Cuenta', 'Estado Membresía', 'Acciones']}>
          {usuarios.map((usuario) => (
            <tr key={usuario.idUsuario}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.idUsuario}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.telefono}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.descripcionTipoCuenta || usuario.tipoCuenta || 'Estándar'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  usuario.estadoMembresia === 'APROBADO' ? 'bg-green-100 text-green-800' :
                  usuario.estadoMembresia === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {usuario.estadoMembresia || 'NINGUNO'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">

                <button onClick={() => handleOpenForm(usuario)} className="text-blue-600 hover:text-blue-900">Editar</button>
                <button onClick={() => handleOpenDelete(usuario)} className="text-red-600 hover:text-red-900">Eliminar</button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <UsuarioForm initialData={selectedUser} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} title="Eliminar Usuario" message={`¿Estás seguro de que deseas eliminar al usuario "${selectedUser?.nombre}"? Esta acción no se puede deshacer.`} confirmText="Eliminar" />
    </div>
  );
};

export default Usuarios;
