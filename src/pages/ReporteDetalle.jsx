import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getDetalleReporte } from '../services/bffService';
import { getTamanios, getCaracteristicas, getRazas } from '../services/catalogoService';
import { updateMascota } from '../services/mascotaService';
import { updateReporte } from '../services/reporteService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../components/Button';
import Toast from '../components/Toast';

const ReporteDetalle = () => {
  const { id } = useParams();
  const { user: auth0User, isAuthenticated } = useAuth0();
  const [localUser, setLocalUser] = useState(null);

  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [photosList, setPhotosList] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const [nombreMascota, setNombreMascota] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [colorPrimario, setColorPrimario] = useState('');
  const [colorSecundario, setColorSecundario] = useState('');
  const [idRaza, setIdRaza] = useState('');
  const [idTamanio, setIdTamanio] = useState('');
  const [edadAproximada, setEdadAproximada] = useState('');
  const [idsCaracteristicas, setIdsCaracteristicas] = useState([]);
  const [idTipoReporte, setIdTipoReporte] = useState('');
  const [fechaIncidente, setFechaIncidente] = useState('');
  const [desconoceNombre, setDesconoceNombre] = useState(false);
  const [tempNombre, setTempNombre] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState(null);

  const [razas, setRazas] = useState([]);
  const [tamanios, setTamanios] = useState([]);
  const [allCaracteristicas, setAllCaracteristicas] = useState([]);

  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      setLocalUser(JSON.parse(userJson));
    }
  }, []);

  const fetchDetalle = async () => {
    try {
      setLoading(true);
      const data = await getDetalleReporte(id);
      setDetalle(data);

      const localPhotosStr = localStorage.getItem(`report_photos_${id}`);
      let list = [];
      if (localPhotosStr) {
        list = JSON.parse(localPhotosStr);
      } else {
        const single = localStorage.getItem(`report_photo_${id}`) || localStorage.getItem(`pet_photo_${data.mascota.id}`);
        if (single) {
          list = [single];
        } else if (data.mascota.fotos && data.mascota.fotos.length > 0) {
          list = data.mascota.fotos;
        }
      }
      setPhotosList(list);
      setSelectedPhoto(list[0] || '/pet_placeholder.jpg');

      setNombreMascota(data.mascota.nombre);
      setDesconoceNombre(data.mascota.nombre === 'Desconocido');
      setDescripcion(data.mascota.descripcion);
      setColorPrimario(data.mascota.colorPrimario || '');
      setColorSecundario(data.mascota.colorSecundario || '');
      setEdadAproximada(data.mascota.edadAproximada || '');
      setFechaIncidente(data.fechaIncidente.substring(0, 16));
      setIdTipoReporte(data.tipoReporte.toLowerCase().includes('perdida') ? '1' : '2');
    } catch (err) {
      console.error("Error loading detail:", err);
      setError("No se pudo cargar el detalle del reporte.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalle();
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      const loadCatalogos = async () => {
        try {
          const [rData, tData, cData] = await Promise.all([
            getRazas(),
            getTamanios(),
            getCaracteristicas()
          ]);
          setRazas(rData || []);
          setTamanios(tData || []);
          setAllCaracteristicas(cData || []);

          if (detalle) {
            const matchedRaza = rData.find(r => r.descripcion === detalle.mascota.raza);
            if (matchedRaza) setIdRaza(matchedRaza.id.toString());

            const matchedTamanio = tData.find(t => t.descripcion === detalle.mascota.tamanio);
            if (matchedTamanio) setIdTamanio(matchedTamanio.id.toString());

            const matchedCharIds = (detalle.mascota.caracteristicas || [])
              .map(cName => cData.find(c => c.descripcion.toLowerCase() === cName.toLowerCase())?.id)
              .filter(Boolean);
            setIdsCaracteristicas(matchedCharIds);
          }
        } catch (err) {
          console.error("Error loading catalogos:", err);
        }
      };
      loadCatalogos();
    }
  }, [isEditing, detalle]);

  if (loading) return <div className="flex justify-center items-center h-screen text-blue-600 font-bold">Cargando detalles...</div>;
  if (error) return <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>;

  const isOwner = detalle && (
    (isAuthenticated && auth0User?.email === detalle.usuario.email) ||
    (localUser && localUser.email === detalle.usuario.email)
  );

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setDesconoceNombre(checked);
    if (checked) {
      setTempNombre(nombreMascota);
      setNombreMascota('Desconocido');
    } else {
      setNombreMascota(tempNombre || '');
    }
  };

  const processFiles = (files) => {
    const fileList = Array.from(files);
    fileList.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotosList(prev => {
            const updated = [...prev, reader.result];
            if (updated.length === 1) {
              setSelectedPhoto(reader.result);
            }
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoadingSave(true);
    try {
      await updateMascota(detalle.mascota.id, {
        nombreMascota,
        descripcion,
        colorPrimario,
        colorSecundario,
        idRaza: Number(idRaza),
        idTamanio: Number(idTamanio),
        idsCaracteristicas,
        urlsFotografias: photosList,
        edadAproximada
      });

      await updateReporte(id, {
        idTipoReporte: Number(idTipoReporte),
        idMascota: detalle.mascota.id,
        idUbicacionReporte: detalle.idUbicacionReporte,
        fechaIncidente: fechaIncidente + ":00"
      });

      localStorage.setItem(`report_photos_${id}`, JSON.stringify(photosList));
      if (photosList.length > 0) {
        localStorage.setItem(`report_photo_${id}`, photosList[0]);
        localStorage.setItem(`pet_photo_${detalle.mascota.id}`, photosList[0]);
        localStorage.setItem(`pet_photos_${detalle.mascota.id}`, JSON.stringify(photosList));
      } else {
        localStorage.removeItem(`report_photo_${id}`);
        localStorage.removeItem(`pet_photo_${detalle.mascota.id}`);
        localStorage.removeItem(`pet_photos_${detalle.mascota.id}`);
      }

      setIsEditing(false);
      await fetchDetalle();
    } catch (err) {
      console.error("Error saving edits:", err);
      setToast({ message: "Error al guardar las modificaciones.", type: "error" });
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8 text-slate-800">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
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
          {isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-md text-sm"
            >
              📝 Editar Reporte
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
          <h2 className="text-2xl font-black text-slate-900 border-b pb-3">Modificar Reporte y Ficha</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Reporte</label>
              <select
                value={idTipoReporte}
                onChange={(e) => setIdTipoReporte(e.target.value)}
                className="w-full p-3 border rounded-xl bg-white"
                required
              >
                <option value="1">Mascota Perdida</option>
                <option value="2">Mascota Encontrada / Avistamiento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Fecha y Hora del Incidente</label>
              <input
                type="datetime-local"
                value={fechaIncidente}
                onChange={(e) => setFechaIncidente(e.target.value)}
                className="w-full p-3 border rounded-xl bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Mascota</label>
              <p className="text-xs text-gray-500 mb-2 font-medium">
                Si la mascota tiene placa con identificación, collar con datos o si conoces su nombre, regístralo aquí.
              </p>
              <input
                type="text"
                value={nombreMascota}
                onChange={(e) => setNombreMascota(e.target.value)}
                required={!desconoceNombre}
                disabled={desconoceNombre}
                placeholder={desconoceNombre ? "Desconocido" : "Ej: Bobby, Luna..."}
                className={`w-full p-3 border rounded-xl bg-white transition-all ${
                  desconoceNombre ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : ''
                }`}
              />
              <label className="flex items-center space-x-2 mt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={desconoceNombre}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600 font-bold">Desconozco el nombre de la mascota</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tamaño Estimado</label>
              <select
                value={idTamanio}
                onChange={(e) => setIdTamanio(e.target.value)}
                className="w-full p-3 border rounded-xl bg-white"
                required
              >
                <option value="">-- Selecciona tamaño --</option>
                {tamanios.map(t => <option key={t.id} value={t.id}>{t.descripcion}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Color Principal</label>
              <select
                value={colorPrimario}
                onChange={(e) => setColorPrimario(e.target.value)}
                className="w-full p-3 border rounded-xl bg-white"
                required
              >
                <option value="">-- Selecciona color --</option>
                {['Blanco', 'Negro', 'Marrón / Café', 'Gris', 'Naranjo', 'Amarillo / Rubio', 'Crema', 'Atigrado', 'Manchado', 'Otro'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Color Secundario</label>
              <select
                value={colorSecundario}
                onChange={(e) => setColorSecundario(e.target.value)}
                className="w-full p-3 border rounded-xl bg-white"
              >
                <option value="">Ninguno</option>
                {['Blanco', 'Negro', 'Marrón / Café', 'Gris', 'Naranjo', 'Amarillo / Rubio', 'Crema', 'Atigrado', 'Manchado', 'Otro'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Edad Aproximada</label>
              <select
                value={edadAproximada}
                onChange={(e) => setEdadAproximada(e.target.value)}
                className="w-full p-3 border rounded-xl bg-white"
                required
              >
                <option value="">-- Selecciona edad --</option>
                {['0-1 años', '1-3 años', '3-7 años', '7+ años'].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Descripción de la Mascota</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows="3"
              className="w-full p-3 border rounded-xl bg-white"
              required
            />
          </div>

          <div className="space-y-2 border-t pt-6">
            <label className="block text-sm font-bold text-slate-700">Características / Tags</label>
            <select
              value=""
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val && !idsCaracteristicas.includes(val)) {
                  setIdsCaracteristicas(prev => [...prev, val]);
                }
              }}
              className="w-full p-3 border rounded-xl bg-white text-sm"
            >
              <option value="">Agregar característica...</option>
              {allCaracteristicas
                .filter(c => !idsCaracteristicas.includes(c.id))
                .map(c => <option key={c.id} value={c.id}>{c.descripcion}</option>)}
            </select>
            <div className="flex flex-wrap gap-2 pt-2">
              {idsCaracteristicas.map(charId => {
                const charObj = allCaracteristicas.find(c => c.id === charId);
                if (!charObj) return null;
                return (
                  <span key={charId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                    {charObj.descripcion}
                    <button
                      type="button"
                      onClick={() => setIdsCaracteristicas(prev => prev.filter(id => id !== charId))}
                      className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-200/50 hover:bg-blue-300 text-blue-800 transition text-[10px]"
                    >
                      &times;
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <label className="block text-sm font-bold text-slate-700">Fotografías de la Mascota</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('report-pet-photo-input').click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-slate-100/50'
              }`}
            >
              <input
                id="report-pet-photo-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm font-bold text-slate-700">Subir imágenes o arrastrar aquí</p>
              <p className="text-xs text-slate-400 mt-1">Soporta múltiples imágenes (.jpg, .png)</p>
            </div>
            {photosList.length > 0 && (
              <div className="grid grid-cols-4 gap-3 pt-2">
                {photosList.map((photo, idx) => (
                  <div key={idx} className="relative group w-full h-24 bg-gray-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={photo} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotosList(prev => {
                          const updated = prev.filter((_, i) => i !== idx);
                          if (selectedPhoto === photo) {
                            setSelectedPhoto(updated[0] || '/pet_placeholder.jpg');
                          }
                          return updated;
                        });
                      }}
                      className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-md"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={loadingSave}>Cancelar</Button>
            <Button type="submit" disabled={loadingSave}>{loadingSave ? 'Guardando...' : 'Guardar Cambios'}</Button>
          </div>
        </form>
      ) : (
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
                  <div className="h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 overflow-hidden border">
                    <img src={selectedPhoto} alt="Mascota" className="h-full w-full object-cover rounded-xl" />
                  </div>
                  {photosList.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto py-1">
                      {photosList.map((photo, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPhoto(photo)}
                          className={`w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                            selectedPhoto === photo ? 'border-blue-500 scale-105 shadow-sm' : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img src={photo} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
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
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Edad Aproximada</p>
                      <p className="text-lg font-medium text-gray-900">{detalle.mascota.edadAproximada || 'No especificada'}</p>
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
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
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
      )}

      {detalle && detalle.coincidencias && detalle.coincidencias.length > 0 && (
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
                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden border">
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
