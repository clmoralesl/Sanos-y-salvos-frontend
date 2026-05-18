import React from 'react';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Usuarios Totales</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">154</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Reportes Activos</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">28</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Mascotas en DB</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">342</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Casos Resueltos</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">89</p>
      </div>

      <div className="md:col-span-4 bg-white p-8 rounded-xl shadow-sm border border-gray-100 mt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Bienvenido al Panel de Control</h2>
        <p className="text-gray-600">
          Desde aquí puedes gestionar todas las entidades del sistema. Utiliza el menú lateral para navegar entre los diferentes mantenedores.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
