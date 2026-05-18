import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">Sanos y Salvos</Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/reportar" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm">Crear Reporte</Link>
            <Link to="/admin" className="text-gray-500 hover:text-blue-600 text-sm font-medium transition flex items-center">
              Admin
            </Link>
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
