import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
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
