import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getMe, updateMe } from '../services/usuarioService';
import { getOrganizaciones, createOrganizacion } from '../services/organizacionService';
import { getMisMascotas, deleteMascota } from '../services/mascotaService';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { filterPhoneDigits, buildPhone, stripPhonePrefix, formatRut, validateRut } from '../utils/formatters';

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
  const [orgTelefonoDigits, setOrgTelefonoDigits] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgRut, setOrgRut] = useState('');
  const [orgRutRepresentante, setOrgRutRepresentante] = useState('');

  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [misMascotas, setMisMascotas] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // Estados de error inline
  const [errors, setErrors] = useState({
    nombre: '',
    telefono: '',
    orgNombre: '',
    orgEmail: '',
    orgTelefono: '',
    orgDireccion: '',
    orgRut: '',
    orgRutRepresentante: '',
    idOrganizacion: ''
  });

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
      setTelefono(stripPhonePrefix(data.telefono));
      setIdTipoCuenta(data.idTipoCuenta || 1);
      
      setEstadoMembresia(data.estadoMembresia || '');
      setEstadoOrganizacion(data.estadoOrganizacion || '');
      setDescripcionTipoCuenta(data.descripcionTipoCuenta || '');

      setProfilePhoto(data.urlFotoPerfil || '');

      if (data.nombreOrganizacion) {
        setPerteneceOrg(true);
      }

      const orgsData = await getOrganizaciones();
      setOrganizaciones(orgsData);

      if (data.nombreOrganizacion && orgsData.length > 0) {
        const matched = orgsData.find(o => o.nombreOrganizacion === data.nombreOrganizacion);
        if (matched) {
          if (data.estadoMembresia === 'RECHAZADO') {
            setIdOrganizacion('');
            setPerteneceOrg(false); // Let them choose whether to join a new one
          } else {
            setIdOrganizacion(matched.idOrganizacion.toString());
          }
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

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploadingPhoto(true);
        const { subirImagenAS3 } = await import('../services/cloudinaryService');
        const publicUrl = await subirImagenAS3(file, 'perfil');
        setProfilePhoto(publicUrl);
        setToast({ message: 'Foto de perfil subida exitosamente.', type: 'success' });
      } catch (err) {
        console.error('Error al subir foto:', err);
        setToast({ message: 'Error al subir la foto de perfil.', type: 'error' });
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Reset errors
    const newErrors = {
      nombre: '',
      telefono: '',
      orgNombre: '',
      orgEmail: '',
      orgTelefono: '',
      orgDireccion: '',
      orgRut: '',
      orgRutRepresentante: '',
      idOrganizacion: ''
    };
    let hasError = false;

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
      hasError = true;
    }
    if (telefono.length !== 9) {
      newErrors.telefono = 'El teléfono debe tener exactamente 9 dígitos luego del +56.';
      hasError = true;
    }

    if (perteneceOrg && !idOrganizacion) {
      if (orgMode === 'create') {
        if (!orgNombre.trim()) {
          newErrors.orgNombre = 'El nombre de la organización es obligatorio.';
          hasError = true;
        }
        if (!orgEmail.trim()) {
          newErrors.orgEmail = 'El correo electrónico es obligatorio.';
          hasError = true;
        }
        if (orgTelefonoDigits.length !== 9) {
          newErrors.orgTelefono = 'El teléfono debe tener exactamente 9 dígitos luego del +56.';
          hasError = true;
        }
        if (!orgDireccion.trim()) {
          newErrors.orgDireccion = 'La dirección es obligatoria.';
          hasError = true;
        }
        if (!orgRut.trim() || !validateRut(orgRut)) {
          newErrors.orgRut = 'El RUT de la organización es inválido.';
          hasError = true;
        }
        if (!orgRutRepresentante.trim() || !validateRut(orgRutRepresentante)) {
          newErrors.orgRutRepresentante = 'El RUT del representante es inválido.';
          hasError = true;
        }
      } else {
        if (!idOrganizacion) {
          newErrors.idOrganizacion = 'Por favor selecciona una organización.';
          hasError = true;
        }
      }
    }

    if (hasError) {
      setErrors(newErrors);
      setMessage({ type: 'error', text: 'Por favor corrige los errores en el formulario.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let finalOrgId = null;
      let finalTipoCuenta = idTipoCuenta;

      if (perteneceOrg) {
        if (orgMode === 'create' && !idOrganizacion) {
          if (finalTipoCuenta < 2) finalTipoCuenta = 2;
          const newOrg = await createOrganizacion({
            nombreOrganizacion: orgNombre,
            direccion: orgDireccion,
            telefono: buildPhone(orgTelefonoDigits),
            email: orgEmail,
            rut: orgRut,
            rutRepresentante: orgRutRepresentante
          });
          finalOrgId = newOrg.idOrganizacion;
        } else {
          finalOrgId = parseInt(idOrganizacion);
        }
      } else {
        if (finalTipoCuenta === 2) {
          finalTipoCuenta = 1;
        }
      }

      await updateMe({
        auth0Id,
        nombre,
        email,
        telefono: buildPhone(telefono),
        idOrganizacion: finalOrgId,
        idTipoCuenta: finalTipoCuenta,
        urlFotoPerfil: profilePhoto
      });

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

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center space-y-4 h-fit">
          <div className="w-32 h-32 bg-slate-100 rounded-full border border-gray-200 overflow-hidden relative group flex items-center justify-center">
            {uploadingPhoto ? (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs font-bold text-blue-600 animate-pulse">Subiendo...</div>
            ) : null}
            <img
              src={profilePhoto || '/Default_pfp.jpg'}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full text-center">
            <label className={`bg-slate-50 hover:bg-slate-100 border text-slate-700 text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition shadow-sm inline-block ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadingPhoto ? 'Subiendo...' : '📷 Cambiar Foto'}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </label>
            {profilePhoto && (
              <button
                type="button"
                onClick={() => setProfilePhoto('')}
                className="block text-[10px] text-red-500 font-bold hover:underline mt-2 mx-auto"
              >
                Eliminar foto
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Información Personal</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                <input
                  type="text"
                  value={email}
                  disabled
                  className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-xl px-4 py-2.5 cursor-not-allowed text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setErrors(prev => ({ ...prev, nombre: '' }));
                  }}
                  className={`w-full bg-white text-slate-800 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition text-sm font-semibold ${
                    errors.nombre ? 'border-red-500 focus:ring-red-500' : 'border-slate-350 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono <span className="text-red-500">*</span></label>
                <div className={`flex rounded-xl border overflow-hidden focus-within:ring-2 ${
                  errors.telefono ? 'border-red-500 focus-within:ring-red-500' : 'border-slate-355 focus-within:ring-blue-500'
                }`}>
                  <span className="bg-slate-100 text-slate-600 px-4 py-2.5 text-sm font-bold border-r border-slate-300 flex items-center select-none">
                    +56
                  </span>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => {
                      setTelefono(filterPhoneDigits(e.target.value));
                      setErrors(prev => ({ ...prev, telefono: '' }));
                    }}
                    maxLength={9}
                    className="flex-1 bg-white text-slate-800 px-4 py-2.5 focus:outline-none text-sm font-semibold"
                    placeholder="912345678"
                  />
                </div>
                {errors.telefono ? (
                  <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">9 dígitos (ej: 912345678)</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Filiación Institucional</h3>

            {/* BANNER INFORMATIVO DE ESTADO */}
            <div className="mb-4">
              {perteneceOrg && descripcionTipoCuenta === 'ADMIN_ORG' && estadoOrganizacion === 'PENDIENTE' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700 rounded-r-xl">
                  <p className="font-bold">Solicitud de Organización en Revisión</p>
                  <p className="text-sm">Tu solicitud para registrar la organización está pendiente de aprobación por un administrador.</p>
                </div>
              )}
              {perteneceOrg && descripcionTipoCuenta === 'ADMIN_ORG' && estadoOrganizacion === 'RECHAZADA' && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 rounded-r-xl">
                  <p className="font-bold">Solicitud Rechazada</p>
                  <p className="text-sm">Tu solicitud para registrar la organización fue rechazada. Por favor, revisa los datos o contacta a soporte.</p>
                </div>
              )}
              {perteneceOrg && descripcionTipoCuenta !== 'ADMIN_ORG' && estadoMembresia === 'PENDIENTE' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700 rounded-r-xl">
                  <p className="font-bold">Membresía en Revisión</p>
                  <p className="text-sm">Tu solicitud para unirte a la organización está en espera de aprobación por el dueño.</p>
                </div>
              )}
              {estadoMembresia === 'RECHAZADO' && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 rounded-r-xl mb-4">
                  <p className="font-bold">Membresía Rechazada</p>
                  <p className="text-sm">Tu solicitud para unirte a la organización fue denegada. Puedes intentar con otra organización.</p>
                </div>
              )}
              {perteneceOrg && estadoMembresia === 'APROBADO' && estadoOrganizacion === 'ACTIVA' && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 text-green-700 rounded-r-xl">
                  <p className="font-bold">Miembro Activo</p>
                  <p className="text-sm">Eres miembro activo de la organización.</p>
                </div>
              )}
            </div>

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
                          onChange={(e) => {
                            setIdOrganizacion(e.target.value);
                            setErrors(prev => ({ ...prev, idOrganizacion: '' }));
                          }}
                          className={`w-full bg-white text-slate-800 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition text-sm font-semibold bg-white ${
                            errors.idOrganizacion ? 'border-red-500 focus:ring-red-500' : 'border-slate-350 focus:ring-blue-500'
                          }`}
                        >
                          <option value="">-- Elige una organización --</option>
                          {organizaciones.filter(o => o.estado === 'ACTIVA').map(o => (
                            <option key={o.idOrganizacion} value={o.idOrganizacion}>{o.nombreOrganizacion}</option>
                          ))}
                        </select>
                        {errors.idOrganizacion && <p className="text-xs text-red-500 mt-1">{errors.idOrganizacion}</p>}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Nombre</label>
                          <input
                            type="text"
                            value={orgNombre}
                            onChange={(e) => {
                              setOrgNombre(e.target.value);
                              setErrors(prev => ({ ...prev, orgNombre: '' }));
                            }}
                            className={`w-full bg-white text-slate-800 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 ${
                              errors.orgNombre ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                            }`}
                            placeholder="Ej: Patitas Felices"
                          />
                          {errors.orgNombre && <p className="text-xs text-red-500 mt-1">{errors.orgNombre}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico (Contacto)</label>
                          <input
                            type="email"
                            value={orgEmail}
                            onChange={(e) => {
                              setOrgEmail(e.target.value);
                              setErrors(prev => ({ ...prev, orgEmail: '' }));
                            }}
                            className={`w-full bg-white text-slate-800 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 ${
                              errors.orgEmail ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                            }`}
                            placeholder="Ej: contacto@patitas.cl"
                          />
                          {errors.orgEmail && <p className="text-xs text-red-500 mt-1">{errors.orgEmail}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono (Contacto) <span className="text-red-500">*</span></label>
                          <div className={`flex rounded-xl border overflow-hidden focus-within:ring-2 ${
                            errors.orgTelefono ? 'border-red-500 focus-within:ring-red-500' : 'border-slate-300 focus-within:ring-blue-500'
                          }`}>
                            <span className="bg-slate-100 text-slate-600 px-3 py-2 text-xs font-bold border-r border-slate-300 flex items-center select-none">
                              +56
                            </span>
                            <input
                              type="tel"
                              value={orgTelefonoDigits}
                              onChange={(e) => {
                                setOrgTelefonoDigits(filterPhoneDigits(e.target.value));
                                setErrors(prev => ({ ...prev, orgTelefono: '' }));
                              }}
                              maxLength={9}
                              className="flex-1 bg-white text-slate-800 px-3 py-2 focus:outline-none text-xs"
                              placeholder="912345678"
                            />
                          </div>
                          {errors.orgTelefono && <p className="text-xs text-red-500 mt-1">{errors.orgTelefono}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Dirección</label>
                          <input
                            type="text"
                            value={orgDireccion}
                            onChange={(e) => {
                              setOrgDireccion(e.target.value);
                              setErrors(prev => ({ ...prev, orgDireccion: '' }));
                            }}
                            className={`w-full bg-white text-slate-800 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 ${
                              errors.orgDireccion ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                            }`}
                            placeholder="Ej: Calle Nueva 123"
                          />
                          {errors.orgDireccion && <p className="text-xs text-red-500 mt-1">{errors.orgDireccion}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">RUT de la Organización</label>
                          <input
                            type="text"
                            value={orgRut}
                            onChange={(e) => {
                              setOrgRut(formatRut(e.target.value));
                              setErrors(prev => ({ ...prev, orgRut: '' }));
                            }}
                            className={`w-full bg-white text-slate-800 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 ${
                              errors.orgRut ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                            }`}
                            placeholder="Ej: 70.123.456-7"
                          />
                          {errors.orgRut && <p className="text-xs text-red-500 mt-1">{errors.orgRut}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Tu RUT (como representante legal)</label>
                          <input
                            type="text"
                            value={orgRutRepresentante}
                            onChange={(e) => {
                              setOrgRutRepresentante(formatRut(e.target.value));
                              setErrors(prev => ({ ...prev, orgRutRepresentante: '' }));
                            }}
                            className={`w-full bg-white text-slate-800 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 ${
                              errors.orgRutRepresentante ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                            }`}
                            placeholder="Ej: 12.345.678-9"
                          />
                          {errors.orgRutRepresentante && <p className="text-xs text-red-500 mt-1">{errors.orgRutRepresentante}</p>}
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
