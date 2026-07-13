import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getOrganizaciones, createOrganizacion } from '../services/organizacionService';
import { registrarUsuario } from '../services/usuarioService';
import { formatRut, filterPhoneDigits, buildPhone } from '../utils/formatters';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user: auth0User, isAuthenticated, isLoading } = useAuth0();

  const [nombre, setNombre] = useState('');
  const [telefonoDigits, setTelefonoDigits] = useState('');
  const [perteneceOrg, setPerteneceOrg] = useState(false);
  const [orgMode, setOrgMode] = useState('select');
  const [idOrganizacion, setIdOrganizacion] = useState('');
  const [organizaciones, setOrganizaciones] = useState([]);

  const [orgNombre, setOrgNombre] = useState('');
  const [orgDireccion, setOrgDireccion] = useState('');
  const [orgTelefonoDigits, setOrgTelefonoDigits] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgRut, setOrgRut] = useState('');
  const [orgRutRepresentante, setOrgRutRepresentante] = useState('');

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (auth0User) {
      setNombre(auth0User.name || auth0User.nickname || '');
    }
  }, [auth0User]);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data = await getOrganizaciones();
        setOrganizaciones(data);
      } catch (err) {
        console.error('Error fetching organizations:', err);
      }
    };
    fetchOrgs();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-slate-500 animate-pulse font-medium">
          Cargando datos de sesión...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full border text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso no autorizado</h2>
          <p className="text-gray-600 mb-6">Debes iniciar sesión con Auth0 para poder completar tu registro.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }
    if (telefonoDigits.length !== 9) {
      setErrorMsg('El teléfono debe tener exactamente 9 dígitos luego del +56.');
      return;
    }

    setLoadingSubmit(true);
    setErrorMsg('');

    try {
      let finalOrgId = null;
      let finalTipoCuenta = 1;

      if (perteneceOrg) {
        if (orgMode === 'create') {
          finalTipoCuenta = 2;
          if (!orgNombre.trim() || !orgRut.trim() || !orgRutRepresentante.trim() || !orgEmail.trim() || orgTelefonoDigits.length !== 9) {
            setErrorMsg('Todos los campos de la organización son obligatorios y el teléfono debe tener 9 dígitos.');
            setLoadingSubmit(false);
            return;
          }
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
          finalTipoCuenta = 1;
          if (!idOrganizacion) {
            setErrorMsg('Por favor selecciona una organización de la lista.');
            setLoadingSubmit(false);
            return;
          }
          finalOrgId = parseInt(idOrganizacion);
        }
      }

      await registrarUsuario({
        auth0Id: auth0User.sub,
        nombre: nombre,
        email: auth0User.email,
        telefono: buildPhone(telefonoDigits),
        idOrganizacion: finalOrgId,
        idTipoCuenta: finalTipoCuenta
      });

      navigate('/');
    } catch (err) {
      console.error('Error in onboarding registration:', err);
      setErrorMsg(err.response?.data?.message || 'Error al completar el registro. Por favor intenta de nuevo.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800">Completa tu Registro</h2>
          <p className="mt-2 text-sm text-slate-500">
            Hola, {auth0User?.email}. Ingresa tus datos para registrarte en el sistema.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-100">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="text"
              value={auth0User?.email || ''}
              disabled
              className="w-full bg-slate-100 text-slate-500 rounded-xl border border-slate-200 px-4 py-3 cursor-not-allowed text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-white text-slate-800 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              placeholder="Ingresa tu nombre"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Teléfono de Contacto <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <span className="bg-slate-100 text-slate-600 px-4 py-3 text-sm font-bold border-r border-slate-300 flex items-center select-none">
                +56
              </span>
              <input
                type="tel"
                value={telefonoDigits}
                onChange={(e) => setTelefonoDigits(filterPhoneDigits(e.target.value))}
                maxLength={9}
                className="flex-1 bg-white text-slate-800 px-4 py-3 focus:outline-none text-sm"
                placeholder="912345678"
                required
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">9 dígitos (ej: 912345678)</p>
          </div>

          <div className="border-t border-slate-150 pt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={perteneceOrg}
                onChange={(e) => setPerteneceOrg(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm font-medium text-slate-700">
                Pertenezco a una Organización o Refugio
              </span>
            </label>
          </div>

          {perteneceOrg && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex space-x-4 mb-4">
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
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Selecciona tu Organización
                  </label>
                  <select
                    value={idOrganizacion}
                    onChange={(e) => setIdOrganizacion(e.target.value)}
                    className="w-full bg-white text-slate-800 rounded-xl border border-slate-350 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  >
                    <option value="">-- Elige una organización --</option>
                    {organizaciones.map((org) => (
                      <option key={org.idOrganizacion} value={org.idOrganizacion}>
                        {org.nombreOrganizacion}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Nombre de la Organización
                    </label>
                    <input
                      type="text"
                      value={orgNombre}
                      onChange={(e) => setOrgNombre(e.target.value)}
                      className="w-full bg-white text-slate-800 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Patitas Felices"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Correo Electrónico (Contacto)
                    </label>
                    <input
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      className="w-full bg-white text-slate-800 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: contacto@patitas.cl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Teléfono de la Organización <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                      <span className="bg-slate-100 text-slate-600 px-3 py-2 text-xs font-bold border-r border-slate-300 flex items-center select-none">
                        +56
                      </span>
                      <input
                        type="tel"
                        value={orgTelefonoDigits}
                        onChange={(e) => setOrgTelefonoDigits(filterPhoneDigits(e.target.value))}
                        maxLength={9}
                        className="flex-1 bg-white text-slate-800 px-3 py-2 focus:outline-none text-xs"
                        placeholder="912345678"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Dirección de la Organización
                    </label>
                    <input
                      type="text"
                      value={orgDireccion}
                      onChange={(e) => setOrgDireccion(e.target.value)}
                      className="w-full bg-white text-slate-800 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Av. Providencia 123"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      RUT de la Organización
                    </label>
                    <input
                      type="text"
                      value={orgRut}
                      onChange={(e) => setOrgRut(formatRut(e.target.value))}
                      className="w-full bg-white text-slate-800 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 70.123.456-7"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Tu RUT (como representante legal)
                    </label>
                    <input
                      type="text"
                      value={orgRutRepresentante}
                      onChange={(e) => setOrgRutRepresentante(formatRut(e.target.value))}
                      className="w-full bg-white text-slate-800 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 12.345.678-9"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm mt-4"
          >
            {loadingSubmit ? 'Guardando Registro...' : 'Completar Registro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
