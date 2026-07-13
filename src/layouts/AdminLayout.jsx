import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { setupInterceptors } from '../services/api';
import { getMe } from '../services/usuarioService';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessTokenSilently, isLoading, loginWithRedirect, user: auth0User } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      setupInterceptors(getAccessTokenSilently);
      const checkUserProfile = async () => {
        try {
          const profile = await getMe();
          const userIsAdmin = (profile.descripcionTipoCuenta === 'SUPER_ADMIN' || profile.descripcionTipoCuenta === 'ADMIN_ORG') ||
                              (auth0User?.['https://sanosysalvos.cl/roles']?.includes('admin')) ||
                              (auth0User?.['https://sanosysalvos.cl/role'] === 'admin') ||
                              (auth0User?.['roles']?.includes('admin')) ||
                              (auth0User?.['role'] === 'admin');
          if (!userIsAdmin) {
            navigate('/');
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            navigate('/registro');
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
      }
    }
  }, [isAuthenticated, getAccessTokenSilently, isLoading, navigate, loginWithRedirect]);

  if (isLoading) {
    return <div className="p-10 text-center animate-pulse text-slate-500">Cargando sesión administrativa...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          Panel Admin
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <Link to="/admin" className="block p-3 rounded hover:bg-slate-700 transition">Dashboard</Link>
          <Link to="/admin/usuarios" className="block p-3 rounded hover:bg-slate-700 transition">Usuarios</Link>
          <Link to="/admin/mascotas" className="block p-3 rounded hover:bg-slate-700 transition">Mascotas</Link>
          <Link to="/admin/reportes" className="block p-3 rounded hover:bg-slate-700 transition">Reportes</Link>
          <Link to="/admin/organizaciones" className="block p-3 rounded hover:bg-slate-700 transition">Organizaciones</Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Link to="/" className="text-sm text-slate-400 hover:text-white">Volver al Sitio</Link>
        </div>
      </aside>

      <div className="flex-grow flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center px-8">
          <h1 className="text-lg font-medium text-gray-700">Administración de Sistema</h1>
        </header>
        <main className="p-8 flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
