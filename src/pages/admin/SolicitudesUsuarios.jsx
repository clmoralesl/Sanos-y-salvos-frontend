import React, { useState, useEffect } from 'react';
import { getUsuarios, updateUsuarioMembresia } from '../../services/usuarioService';
import Table from '../../components/Table';
import Button from '../../components/Button';

const SolicitudesUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data.filter(u => u.estadoMembresia === 'PENDIENTE'));
      setError(null);
    } catch (err) {
      console.error("Error fetching usuarios:", err);
      setError("No se pudieron cargar los usuarios.");
      setUsuarios([
        { idUsuario: 2, nombre: 'Juan Soto (Mock)', email: 'juan@mail.com', telefono: '555-0101', tipoCuenta: 'Estándar', estadoMembresia: 'PENDIENTE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMembresia = async (id, estado) => {
    try {
      await updateUsuarioMembresia(id, estado);
      fetchUsuarios();
    } catch (err) {
      alert("Error al actualizar membresía");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Solicitudes de Voluntarios</h2>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
          <p>{error} (Mostrando datos de ejemplo)</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Cargando solicitudes...</div>
      ) : (
        <Table headers={['ID', 'Nombre', 'Email', 'Teléfono', 'Tipo Cuenta', 'Estado', 'Acciones']}>
          {usuarios.map((usuario) => (
            <tr key={usuario.idUsuario}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.idUsuario}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.telefono}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.descripcionTipoCuenta || usuario.tipoCuenta || 'Estándar'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {usuario.estadoMembresia || 'PENDIENTE'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onClick={() => handleUpdateMembresia(usuario.idUsuario, 'APROBADO')} className="text-green-600 hover:text-green-900 font-bold bg-green-50 px-3 py-1 rounded">Aprobar</button>
                <button onClick={() => handleUpdateMembresia(usuario.idUsuario, 'RECHAZADO')} className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-3 py-1 rounded">Rechazar</button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-gray-500 font-medium">No hay solicitudes pendientes en este momento.</td>
            </tr>
          )}
        </Table>
      )}
    </div>
  );
};

export default SolicitudesUsuarios;
