import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { setupInterceptors } from '../services/api';
import { getMe } from '../services/usuarioService';

const PublicLayout = () => {
  const { loginWithRedirect, logout, user: auth0User, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [localUser, setLocalUser] = useState(null);
  const navigate = useNavigate();
  const [dbProfile, setDbProfile] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const profile = await getMe();
        setDbProfile(profile);
        const photo = localStorage.getItem(`user_profile_photo_${profile.idUsuario}`);
        if (photo) {
          setProfilePhoto(photo);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          navigate('/registro');
        }
      }
    };

    if (isAuthenticated) {
      setupInterceptors(getAccessTokenSilently);
      loadProfileData();
    } else {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        setLocalUser(JSON.parse(userJson));
        loadProfileData();
      } else {
        setLocalUser(null);
        setDbProfile(null);
        setProfilePhoto('');
      }
    }
  }, [isAuthenticated, getAccessTokenSilently, navigate]);

  useEffect(() => {
    if (auth0User) {
      console.log("Auth0 User details:", auth0User);
    }
  }, [auth0User]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">Sanos y Salvos</Link>
          </div>
          <div className="flex items-center space-x-6">
            {(isAuthenticated || localUser) && (
              <div className="flex space-x-4 text-sm font-bold text-gray-600">
                <Link to="/mis-reportes" className="hover:text-blue-600 transition">Mis Reportes</Link>
                <Link to="/perfil" className="hover:text-blue-600 transition">Mi Perfil</Link>
                {((localUser?.role === 'admin') || 
                  (dbProfile?.descripcionTipoCuenta === 'SUPER_ADMIN' || dbProfile?.descripcionTipoCuenta === 'ADMIN_ORG') ||
                  (auth0User?.['https://sanosysalvos.cl/roles']?.includes('admin')) ||
                  (auth0User?.['https://sanosysalvos.cl/role'] === 'admin') ||
                  (auth0User?.['roles']?.includes('admin')) ||
                  (auth0User?.['role'] === 'admin')) && (
                  <Link to="/admin" className="text-red-600 hover:text-red-700 transition flex items-center gap-1 font-black">
                    ⚙️ Administración
                  </Link>
                )}
              </div>
            )}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 text-sm">
                <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium border border-gray-200 flex items-center space-x-2">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <span>👤</span>
                  )}
                  <span>{dbProfile?.nombre || auth0User?.name || auth0User?.email}</span>
                </span>
                <button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="text-red-500 hover:text-red-700 font-bold transition"
                >
                  Salir
                </button>
              </div>
            ) : localUser ? (
              <div className="flex items-center space-x-3 text-sm">
                <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium border border-gray-200 flex items-center space-x-2">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <span>👤</span>
                  )}
                  <span>{dbProfile?.nombre || localUser.name} (Local)</span>
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('currentUser');
                    setLocalUser(null);
                    window.location.reload();
                  }}
                  className="text-red-500 hover:text-red-700 font-bold transition"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="text-gray-600 hover:text-blue-600 font-bold transition text-sm"
              >
                Iniciar Sesión
              </button>
            )}
            <Link to="/reportar" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm">Crear Reporte</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2026 Sanos y Salvos - Proyecto de Ingeniería Informática
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
