import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getMe, updateMe } from '../services/usuarioService';
import { getOrganizaciones, createOrganizacion } from '../services/organizacionService';
import { getMisMascotas, deleteMascota } from '../services/mascotaService';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const Perfil = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();
  const [localUser, setLocalUser] = useState(null);

  const [idUsuario, setIdUsuario] = useState(null);
  const [auth0Id, setAuth0Id] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idTipoCuenta, setIdTipoCuenta] = useState(1);

  const [perteneceOrg, setPerteneceOrg] = useState(false);
  const [orgMode, setOrgMode] = useState('select');
  const [idOrganizacion, setIdOrganizacion] = useState('');
  const [organizaciones, setOrganizaciones] = useState([]);

  // States for banner
  const [estadoMembresia, setEstadoMembresia] = useState('');
  const [estadoOrganizacion, setEstadoOrganizacion] = useState('');
  const [descripcionTipoCuenta, setDescripcionTipoCuenta] = useState('');

  const [orgNombre, setOrgNombre] = useState('');
  const [orgDireccion, setOrgDireccion] = useState('');
  const [orgTelefono, setOrgTelefono] = useState('');
  const [orgEmail, setOrgEmail] = useState('');

  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [misMascotas, setMisMascotas] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      setLocalUser(JSON.parse(userJson));
    }
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMe();
      setIdUsuario(data.idUsuario);
      setAuth0Id(data.auth0Id);
      setNombre(data.nombre);
      setEmail(data.email);
      setTelefono(data.telefono || '');
      setIdTipoCuenta(data.idTipoCuenta || 1);
      
      setEstadoMembresia(data.estadoMembresia || '');
      setEstadoOrganizacion(data.estadoOrganizacion || '');
      setDescripcionTipoCuenta(data.descripcionTipoCuenta || '');

      const localPhoto = localStorage.getItem(`user_profile_photo_${data.idUsuario}`);
      if (localPhoto) {
        setProfilePhoto(localPhoto);
      }

      if (data.nombreOrganizacion) {
        setPerteneceOrg(true);
      }

      const orgsData = await getOrganizaciones();
      setOrganizaciones(orgsData);

      if (data.nombreOrganizacion && orgsData.length > 0) {
        const matched = orgsData.find(o => o.nombreOrganizacion === data.nombreOrganizacion);
        if (matched) {
          setIdOrganizacion(matched.idOrganizacion.toString());
        }
      }
      const pets = await getMisMascotas();
      setMisMascotas(pets || []);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !localStorage.getItem('currentUser')) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated, isLoading]);

  const handleOpenDelete = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!petToDelete) return;
    try {
      await deleteMascota(petToDelete.idMascota);
      setToast({ message: `Mascota "${petToDelete.nombreMascota}" eliminada con éxito.`, type: 'success' });
      const pets = await getMisMascotas();
      setMisMascotas(pets || []);
    } catch (err) {
      console.error('Error deleting pet:', err);
      setToast({ message: 'Error al eliminar la mascota.', type: 'error' });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setMessage({ type: 'error', text: 'El nombre es obligatorio.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let finalOrgId = null;
      let finalTipoCuenta = 1;

      if (perteneceOrg) {
        finalTipoCuenta = 2;
        if (orgMode === 'create') {
          if (!orgNombre.trim()) {
            setMessage({ type: 'error', text: 'El nombre de la organización es obligatorio.' });
            setSaving(false);
            return;
          }
          const newOrg = await createOrganizacion({
            nombreOrganizacion: orgNombre,
            direccion: orgDireccion,
            telefono: orgTelefono,
            email: orgEmail
          });
          finalOrgId = newOrg.idOrganizacion;
        } else {
          if (!idOrganizacion) {
            setMessage({ type: 'error', text: 'Por favor selecciona una organización.' });
            setSaving(false);
            return;
          }
          finalOrgId = parseInt(idOrganizacion);
        }
      }

      await updateMe({
        auth0Id,
        nombre,
        email,
        telefono,
        idOrganizacion: finalOrgId,
        idTipoCuenta: finalTipoCuenta
      });

      if (profilePhoto) {
        localStorage.setItem(`user_profile_photo_${idUsuario}`, profilePhoto);
      } else {
        localStorage.removeItem(`user_profile_photo_${idUsuario}`);
      }

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      await loadProfile();
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: 'Error al actualizar el perfil.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-blue-600 font-bold animate-pulse">Cargando tu perfil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-800">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Mascota"
        message={`¿Estás seguro de que deseas eliminar a "${petToDelete?.nombreMascota}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Mi Perfil</h1>
        <p className="text-slate-500 mt-1">Configura tus datos personales e institucionales.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border mb-6 text-sm ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? '✓ ' : '⚠️ '} {message.text}
        </div>
      )}

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Filiación Institucional</h3>

            {/* BANNER INFORMATIVO DE ESTADO */}
            {perteneceOrg && (
              <div className="mb-4">
                {descripcionTipoCuenta === 'ADMIN_ORG' && estadoOrganizacion === 'PENDIENTE' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700 rounded-r-xl">
                    <p className="font-bold">Solicitud de Organización en Revisión</p>
                    <p className="text-sm">Tu solicitud para registrar la organización está pendiente de aprobación por un administrador.</p>
                  </div>
                )}
                {descripcionTipoCuenta === 'ADMIN_ORG' && estadoOrganizacion === 'RECHAZADA' && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 rounded-r-xl">
                    <p className="font-bold">Solicitud Rechazada</p>
                    <p className="text-sm">Tu solicitud para registrar la organización fue rechazada. Por favor, revisa los datos o contacta a soporte.</p>
                  </div>
                )}
                {descripcionTipoCuenta !== 'ADMIN_ORG' && estadoMembresia === 'PENDIENTE' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700 rounded-r-xl">
                    <p className="font-bold">Membresía en Revisión</p>
                    <p className="text-sm">Tu solicitud para unirte a la organización está en espera de aprobación por el dueño.</p>
                  </div>
                )}
                {estadoMembresia === 'RECHAZADO' && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 rounded-r-xl">
                    <p className="font-bold">Membresía Rechazada</p>
                    <p className="text-sm">Tu solicitud para unirte a la organización fue denegada.</p>
                  </div>
                )}
                {estadoMembresia === 'APROBADO' && estadoOrganizacion === 'ACTIVA' && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 text-green-700 rounded-r-xl">
                    <p className="font-bold">Miembro Activo</p>
                    <p className="text-sm">Eres miembro activo de la organización.</p>
                  </div>
                )}
              </div>
            )}

            {idOrganizacion ? (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="md:col-span-2 border-b border-slate-200 pb-2 mb-2">
                    <h4 className="font-bold text-slate-600">Datos de la Organización</h4>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Organización</span>
                    <span className="font-bold text-slate-800 text-base">{organizaciones.find(o => o.idOrganizacion.toString() === idOrganizacion.toString())?.nombreOrganizacion || 'No disponible'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">RUT</span>
                    <span className="font-semibold text-slate-700 text-base">{organizaciones.find(o => o.idOrganizacion.toString() === idOrganizacion.toString())?.rut || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email de Contacto</span>
                    <span className="font-semibold text-slate-700 text-base">{organizaciones.find(o => o.idOrganizacion.toString() === idOrganizacion.toString())?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono de Contacto</span>
                    <span className="font-semibold text-slate-700 text-base">{organizaciones.find(o => o.idOrganizacion.toString() === idOrganizacion.toString())?.telefono || 'N/A'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dirección</span>
                    <span className="font-semibold text-slate-700 text-base">{organizaciones.find(o => o.idOrganizacion.toString() === idOrganizacion.toString())?.direccion || 'N/A'}</span>
                  </div>

                  <div className="md:col-span-2 border-b border-slate-200 pb-2 mt-4 mb-2">
                    <h4 className="font-bold text-slate-600">Datos del Representante</h4>
                  </div>
                  <div className="md:col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Representante</span>
                    <span className="font-semibold text-slate-700 text-base">{organizaciones.find(o => o.idOrganizacion.toString() === idOrganizacion.toString())?.nombreRepresentante || 'No disponible'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Representante</span>
                    <span className="font-semibold text-slate-700 text-base">{organizaciones.find(o => o.idOrganizacion.toString() === idOrganizacion.toString())?.emailRepresentante || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono Representante</span>
                    <span className="font-semibold text-slate-700 text-base">{organizaciones.find(o => o.idOrganizacion.toString() === idOrganizacion.toString())?.telefonoRepresentante || 'N/A'}</span>
                  </div>
                </div>
                <p className="text-xs text-amber-600 font-bold mt-4 pt-4 border-t border-slate-200">
                  Ya perteneces a una organización. No puedes registrar o unirte a otra simultáneamente.
                </p>
              </div>
            ) : (
              <>
                <label className="flex items-center space-x-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={perteneceOrg}
                    onChange={(e) => setPerteneceOrg(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Pertenezco a una Organización o Refugio</span>
                </label>

                {perteneceOrg && (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex space-x-4 mb-2">
                      <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="orgMode"
                          value="select"
                          checked={orgMode === 'select'}
                          onChange={() => setOrgMode('select')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Seleccionar existente</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="orgMode"
                          value="create"
                          checked={orgMode === 'create'}
                          onChange={() => setOrgMode('create')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Registrar nueva</span>
                      </label>
                    </div>

                    {orgMode === 'select' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Elige tu Organización</label>
                        <select
                          value={idOrganizacion}
                          onChange={(e) => setIdOrganizacion(e.target.value)}
                          className="w-full bg-white text-slate-800 border border-slate-350 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-semibold bg-white"
                        >
                          <option value="">-- Elige una organización --</option>
                          {organizaciones.map(o => (
                            <option key={o.idOrganizacion} value={o.idOrganizacion}>{o.nombreOrganizacion}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Nombre</label>
                          <input
                            type="text"
                            value={orgNombre}
                            onChange={(e) => setOrgNombre(e.target.value)}
                            className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Patitas Felices"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico (Contacto)</label>
                          <input
                            type="email"
                            value={orgEmail}
                            onChange={(e) => setOrgEmail(e.target.value)}
                            className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: contacto@patitas.cl"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono (Contacto)</label>
                          <input
                            type="text"
                            value={orgTelefono}
                            onChange={(e) => setOrgTelefono(e.target.value)}
                            className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: +5699999999"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Dirección</label>
                          <input
                            type="text"
                            value={orgDireccion}
                            onChange={(e) => setOrgDireccion(e.target.value)}
                            className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Calle Nueva 123"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</Button>
          </div>
        </div>
      </form>

      <div className="mt-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
          🐾 Mis Mascotas Registradas
        </h3>
        
        {misMascotas.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium">Aún no has registrado ninguna mascota personal.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {misMascotas.map((pet) => (
              <div key={pet.idMascota} className="p-4 border border-slate-100 rounded-xl hover:border-blue-300 transition flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden border">
                    <img 
                      src={localStorage.getItem(`pet_photo_${pet.idMascota}`) || (pet.urlsFotografias?.length > 0 ? pet.urlsFotografias[0] : '/pet_placeholder.jpg')} 
                      alt={pet.nombreMascota} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{pet.nombreMascota}</p>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-tight">{pet.nombreRaza || 'Mestizo'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenDelete(pet)}
                  className="bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 p-2 rounded-lg transition"
                  title="Eliminar Mascota"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
