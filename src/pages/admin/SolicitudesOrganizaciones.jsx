import React, { useState, useEffect } from 'react';
import { getOrganizaciones, updateOrganizacionEstado } from '../../services/organizacionService';
import Table from '../../components/Table';
import Button from '../../components/Button';

const SolicitudesOrganizaciones = () => {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganizaciones();
  }, []);

  const fetchOrganizaciones = async () => {
    try {
      setLoading(true);
      const data = await getOrganizaciones();
      setOrganizaciones(data.filter(org => org.estado === 'PENDIENTE'));
      setError(null);
    } catch (err) {
      console.error("Error fetching organizaciones:", err);
      setError("No se pudieron cargar las organizaciones.");
      setOrganizaciones([
        { idOrganizacion: 2, nombreOrganizacion: 'Patitas Felices (Mock)', direccion: 'Calle Falsa 456', telefono: '555-0202', estado: 'PENDIENTE', rut: '11.111.111-1', rutRepresentante: '22.222.222-2' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (id, estado) => {
    try {
      await updateOrganizacionEstado(id, estado);
      fetchOrganizaciones();
    } catch (err) {
      alert("Error al actualizar estado");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Solicitudes de Organizaciones</h2>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
          <p>{error} (Mostrando datos de ejemplo)</p>
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
                <button onClick={() => handleUpdateEstado(org.idOrganizacion, 'ACTIVA')} className="text-green-600 hover:text-green-900 font-bold bg-green-50 px-3 py-1 rounded">Aprobar</button>
                <button onClick={() => handleUpdateEstado(org.idOrganizacion, 'RECHAZADA')} className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-3 py-1 rounded">Rechazar</button>
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
    </div>
  );
};

export default SolicitudesOrganizaciones;
