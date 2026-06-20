import React, { useState, useEffect } from 'react';
import Button from './Button';
import { getRazas, getTamanios, getEspecies, getCaracteristicas } from '../services/catalogoService';

const MascotaForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreMascota: initialData?.nombreMascota || '',
    descripcion: initialData?.descripcion || '',
    colorPrimario: initialData?.colorPrimario || '',
    colorSecundario: initialData?.colorSecundario || '',
    idRaza: initialData?.idRaza || '', 
    idTamanio: initialData?.idTamanio || '',
    idsCaracteristicas: initialData?.idsCaracteristicas || [],
    urlsFotografias: initialData?.urlsFotografias || []
  });

  const [razas, setRazas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [tamanios, setTamanios] = useState([]);
  const [allCaracteristicas, setAllCaracteristicas] = useState([]);
  const [selectedEspecie, setSelectedEspecie] = useState('');
  const [customEspecie, setCustomEspecie] = useState('');
  const [searchTerm, setSearchQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState(initialData?.urlsFotografias?.[0] || '');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          urlsFotografias: [reader.result]
        }));
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      descripcion: finalDescription
    });
  };

  const filteredRazas = razas.filter(r => 
    r.idEspecie === Number(selectedEspecie) &&
    r.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Nombre de la Mascota</label>
        <input
          type="text"
          name="nombreMascota"
          value={formData.nombreMascota}
          onChange={handleChange}
          required
          placeholder="Ej: Bobby, Luna..."
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
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
              <input
                type="text"
                placeholder="Buscar raza..."
                value={searchTerm}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full border border-gray-200 rounded-t-lg p-2.5 text-sm bg-gray-50 focus:bg-white outline-none"
              />
              <select
                name="idRaza"
                value={formData.idRaza}
                onChange={handleChange}
                size="4"
                className="block w-full border border-t-0 border-gray-300 rounded-b-lg shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm overflow-y-auto bg-white"
                required
              >
                <option value="" disabled>Selecciona una raza</option>
                {filteredRazas.map(r => <option key={r.id} value={r.id}>{r.descripcion}</option>)}
                {filteredRazas.length === 0 && <option disabled>No se encontraron resultados</option>}
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
        <label className="block text-sm font-medium text-gray-700 font-bold">Fotografía de la Mascota (Opcional)</label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {previewUrl && (
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
              <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Mascota</Button>
      </div>
    </form>
  );
};

export default MascotaForm;
