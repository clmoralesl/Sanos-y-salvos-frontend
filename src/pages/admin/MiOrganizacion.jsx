import React, { useState, useEffect } from 'react';
import { getOrganizaciones, updateOrganizacion } from '../../services/organizacionService';
import { getUsuarios, updateUsuarioMembresia, getMe } from '../../services/usuarioService';
import Table from '../../components/Table';
import Button from '../../components/Button';

const MiOrganizacion = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [organizacion, setOrganizacion] = useState(null);
  const [orgForm, setOrgForm] = useState({ direccion: '', telefono: '' });
  const [savingOrg, setSavingOrg] = useState(false);

  const [solicitudes, setSolicitudes] = useState([]);
  const [voluntarios, setVoluntarios] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // 1. Get Me to find out my idOrganizacion
      const me = await getMe();
      const miOrgId = me.idOrganizacion;

      if (!miOrgId) {
        setError("No tienes una organización asignada.");
        setLoading(false);
        return;
      }

      // 2. Load the specific organization
      const allOrgs = await getOrganizaciones();
      const myOrg = allOrgs.find(o => o.idOrganizacion === miOrgId);
      if (myOrg) {
        setOrganizacion(myOrg);
        setOrgForm({ direccion: myOrg.direccion || '', telefono: myOrg.telefono || '' });
      }

      // 3. Load users and filter for my org
      await loadUsers(miOrgId);

      setError(null);
    } catch (err) {
      console.error("Error loading Mi Organización:", err);
      setError("No se pudieron cargar los datos de la organización.");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (orgId) => {
    const allUsers = await getUsuarios();
    const myUsers = allUsers.filter(u => u.idOrganizacion === orgId);

    setSolicitudes(myUsers.filter(u => u.estadoMembresia === 'PENDIENTE'));
    // Voluntarios aprobados pero excluimos al propio ADMIN_ORG para que no se revoque a si mismo por accidente
    setVoluntarios(myUsers.filter(u => u.estadoMembresia === 'APROBADO' && u.descripcionTipoCuenta !== 'ADMIN_ORG'));
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setSavingOrg(true);
    try {
      await updateOrganizacion(organizacion.idOrganizacion, {
        ...organizacion,
        direccion: orgForm.direccion,
        telefono: orgForm.telefono
      });
      alert("Organización actualizada correctamente.");
    } catch (err) {
      alert("Error al actualizar la organización");
    } finally {
      setSavingOrg(false);
    }
  };

  const handleUpdateMembresia = async (idUsuario, nuevoEstado) => {
    try {
      await updateUsuarioMembresia(idUsuario, nuevoEstado);
      await loadUsers(organizacion.idOrganizacion);
    } catch (err) {
      alert("Error al actualizar la membresía");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Cargando panel de tu organización...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-800">Mi Organización</h2>
        <p className="text-gray-500 mt-1">Administra la información de tu refugio y a tus voluntarios.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: DATOS DE ORG */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Datos del Refugio</h3>
          <form onSubmit={handleOrgSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre (No editable)</label>
              <input type="text" value={organizacion?.nombreOrganizacion || ''} disabled className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-4 py-2 cursor-not-allowed text-sm font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">RUT (No editable)</label>
              <input type="text" value={organizacion?.rut || ''} disabled className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-4 py-2 cursor-not-allowed text-sm font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección</label>
              <input 
                type="text" 
                value={orgForm.direccion} 
                onChange={(e) => setOrgForm({...orgForm, direccion: e.target.value})}
                className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
              <input 
                type="text" 
                value={orgForm.telefono} 
                onChange={(e) => setOrgForm({...orgForm, telefono: e.target.value})}
                className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" 
              />
            </div>
            <Button type="submit" disabled={savingOrg} className="w-full justify-center">
              {savingOrg ? 'Guardando...' : 'Actualizar Datos'}
            </Button>
          </form>
        </div>

        {/* COLUMNA DERECHA: VOLUNTARIOS Y SOLICITUDES */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Solicitudes Pendientes</h3>
            <Table headers={['Nombre', 'Email', 'Teléfono', 'Acciones']}>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.idUsuario}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{solicitud.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solicitud.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solicitud.telefono}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => handleUpdateMembresia(solicitud.idUsuario, 'APROBADO')} className="text-green-600 hover:text-green-900 font-bold bg-green-50 px-3 py-1 rounded">Aprobar</button>
                    <button onClick={() => handleUpdateMembresia(solicitud.idUsuario, 'RECHAZADO')} className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-3 py-1 rounded">Rechazar</button>
                  </td>
                </tr>
              ))}
              {solicitudes.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">No hay solicitudes pendientes.</td>
                </tr>
              )}
            </Table>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Voluntarios Activos</h3>
            <Table headers={['Nombre', 'Email', 'Teléfono', 'Acciones']}>
              {voluntarios.map((voluntario) => (
                <tr key={voluntario.idUsuario}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{voluntario.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voluntario.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voluntario.telefono}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => handleUpdateMembresia(voluntario.idUsuario, 'NINGUNO')} className="text-red-600 hover:text-red-900 text-xs font-bold border border-red-200 px-3 py-1 rounded hover:bg-red-50">Revocar Membresía</button>
                  </td>
                </tr>
              ))}
              {voluntarios.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">No tienes voluntarios registrados aún.</td>
                </tr>
              )}
            </Table>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MiOrganizacion;
