import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDetalleReporte } from '../services/bffService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ReporteDetalle = () => {
  const { id } = useParams();
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        setLoading(true);
        const data = await getDetalleReporte(id);
        setDetalle(data);
      } catch (err) {
        console.error("Error cargando detalle:", err);
        setError("No se pudo cargar el detalle del reporte.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen text-blue-600 font-bold">Cargando detalles...</div>;
  if (error) return <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <nav className="text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-blue-600 transition">Inicio</Link> / <span>Reporte #{id}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {detalle.tipoReporte}: {detalle.mascota.nombre}
          </h1>
          <div className="flex space-x-4 mt-2 text-sm">
             <p className="text-gray-500">Publicado: <span className="font-bold">{new Date(detalle.fechaRegistro).toLocaleDateString()}</span></p>
             <p className="text-blue-600 font-bold uppercase tracking-tighter italic">Visto por última vez: {new Date(detalle.fechaIncidente).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
            detalle.estadoReporte === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            ● {detalle.estadoReporte}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Ficha de la Mascota
              </h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 overflow-hidden">
                  <img src={localStorage.getItem(`report_photo_${id}`) || localStorage.getItem(`pet_photo_${detalle.mascota.id}`) || (detalle.mascota.fotos?.length > 0 ? detalle.mascota.fotos[0] : '/pet_placeholder.jpg')} alt="Mascota" className="h-full w-full object-cover rounded-xl" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Nombre</p>
                    <p className="text-lg font-medium text-gray-900">{detalle.mascota.nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Especie</p>
                    <p className="text-lg font-medium text-gray-900">{detalle.mascota.especie}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Raza</p>
                    <p className="text-lg font-medium text-gray-900">{detalle.mascota.raza}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Tamaño</p>
                    <p className="text-lg font-medium text-gray-900">{detalle.mascota.tamanio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Color Primario</p>
                    <p className="text-lg font-medium text-gray-900">{detalle.mascota.colorPrimario || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Color Secundario</p>
                    <p className="text-lg font-medium text-gray-900">{detalle.mascota.colorSecundario || 'Ninguno'}</p>
                  </div>
                </div>

                {detalle.mascota.caracteristicas && detalle.mascota.caracteristicas.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Características</p>
                    <div className="flex flex-wrap gap-1.5">
                      {detalle.mascota.caracteristicas.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Descripción</p>
                  <p className="text-gray-700 leading-relaxed italic">"{detalle.mascota.descripcion}"</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <svg className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ubicación del Incidente
              </h2>
            </div>
            <div className="h-96 w-full">
              <MapContainer 
                center={[detalle.ubicacion.latitud, detalle.ubicacion.longitud]} 
                zoom={15} 
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[detalle.ubicacion.latitud, detalle.ubicacion.longitud]}>
                  <Popup>H3: {detalle.ubicacion.codigoH3}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="p-6 bg-blue-50 flex flex-col md:flex-row justify-between items-start md:items-center text-sm gap-2">
              <div>
                <p className="text-blue-900 font-black text-base">{detalle.ubicacion.direccionEspecifica || 'Sin dirección específica'}</p>
                <p className="text-blue-700 text-xs mt-0.5">{detalle.ubicacion.comuna}, {detalle.ubicacion.region}</p>
              </div>
              <span className="text-blue-600 font-mono text-xs">H3_CELL: {detalle.ubicacion.codigoH3}</span>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Datos del Contacto
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-white p-2 rounded-lg shadow-sm font-bold">👤</div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Publicado por</p>
                  <p className="text-sm font-medium">{detalle.usuario.nombre}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-white p-2 rounded-lg shadow-sm font-bold">📧</div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Email</p>
                  <p className="text-sm font-medium">{detalle.usuario.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-white p-2 rounded-lg shadow-sm font-bold">📞</div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Teléfono</p>
                  <p className="text-sm font-medium">{detalle.usuario.telefono}</p>
                </div>
              </div>
              <button className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg flex items-center justify-center">
                Contactar por WhatsApp
              </button>
            </div>
          </section>
      </div>
    </div>

    {detalle.coincidencias && detalle.coincidencias.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-2xl mr-2">✨</span>
            Coincidencias Detectadas ({detalle.coincidencias.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {detalle.coincidencias.map((coincidencia) => (
              <div 
                key={coincidencia.idReporte} 
                className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between hover:shadow-md transition duration-300"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-500 font-mono">Reporte #{coincidencia.idReporte}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      coincidencia.porcentajeSimilitud >= 70 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {coincidencia.porcentajeSimilitud}% Similitud
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden">
                      <img src={localStorage.getItem(`report_photo_${coincidencia.idReporte}`) || ((coincidencia.fotos && coincidencia.fotos.length > 0) ? coincidencia.fotos[0] : '/pet_placeholder.jpg')} alt="Match" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{coincidencia.nombreMascota}</h4>
                      <p className="text-xs text-gray-600">{coincidencia.especie} • {coincidencia.raza}</p>
                      <p className="text-xs text-gray-500 mt-1">📍 {coincidencia.direccionEspecifica ? `${coincidencia.direccionEspecifica}, ${coincidencia.comuna}` : `${coincidencia.comuna}, ${coincidencia.region}`}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(coincidencia.fechaIncidente).toLocaleDateString()}</span>
                  <Link 
                    to={`/reportes/${coincidencia.idReporte}`} 
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Ver Reporte →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ReporteDetalle;
