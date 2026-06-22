import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTiposReporte } from '../services/catalogoService';
import { getMisMascotas, createMascota } from '../services/mascotaService';
import { createReporte } from '../services/reporteService';
import Button from '../components/Button';
import MascotaForm from '../components/MascotaForm';
import MapPicker from '../components/MapPicker';
import Toast from '../components/Toast';
import { registrarUbicacion, getUbicacionById, reverseGeocode, getRegiones, getComunasPorRegion } from '../services/geoService';

const ReporteWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const now = new Date();
  const [datePart, setDatePart] = useState(now.toISOString().split('T')[0]);
  const [hourPart, setHourPart] = useState(now.getHours());
  const [minPart, setMinPart] = useState(Math.floor(now.getMinutes() / 5) * 5);

  const [reportData, setReportData] = useState({
    idTipoReporte: '',
    idMascota: '',
    idUbicacionReporte: null,
    latitud: null,
    longitud: null,
    fechaIncidente: ''
  });

  const [geoData, setGeoData] = useState(null);
  const [tiposReporte, setTiposReporte] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [showNewMascotaForm, setShowNewMascotaForm] = useState(false);

  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState('');
  const [tempPetData, setTempPetData] = useState(null);

  useEffect(() => {
    const h = hourPart.toString().padStart(2, '0');
    const m = minPart.toString().padStart(2, '0');
    setReportData(prev => ({ ...prev, fechaIncidente: `${datePart}T${h}:${m}:00` }));
  }, [datePart, hourPart, minPart]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tipos, pets, regionsList] = await Promise.all([
          getTiposReporte(),
          getMisMascotas(),
          getRegiones()
        ]);
        if (tipos && tipos.length > 0) {
          setTiposReporte(tipos);
        } else {
          setTiposReporte([{ id: 1, descripcion: 'Mascota Perdida' }, { id: 2, descripcion: 'Mascota Encontrada' }]);
        }
        setMascotas(pets);
        setRegiones(regionsList || []);
      } catch (err) {
        setTiposReporte([{ id: 1, descripcion: 'Mascota Perdida' }, { id: 2, descripcion: 'Mascota Encontrada' }]);
      }
    };
    fetchData();
  }, []);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleNextStep3 = () => {
    const selectedDate = new Date(reportData.fechaIncidente);
    const now = new Date();
    if (selectedDate > now) {
      setToast({ message: 'La fecha y hora del incidente no puede ser en el futuro.', type: 'error' });
      return;
    }
    handleNext();
  };

  const handleMascotaCreated = async (newMascotaData) => {
    try {
      setLoading(true);
      const petPhotos = newMascotaData.urlsFotografias || [];
      const base64Photo = petPhotos[0] || '';
      if (base64Photo) {
        setUploadedPhotoBase64(base64Photo);
      }

      const payload = {
        ...newMascotaData,
        urlsFotografias: petPhotos,
        sinDueno: Number(reportData.idTipoReporte) === 2
      };

      const res = await createMascota(payload);
      const createdPet = res.data || res; 

      if (createdPet?.idMascota) {
        if (petPhotos.length > 0) {
          localStorage.setItem(`pet_photo_${createdPet.idMascota}`, petPhotos[0]);
          localStorage.setItem(`pet_photos_${createdPet.idMascota}`, JSON.stringify(petPhotos));
        }
      }

      setMascotas(prev => [...prev, createdPet]);
      setReportData(prev => ({ ...prev, idMascota: createdPet.idMascota }));
      setShowNewMascotaForm(false);
      setToast({ message: `¡${createdPet.nombreMascota} registrada!`, type: 'success' });
      setStep(3); 
    } catch (err) {
      setToast({ message: 'Error al registrar mascota', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const cleanString = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  };

  const handleLocationSelect = async (coords) => {
    try {
      setLoading(true);
      setReportData(prev => ({ ...prev, latitud: coords.lat, longitud: coords.lng, idUbicacionReporte: null }));
      const lookup = await reverseGeocode(coords.lat, coords.lng);
      
      let matchedRegion = null;
      let matchedCommune = null;

      if (lookup) {
        const cleanRegionName = cleanString(lookup.region);
        matchedRegion = regiones.find(r => cleanString(r.nombre).includes(cleanRegionName) || cleanRegionName.includes(cleanString(r.nombre)));
        
        if (matchedRegion) {
          setSelectedRegion(matchedRegion.id.toString());
          const communesList = await getComunasPorRegion(matchedRegion.id);
          setComunas(communesList || []);
          
          const cleanCommuneName = cleanString(lookup.comuna);
          matchedCommune = communesList.find(c => cleanString(c.nombre).includes(cleanCommuneName) || cleanCommuneName.includes(cleanString(c.nombre)));
          
          if (matchedCommune) {
            setSelectedCommune(matchedCommune.id.toString());
            const resUbicacion = await registrarUbicacion(coords.lat, coords.lng, matchedCommune.id, lookup.direccionEspecifica);
            const idReal = resUbicacion.idUbicacion;
            setReportData(prev => ({ ...prev, idUbicacionReporte: idReal }));
            
            setGeoData({
              idUbicacion: idReal,
              latitud: coords.lat,
              longitud: coords.lng,
              comuna: {
                id: matchedCommune.id,
                nombre: matchedCommune.nombre,
                region: {
                  id: matchedRegion.id,
                  nombre: matchedRegion.nombre
                }
              },
              displayComuna: matchedCommune.nombre,
              displayRegion: matchedRegion.nombre,
              direccionEspecifica: lookup.direccionEspecifica
            });
            return;
          }
        }
      }

      setSelectedRegion('');
      setSelectedCommune('');
      setComunas([]);
      setGeoData(null);
    } catch (err) {
      setToast({ message: 'Error al procesar ubicación', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = async (regionId) => {
    setSelectedRegion(regionId);
    setSelectedCommune('');
    setComunas([]);
    setGeoData(null);
    setReportData(prev => ({ ...prev, idUbicacionReporte: null }));
    if (regionId) {
      try {
        const listComunas = await getComunasPorRegion(Number(regionId));
        setComunas(listComunas || []);
      } catch (err) {
        setToast({ message: 'Error al cargar comunas', type: 'error' });
      }
    }
  };

  const handleCommuneChange = async (communeId) => {
    setSelectedCommune(communeId);
    setReportData(prev => ({ ...prev, idUbicacionReporte: null }));
    setGeoData(null);
    if (communeId && reportData.latitud && reportData.longitud) {
      try {
        setLoading(true);
        const lookup = await reverseGeocode(reportData.latitud, reportData.longitud);
        const dirEsp = lookup ? lookup.direccionEspecifica : 'Sin dirección específica';
        const resUbicacion = await registrarUbicacion(reportData.latitud, reportData.longitud, Number(communeId), dirEsp);
        const idReal = resUbicacion.idUbicacion;
        
        const regionObj = regiones.find(r => r.id === Number(selectedRegion));
        const communeObj = comunas.find(c => c.id === Number(communeId));

        setReportData(prev => ({ ...prev, idUbicacionReporte: idReal }));
        setGeoData({
          idUbicacion: idReal,
          latitud: reportData.latitud,
          longitud: reportData.longitud,
          comuna: {
            id: communeObj.id,
            nombre: communeObj.nombre,
            region: {
              id: regionObj.id,
              nombre: regionObj.nombre
            }
          },
          displayComuna: communeObj.nombre,
          displayRegion: regionObj.nombre,
          direccionEspecifica: dirEsp
        });
        setToast({ message: 'Ubicación confirmada', type: 'success' });
      } catch (err) {
        setToast({ message: 'Error al registrar ubicación', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitReport = async () => {
    try {
      setLoading(true);
      const payload = {
        idTipoReporte: Number(reportData.idTipoReporte),
        idMascota: Number(reportData.idMascota),
        idUbicacionReporte: Number(reportData.idUbicacionReporte),
        fechaIncidente: reportData.fechaIncidente
      };
      const res = await createReporte(payload);
      const createdReport = res.data || res;
      const idReporte = createdReport?.idReporte || createdReport?.data?.idReporte;

      if (idReporte) {
        const petPhotosStr = localStorage.getItem(`pet_photos_${reportData.idMascota}`);
        if (petPhotosStr) {
          localStorage.setItem(`report_photos_${idReporte}`, petPhotosStr);
          const firstPhoto = JSON.parse(petPhotosStr)[0];
          if (firstPhoto) {
            localStorage.setItem(`report_photo_${idReporte}`, firstPhoto);
          }
        } else {
          const photo = uploadedPhotoBase64 || localStorage.getItem(`pet_photo_${reportData.idMascota}`);
          if (photo) {
            localStorage.setItem(`report_photo_${idReporte}`, photo);
            localStorage.setItem(`report_photos_${idReporte}`, JSON.stringify([photo]));
          }
        }
      }

      setToast({ message: '¡Reporte publicado!', type: 'success' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setToast({ message: 'Error al publicar reporte', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-slate-800 font-sans">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-100 h-2 w-full">
          <div className="bg-blue-600 h-full transition-all duration-700" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 text-center animate-fade-in">
              <h2 className="text-3xl font-black text-slate-900">¿Qué deseas reportar?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {tiposReporte.map((tipo) => (
                  <button
                    key={tipo.id}
                    onClick={() => {
                      setReportData({ ...reportData, idTipoReporte: tipo.id });
                      if (tipo.id === 2) {
                        setShowNewMascotaForm(true);
                      } else {
                        setShowNewMascotaForm(false);
                      }
                      handleNext();
                    }}
                    className="group relative p-8 border-2 border-slate-100 rounded-3xl text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all shadow-sm hover:shadow-xl"
                  >
                    <div className="text-2xl font-black group-hover:text-blue-700">{tipo.descripcion}</div>
                    <p className="text-sm text-slate-400 mt-2 font-medium">Presiona para continuar.</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-black text-slate-900">¿De qué mascota se trata?</h2>
              </div>
              {!showNewMascotaForm ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mascotas.map((m) => (
                      <button
                        key={m.idMascota}
                        onClick={() => { setReportData({ ...reportData, idMascota: m.idMascota }); setStep(3); }}
                        className="p-5 border-2 border-slate-100 rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50 transition-all flex justify-between items-center group shadow-sm"
                      >
                        <div>
                          <div className="font-black text-slate-800">{m.nombreMascota}</div>
                          <div className="text-xs font-bold text-blue-600 uppercase tracking-tighter">{m.nombreRaza}</div>
                        </div>
                        <div className="text-blue-500 font-bold text-xl">&rarr;</div>
                      </button>
                    ))}
                    <button
                      onClick={() => setShowNewMascotaForm(true)}
                      className="p-5 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 hover:border-blue-400 font-bold"
                    >
                      + Registrar Nueva
                    </button>
                  </div>
                  <Button variant="secondary" onClick={handleBack}>&larr; Volver</Button>
                </div>
              ) : (
                <MascotaForm
                  initialData={tempPetData}
                  onSubmit={handleMascotaCreated}
                  onCancel={(currentData) => {
                    if (currentData) {
                      setTempPetData(currentData);
                    }
                    if (Number(reportData.idTipoReporte) === 2) {
                      setStep(1);
                    } else {
                      setShowNewMascotaForm(false);
                    }
                  }}
                  showNombreDesconocidoOption={Number(reportData.idTipoReporte) === 2}
                />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 text-center animate-fade-in">
              <div>
                <h2 className="text-3xl font-black text-slate-900">¿Cuándo fue vista por última vez?</h2>
                <p className="text-slate-400 text-sm mt-2 font-medium">La precisión temporal es clave para las coincidencias.</p>
              </div>
              
              <div className="space-y-8 max-w-xl mx-auto">
                <div className="space-y-3">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-left ml-2">1. Selecciona el día</p>
                   <div className="p-6 bg-blue-50/30 rounded-3xl border-2 border-blue-100 shadow-sm transition-all hover:border-blue-200">
                      <input
                        type="date"
                        value={datePart}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDatePart(e.target.value)}
                        className="w-full text-center text-2xl font-black text-slate-800 bg-transparent outline-none cursor-pointer"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-left ml-2">2. Ajusta la hora</p>
                   <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-xl space-y-8">
                      <div className="flex items-center justify-center space-x-4">
                         <div className="text-center group">
                            <input 
                              type="number" min="0" max="23" value={hourPart} 
                              onChange={(e) => setHourPart(parseInt(e.target.value) || 0)}
                              className="w-24 text-center text-6xl font-black text-slate-800 bg-slate-50 rounded-2xl p-2 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all"
                            />
                            <p className="text-[10px] mt-2 text-slate-400 font-bold uppercase">Horas</p>
                         </div>
                         <div className="text-5xl font-black text-blue-600 self-center mb-6">:</div>
                         <div className="text-center group">
                            <input 
                              type="number" min="0" max="59" value={minPart} 
                              onChange={(e) => setMinPart(parseInt(e.target.value) || 0)}
                              className="w-24 text-center text-6xl font-black text-slate-800 bg-slate-50 rounded-2xl p-2 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all"
                            />
                            <p className="text-[10px] mt-2 text-slate-400 font-bold uppercase">Minutos</p>
                         </div>
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {[0, 15, 30, 45].map(m => (
                          <button 
                            key={m} 
                            onClick={() => setMinPart(m)}
                            className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
                              minPart === m 
                              ? 'bg-blue-600 text-white shadow-lg scale-105' 
                              : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                          >
                            :{m.toString().padStart(2, '0')}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
              </div>



              <div className="bg-blue-600 p-4 rounded-2xl max-w-sm mx-auto shadow-lg shadow-blue-100">
                <p className="text-xs font-bold text-white uppercase tracking-tighter">
                   {new Date(`${datePart}T${hourPart.toString().padStart(2, '0')}:${minPart.toString().padStart(2, '0')}`).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>

              <div className="flex justify-between pt-10 border-t border-slate-50">
                <Button variant="secondary" onClick={handleBack}>&larr; Volver</Button>
                <Button onClick={handleNextStep3}>Continuar al Mapa &rarr;</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-black text-slate-900">
                  {Number(reportData.idTipoReporte) === 2 ? '¿Dónde lo encontraste?' : '¿Dónde ocurrió?'}
                </h2>
                <p className="text-slate-400 text-sm mt-2 font-medium">
                  {Number(reportData.idTipoReporte) === 2 
                    ? 'Marca el punto exacto del avistamiento o hallazgo en el mapa.' 
                    : 'Marca el punto exacto del incidente en el mapa.'}
                </p>
              </div>
              <MapPicker onLocationSelect={handleLocationSelect} />
              


              {geoData && (
                <div className="bg-green-50 p-5 rounded-2xl border-2 border-green-100 flex items-center space-x-4">
                  <div className="bg-green-600 p-2 rounded-xl text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  </div>
                  <div className="text-left">
                    <div className="font-black text-green-900 text-lg">{geoData.direccionEspecifica || geoData.displayComuna}</div>
                    <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{geoData.displayComuna}, {geoData.displayRegion}</div>
                  </div>
                </div>
              )}
              <div className="flex justify-between pt-6 border-t">
                <Button variant="secondary" onClick={handleBack} disabled={loading}>Atrás</Button>
                <Button onClick={handleSubmitReport} disabled={loading || !reportData.idUbicacionReporte}>
                  {loading ? 'Publicando...' : 'Finalizar y Publicar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporteWizard;
