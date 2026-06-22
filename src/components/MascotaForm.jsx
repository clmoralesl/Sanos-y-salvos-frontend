import React, { useState, useEffect } from 'react';
import Button from './Button';
import { getRazas, getTamanios, getEspecies, getCaracteristicas } from '../services/catalogoService';

const MascotaForm = ({ initialData, onSubmit, onCancel, showNombreDesconocidoOption }) => {
  const [formData, setFormData] = useState({
    nombreMascota: initialData?.nombreMascota || '',
    descripcion: initialData?.descripcion || '',
    colorPrimario: initialData?.colorPrimario || '',
    colorSecundario: initialData?.colorSecundario || '',
    idRaza: initialData?.idRaza || '',
    idTamanio: initialData?.idTamanio || '',
    idsCaracteristicas: initialData?.idsCaracteristicas || [],
    urlsFotografias: initialData?.urlsFotografias || [],
    edadAproximada: initialData?.edadAproximada || ''
  });

  const [razas, setRazas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [tamanios, setTamanios] = useState([]);
  const [allCaracteristicas, setAllCaracteristicas] = useState([]);
  const [selectedEspecie, setSelectedEspecie] = useState(initialData?.selectedEspecie || '');
  const [customEspecie, setCustomEspecie] = useState(initialData?.customEspecie || '');

  const [desconoceNombre, setDesconoceNombre] = useState(initialData?.desconoceNombre || formData.nombreMascota === 'Desconocido');
  const [tempNombre, setTempNombre] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setDesconoceNombre(checked);
    if (checked) {
      setTempNombre(formData.nombreMascota);
      setFormData(prev => ({ ...prev, nombreMascota: 'Desconocido' }));
    } else {
      setFormData(prev => ({ ...prev, nombreMascota: tempNombre || '' }));
    }
  };

  const processFiles = (files) => {
    const fileList = Array.from(files);
    fileList.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            urlsFotografias: [...prev.urlsFotografias, reader.result]
          }));
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removePhoto = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      urlsFotografias: prev.urlsFotografias.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [razasData, tamaniosData, especiesData, caracteristicasData] = await Promise.all([
          getRazas(),
          getTamanios(),
          getEspecies(),
          getCaracteristicas()
        ]);
        
        if (razasData && razasData.length > 0) {
          setRazas(razasData);
        } else {
          setRazas([
            { id: 1, descripcion: 'Mestizo / Callejero', idEspecie: 1 },
            { id: 2, descripcion: 'Labrador Retriever', idEspecie: 1 },
            { id: 3, descripcion: 'Pastor Alemán', idEspecie: 1 },
            { id: 4, descripcion: 'Siamés (Gato)', idEspecie: 2 },
            { id: 16, descripcion: 'No lo sé / No estoy seguro', idEspecie: 1 }
          ]);
        }

        if (especiesData && especiesData.length > 0) {
          setEspecies(especiesData);
        } else {
          setEspecies([
            { id: 1, descripcion: 'Perro' },
            { id: 2, descripcion: 'Gato' }
          ]);
        }

        if (tamaniosData && tamaniosData.length > 0) {
          setTamanios(tamaniosData);
        } else {
          setTamanios([
            { id: 1, descripcion: 'Pequeño' },
            { id: 2, descripcion: 'Mediano' },
            { id: 3, descripcion: 'Grande' }
          ]);
        }

        if (caracteristicasData && caracteristicasData.length > 0) {
          setAllCaracteristicas(caracteristicasData);
        }

        if (initialData) {
          const matchedRaza = razasData.find(r => r.id === initialData.idRaza || r.descripcion === initialData.nombreRaza);
          if (matchedRaza && matchedRaza.idEspecie) {
            setSelectedEspecie(matchedRaza.idEspecie);
          }
          let mappedIds = initialData.idsCaracteristicas || [];
          if (mappedIds.length === 0 && initialData.caracteristicas && caracteristicasData) {
            mappedIds = initialData.caracteristicas.map(cName => {
              const found = caracteristicasData.find(c => c.descripcion.toLowerCase() === cName.toLowerCase());
              return found ? found.id : null;
            }).filter(Boolean);
          }
          setFormData(prev => ({
            ...prev,
            idRaza: prev.idRaza || matchedRaza?.id || '',
            idTamanio: prev.idTamanio || tamaniosData.find(t => t.descripcion === initialData.descripcionTamanio)?.id || '',
            idsCaracteristicas: mappedIds
          }));
        }
      } catch (err) {
        console.error("Error loading catalogs:", err);
      }
    };
    fetchCatalogos();
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalDescription = formData.descripcion;
    if (Number(selectedEspecie) === 11 && customEspecie) {
      finalDescription = `[Especie: ${customEspecie}] ${formData.descripcion}`;
    }
    onSubmit({
      ...formData,
      idRaza: formData.idRaza ? Number(formData.idRaza) : null,
      idTamanio: formData.idTamanio ? Number(formData.idTamanio) : null,
      descripcion: finalDescription
    });
  };

  const filteredRazas = razas.filter(r => 
    r.idEspecie === Number(selectedEspecie)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Nombre de la Mascota</label>
        {showNombreDesconocidoOption && (
          <p className="text-xs text-gray-500 mb-2 font-medium">
            Si la mascota tiene placa con identificación, collar con datos o si conoces su nombre, regístralo aquí.
          </p>
        )}
        <input
          type="text"
          name="nombreMascota"
          value={formData.nombreMascota}
          onChange={handleChange}
          required={showNombreDesconocidoOption ? !desconoceNombre : true}
          disabled={showNombreDesconocidoOption && desconoceNombre}
          placeholder={showNombreDesconocidoOption && desconoceNombre ? "Desconocido" : "Ej: Bobby, Luna..."}
          className={`mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all ${
            showNombreDesconocidoOption && desconoceNombre ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : ''
          }`}
        />
        {showNombreDesconocidoOption && (
          <label className="flex items-center space-x-2 mt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={desconoceNombre}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600 font-bold">Desconozco el nombre de la mascota</span>
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Descripción / Señas Particulares</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows="3"
          placeholder="Describe si usa collar, cicatrices, comportamiento, etc."
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Color Principal</label>
          <select
            name="colorPrimario"
            value={formData.colorPrimario}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="" disabled>Selecciona color principal</option>
            {['Blanco', 'Negro', 'Marrón / Café', 'Gris', 'Naranjo', 'Amarillo / Rubio', 'Crema', 'Atigrado', 'Manchado', 'Otro'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Color Secundario (Opcional)</label>
          <select
            name="colorSecundario"
            value={formData.colorSecundario}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Ninguno</option>
            {['Blanco', 'Negro', 'Marrón / Café', 'Gris', 'Naranjo', 'Amarillo / Rubio', 'Crema', 'Atigrado', 'Manchado', 'Otro'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Edad Aproximada</label>
        <select
          name="edadAproximada"
          value={formData.edadAproximada}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="" disabled>Selecciona edad aproximada</option>
          {['0-1 años', '1-3 años', '3-7 años', '7+ años'].map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 font-bold">Especie / Tipo de Animal</label>
            <select
              value={selectedEspecie}
              onChange={(e) => {
                setSelectedEspecie(e.target.value);
                setFormData(prev => ({ ...prev, idRaza: '' }));
              }}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              required
            >
              <option value="" disabled>Selecciona una especie</option>
              {especies.map(e => <option key={e.id} value={e.id}>{e.descripcion}</option>)}
            </select>
          </div>

          {Number(selectedEspecie) === 11 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">Especifica qué especie es</label>
              <input
                type="text"
                value={customEspecie}
                onChange={(e) => setCustomEspecie(e.target.value)}
                placeholder="Ej: Jirafa, Llama..."
                className="block w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                required
              />
            </div>
          )}

          {selectedEspecie && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 font-bold">Raza</label>
              <select
                name="idRaza"
                value={formData.idRaza}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                required
              >
                <option value="" disabled>Selecciona una raza</option>
                {filteredRazas.map(r => <option key={r.id} value={r.id}>{r.descripcion}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 font-bold">Tamaño Estimado</label>
          <div className="space-y-2">
            {tamanios.map(t => (
              <label key={t.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="idTamanio"
                  value={t.id}
                  checked={Number(formData.idTamanio) === t.id}
                  onChange={() => setFormData({...formData, idTamanio: t.id})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  required
                />
                <span className="text-sm text-gray-700">{t.descripcion}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2 border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 font-bold">Características de la Mascota (Tags)</label>
        <div className="flex gap-2">
          <select
            value=""
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val && !formData.idsCaracteristicas.includes(val)) {
                setFormData(prev => ({
                  ...prev,
                  idsCaracteristicas: [...prev.idsCaracteristicas, val]
                }));
              }
            }}
            className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="">Seleccionar característica para agregar...</option>
            {allCaracteristicas
              .filter(c => !formData.idsCaracteristicas.includes(c.id))
              .map(c => (
                <option key={c.id} value={c.id}>{c.descripcion}</option>
              ))
            }
          </select>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {formData.idsCaracteristicas.map(id => {
            const charObj = allCaracteristicas.find(c => c.id === id);
            if (!charObj) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-xs font-bold transition-all"
              >
                {charObj.descripcion}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      idsCaracteristicas: prev.idsCaracteristicas.filter(x => x !== id)
                    }));
                  }}
                  className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-200/50 hover:bg-blue-300/50 text-blue-800 transition"
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 font-bold">Fotografías de la Mascota (Opcional)</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('pet-photo-input').click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
              : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-slate-100/50'
          }`}
        >
          <input
            id="pet-photo-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="text-4xl mb-2">📸</div>
          <p className="text-sm font-bold text-slate-700">Subir imágenes o arrastrar aquí</p>
          <p className="text-xs text-slate-400 mt-1">Soporta múltiples imágenes (.jpg, .png)</p>
        </div>
        {formData.urlsFotografias && formData.urlsFotografias.length > 0 && (
          <div className="grid grid-cols-4 gap-3 pt-4">
            {formData.urlsFotografias.map((photo, idx) => (
              <div key={idx} className="relative group w-full h-24 bg-gray-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={photo} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(idx);
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

      <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
        <Button
          variant="secondary"
          onClick={(e) => {
            e.preventDefault();
            if (onCancel) {
              onCancel({
                ...formData,
                selectedEspecie,
                customEspecie,
                desconoceNombre
              });
            }
          }}
        >
          &larr; Volver atrás
        </Button>
        <Button type="submit">Guardar Mascota</Button>
      </div>
    </form>
  );
};

export default MascotaForm;
