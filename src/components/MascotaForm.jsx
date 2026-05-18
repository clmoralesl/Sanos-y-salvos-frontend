import React, { useState, useEffect } from 'react';
import Button from './Button';
import { getRazas, getTamanios } from '../services/catalogoService';

const MascotaForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreMascota: initialData?.nombreMascota || '',
    descripcion: initialData?.descripcion || '',
    idRaza: initialData?.idRaza || '', 
    idTamanio: initialData?.idTamanio || '',
    idsCaracteristicas: initialData?.idsCaracteristicas || [],
    urlsFotografias: initialData?.urlsFotografias || []
  });

  const [razas, setRazas] = useState([]);
  const [tamanios, setTamanios] = useState([]);
  const [searchTerm, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [razasData, tamaniosData] = await Promise.all([getRazas(), getTamanios()]);
        
        
        if (razasData && razasData.length > 0) {
          setRazas(razasData);
        } else {
          setRazas([
            { id: 1, descripcion: 'Mestizo / Callejero' },
            { id: 2, descripcion: 'Labrador Retriever' },
            { id: 3, descripcion: 'Pastor Alemán' },
            { id: 4, descripcion: 'Siamés (Gato)' },
            { id: 16, descripcion: 'No lo sé / No estoy seguro' }
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

        if (initialData) {
          setFormData(prev => ({
            ...prev,
            idRaza: prev.idRaza || razasData.find(r => r.descripcion === initialData.nombreRaza)?.id || '',
            idTamanio: prev.idTamanio || tamaniosData.find(t => t.descripcion === initialData.descripcionTamanio)?.id || ''
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
    onSubmit(formData);
  };

  
  const filteredRazas = razas.filter(r => 
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
          placeholder="Describe color, manchas, si usa collar, etc."
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 font-bold">Raza</label>
          
          <input
            type="text"
            placeholder="Buscar raza..."
            value={searchTerm}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full border border-gray-200 rounded-t-lg p-2 text-sm bg-gray-50 focus:bg-white outline-none"
          />
          <select
            name="idRaza"
            value={formData.idRaza}
            onChange={handleChange}
            size="5"
            className="block w-full border border-t-0 border-gray-300 rounded-b-lg shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm overflow-y-auto"
            required
          >
            <option value="" disabled>Selecciona una raza</option>
            {filteredRazas.map(r => <option key={r.id} value={r.id}>{r.descripcion}</option>)}
            {filteredRazas.length === 0 && <option disabled>No se encontraron resultados</option>}
          </select>
          <p className="text-[10px] text-gray-500 mt-1 italic">* Si no la conoces, busca 'Mestizo' o 'No lo sé'.</p>
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

      <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Mascota</Button>
      </div>
    </form>
  );
};

export default MascotaForm;
