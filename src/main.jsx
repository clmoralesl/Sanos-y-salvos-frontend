import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import ReportesFeed from './pages/ReportesFeed'
import ReporteWizard from './pages/ReporteWizard'
import ReporteDetalle from './pages/ReporteDetalle'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import MisReportes from './pages/MisReportes'
import Perfil from './pages/Perfil'
import Dashboard from './pages/admin/Dashboard'
import Usuarios from './pages/admin/Usuarios'
import Mascotas from './pages/admin/Mascotas'
import Reportes from './pages/admin/Reportes'
import Organizaciones from './pages/admin/Organizaciones'
import SolicitudesOrganizaciones from './pages/admin/SolicitudesOrganizaciones'
import SolicitudesUsuarios from './pages/admin/SolicitudesUsuarios'
import AdminReporteDetalle from './pages/admin/AdminReporteDetalle'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Onboarding />} />

          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="buscar" element={<ReportesFeed />} />
            <Route path="reportar" element={<ReporteWizard />} />
            <Route path="reportes/:id" element={<ReporteDetalle />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="mis-reportes" element={<MisReportes />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="mascotas" element={<Mascotas />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="reportes/:id" element={<AdminReporteDetalle />} />
            <Route path="organizaciones" element={<Organizaciones />} />
            <Route path="solicitudes-org" element={<SolicitudesOrganizaciones />} />
            <Route path="solicitudes-voluntarios" element={<SolicitudesUsuarios />} />
          </Route>

          <Route path="*" element={<div className="h-screen flex items-center justify-center">404 - Página no encontrada</div>} />
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>,
)
