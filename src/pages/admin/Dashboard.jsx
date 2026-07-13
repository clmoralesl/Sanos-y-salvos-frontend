import React, { useState, useEffect } from 'react';
import { getUsuarios } from '../../services/usuarioService';
import { getReportes } from '../../services/reporteService';
import { getMascotas } from '../../services/mascotaService';
import { getOrganizaciones } from '../../services/organizacionService';

const StatCard = ({ title, value, color, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-3xl font-bold mt-2 ${color}`}>
      {value !== null ? value : <span className="animate-pulse text-gray-300 text-lg">Cargando...</span>}
    </p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    usuarios: null,
    reportesActivos: null,
    mascotas: null,
    casosResueltos: null,
    orgsActivas: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [usuarios, reportes, mascotas, orgs] = await Promise.all([
          getUsuarios(),
          getReportes(),
          getMascotas(),
          getOrganizaciones(),
        ]);
        setStats({
          usuarios: usuarios.length,
          reportesActivos: reportes.filter(r => r.estado !== 'CERRADO').length,
          mascotas: mascotas.length,
          casosResueltos: reportes.filter(r => r.estado === 'CERRADO').length,
          orgsActivas: orgs.filter(o => o.estado === 'ACTIVA').length,
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Usuarios Totales" value={stats.usuarios} color="text-gray-900" icon="👥" />
        <StatCard title="Reportes Activos" value={stats.reportesActivos} color="text-blue-600" icon="📋" />
        <StatCard title="Mascotas en DB" value={stats.mascotas} color="text-gray-900" icon="🐾" />
        <StatCard title="Casos Resueltos" value={stats.casosResueltos} color="text-green-600" icon="✅" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Organizaciones Activas" value={stats.orgsActivas} color="text-purple-600" icon="🏢" />
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Bienvenido al Panel de Control</h2>
          <p className="text-gray-600 text-sm">
            Desde aquí puedes gestionar todas las entidades del sistema. Utiliza el menú lateral para navegar entre los diferentes módulos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
