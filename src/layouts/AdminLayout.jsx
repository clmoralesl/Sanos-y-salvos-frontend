import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { setupInterceptors } from '../services/api';
import { getMe } from '../services/usuarioService';
import NotificationBell from '../components/NotificationBell';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessTokenSilently, isLoading, loginWithRedirect, user: auth0User, logout } = useAuth0();

  const [userRole, setUserRole] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [userName, setUserName] = useState('');
  const [dbProfile, setDbProfile] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      setupInterceptors(getAccessTokenSilently);
      const checkUserProfile = async () => {
        try {
          const profile = await getMe();
          setUserName(profile.nombre);
          setDbProfile(profile);
          
          const photo = localStorage.getItem(`user_profile_photo_${profile.idUsuario}`);
          if (photo) {
            setProfilePhoto(photo);
          }

          // ONLY SUPER_ADMIN allowed
          const isSuperAdmin = (profile.descripcionTipoCuenta === 'SUPER_ADMIN') ||
                               (auth0User?.['https://sanosysalvos.cl/roles']?.includes('admin')) ||
                               (auth0User?.['https://sanosysalvos.cl/role'] === 'admin') ||
                               (auth0User?.['roles']?.includes('admin')) ||
                               (auth0User?.['role'] === 'admin');
          if (!isSuperAdmin) {
            navigate('/');
          } else {
            setUserRole('SUPER_ADMIN');
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            navigate('/registro');
          } else {
             navigate('/');
          }
        }
      };
      checkUserProfile();
    } else if (!isLoading) {
      const userJson = localStorage.getItem('currentUser');
      if (!userJson) {
        loginWithRedirect();
        return;
      }
      const user = JSON.parse(userJson);
      if (user.role !== 'admin') {
        navigate('/');
      } else {
        setUserRole('SUPER_ADMIN'); // mock role for local admin
        setUserName(user.name);
      }
    }
  }, [isAuthenticated, getAccessTokenSilently, isLoading, navigate, loginWithRedirect]);

  if (isLoading || !userRole) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-blue-600 font-bold animate-pulse">Cargando consola de administración...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* SIDEBAR LUMINOSO */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-blue-600 tracking-widest uppercase">Sistema</span>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Admin Console</h2>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Métricas y Datos</p>
          <NavLink to="/admin" end className={({isActive}) => `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/reportes" className={({isActive}) => `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            🚨 Reportes
          </NavLink>

          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Mantenedores</p>
          <NavLink to="/admin/usuarios" className={({isActive}) => `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            👥 Usuarios
          </NavLink>
          <NavLink to="/admin/mascotas" className={({isActive}) => `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            🐾 Mascotas
          </NavLink>
          <NavLink to="/admin/organizaciones" className={({isActive}) => `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            🏢 Organizaciones
          </NavLink>

          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Flujos de Aprobación</p>
          <NavLink to="/admin/solicitudes-org" className={({isActive}) => `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${isActive ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'}`}>
            🔔 Solicitudes de Org.
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link to="/" className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition shadow-sm">
            ⬅️ Volver al Sitio
          </Link>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-grow flex flex-col overflow-hidden">
        
        {/* HEADER SUPERIOR */}
        <header className="bg-white h-20 px-8 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-0">
          <div className="flex items-center gap-3">
             <span className="text-xl">✨</span>
             <h1 className="text-xl font-bold text-slate-800">Panel de Control</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800">{userName}</p>
              <p className="text-xs font-semibold text-blue-600">Súper Administrador</p>
            </div>
            <NotificationBell dbProfile={dbProfile} />
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-xl">
              {profilePhoto ? <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" /> : '👤'}
            </div>
          </div>
        </header>

        {/* ÁREA DE TRABAJO */}
        <main className="flex-grow p-8 overflow-y-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
