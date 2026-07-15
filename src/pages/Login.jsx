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
    } else {

      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, navigate, loginWithRedirect]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center animate-pulse">
        <h2 className="text-2xl font-extrabold text-blue-600 mb-2">Sanos y Salvos</h2>
        <p className="text-slate-500 font-medium">Redirigiendo al sistema de inicio de sesión seguro...</p>
      </div>
    </div>
  );
};

export default Login;
