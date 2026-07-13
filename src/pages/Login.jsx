import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Login = () => {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isLoading) return;
    const user = localStorage.getItem('currentUser');
    if (isAuthenticated || user) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700 text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white">Sanos y Salvos</h2>
          <p className="mt-2 text-sm text-slate-400">Plataforma de gestión de reportes y refugios de mascotas</p>
        </div>

        <button
          onClick={() => loginWithRedirect()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition shadow-lg border border-blue-500 flex items-center justify-center gap-2 text-lg"
        >
          🔑 Iniciar sesión con Auth0
        </button>
      </div>
    </div>
  );
};

export default Login;
