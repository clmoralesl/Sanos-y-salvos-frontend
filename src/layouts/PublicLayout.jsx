import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const PublicLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      setUser(JSON.parse(userJson));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">Sanos y Salvos</Link>
          </div>
          <div className="flex items-center space-x-6">
            {user && (
              <div className="flex items-center space-x-3 text-sm">
                <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium border border-gray-200">
                  👤 {user.name} ({user.role === 'admin' ? 'Admin' : 'Normal'})
                </span>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-bold transition">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 font-bold transition"
                >
                  Salir
                </button>
              </div>
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
