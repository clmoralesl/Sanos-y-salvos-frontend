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
      const me = await getMe();
      const miOrgId = me.idOrganizacion;

      if (!miOrgId) {
        setError("No tienes una organización asignada.");
        setLoading(false);
        return;
      }

      const allOrgs = await getOrganizaciones();
      const myOrg = allOrgs.find(o => o.idOrganizacion === miOrgId);
      if (myOrg) {
        setOrganizacion(myOrg);
        setOrgForm({ direccion: myOrg.direccion || '', telefono: myOrg.telefono || '' });
      }

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
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-pulse text-emerald-600 font-bold text-lg">Cargando el panel de tu refugio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 bg-red-50 border-l-4 border-red-400 p-6 text-red-700 rounded-r-2xl shadow-sm">
        <p className="font-bold text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800">
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          🏢 Mi Refugio
        </h2>
        <p className="text-slate-500 mt-2 text-lg">Administra la información de tu organización y gestiona tu equipo de voluntarios.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: DATOS DE ORG */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
             Datos de Contacto
          </h3>
          <form onSubmit={handleOrgSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre (No editable)</label>
              <input type="text" value={organizacion?.nombreOrganizacion || ''} disabled className="w-full bg-slate-50 text-slate-500 border border-slate-200 rounded-xl px-4 py-2.5 cursor-not-allowed text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">RUT (No editable)</label>
              <input type="text" value={organizacion?.rut || ''} disabled className="w-full bg-slate-50 text-slate-500 border border-slate-200 rounded-xl px-4 py-2.5 cursor-not-allowed text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dirección Física</label>
              <input 
                type="text" 
                value={orgForm.direccion} 
                onChange={(e) => setOrgForm({...orgForm, direccion: e.target.value})}
                className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium transition-all shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Teléfono de Contacto</label>
              <input 
                type="text" 
                value={orgForm.telefono} 
                onChange={(e) => setOrgForm({...orgForm, telefono: e.target.value})}
                className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium transition-all shadow-sm" 
              />
            </div>
            <div className="pt-4">
               <button 
                 type="submit" 
                 disabled={savingOrg} 
                 className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {savingOrg ? 'Guardando...' : '💾 Actualizar Datos'}
               </button>
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA: VOLUNTARIOS Y SOLICITUDES */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
               🔔 Solicitudes Pendientes
               {solicitudes.length > 0 && <span className="bg-amber-100 text-amber-700 text-xs py-0.5 px-2 rounded-full font-black">{solicitudes.length}</span>}
            </h3>
            
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Table headers={['Nombre', 'Email', 'Teléfono', 'Acciones']}>
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.idUsuario} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{solicitud.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{solicitud.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{solicitud.telefono}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => handleUpdateMembresia(solicitud.idUsuario, 'APROBADO')} className="text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-100 hover:bg-emerald-200 px-4 py-1.5 rounded-lg transition-colors">Aprobar</button>
                      <button onClick={() => handleUpdateMembresia(solicitud.idUsuario, 'RECHAZADO')} className="text-red-700 hover:text-red-900 font-bold bg-red-100 hover:bg-red-200 px-4 py-1.5 rounded-lg transition-colors">Rechazar</button>
                    </td>
                  </tr>
                ))}
                {solicitudes.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-medium">
                      <p className="text-4xl mb-2">🍃</p>
                      No hay solicitudes pendientes.
                    </td>
                  </tr>
                )}
              </Table>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
               👥 Voluntarios Activos
               {voluntarios.length > 0 && <span className="bg-emerald-100 text-emerald-700 text-xs py-0.5 px-2 rounded-full font-black">{voluntarios.length}</span>}
            </h3>
            
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Table headers={['Nombre', 'Email', 'Teléfono', 'Acciones']}>
                {voluntarios.map((voluntario) => (
                  <tr key={voluntario.idUsuario} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-black text-xs uppercase">{voluntario.nombre.charAt(0)}</div>
                       {voluntario.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{voluntario.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{voluntario.telefono}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => handleUpdateMembresia(voluntario.idUsuario, 'NINGUNO')} className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Revocar Membresía</button>
                    </td>
                  </tr>
                ))}
                {voluntarios.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-medium">
                      <p className="text-4xl mb-2">👻</p>
                      No tienes voluntarios registrados aún.
                    </td>
                  </tr>
                )}
              </Table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MiOrganizacion;
