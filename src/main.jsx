import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'

// Pages
import Home from './pages/Home'
import ReportesFeed from './pages/ReportesFeed'
import ReporteWizard from './pages/ReporteWizard'
import ReporteDetalle from './pages/ReporteDetalle'
import Dashboard from './pages/admin/Dashboard'
import Usuarios from './pages/admin/Usuarios'
import Mascotas from './pages/admin/Mascotas'
import Reportes from './pages/admin/Reportes'
import Organizaciones from './pages/admin/Organizaciones'
import AdminReporteDetalle from './pages/admin/AdminReporteDetalle'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="buscar" element={<ReportesFeed />} />
          <Route path="reportar" element={<ReporteWizard />} />
          <Route path="reportes/:id" element={<ReporteDetalle />} />
        </Route>

        {/* Rutas de Administración */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="mascotas" element={<Mascotas />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="reportes/:id" element={<AdminReporteDetalle />} />
          <Route path="organizaciones" element={<Organizaciones />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="h-screen flex items-center justify-center">404 - Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
