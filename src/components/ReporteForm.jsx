import React, { useState, useEffect } from 'react';
import Button from './Button';
import { getTiposReporte } from '../services/catalogoService';
import { getMascotas } from '../services/mascotaService';

const ReporteForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    idTipoReporte: initialData?.idTipoReporte || '',
    idMascota: initialData?.idMascota || '',
    idUbicacionReporte: initialData?.idUbicacionReporte || '',
    fechaReporte: initialData?.fechaReporte ? initialData.fechaReporte.slice(0, 16) : new Date().toISOString().slice(0, 16)
  });

  const [tipos, setTipos] = useState([]);
  const [mascotas, setMascotas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiposData, mascotasData] = await Promise.all([
          getTiposReporte(),
          getMascotas()
        ]);
        setTipos(tiposData);
        setMascotas(mascotasData);

        if (initialData && tiposData.length > 0) {
          const matchedTipo = tiposData.find(t => t.descripcion === initialData.tipoReporte);
          if (matchedTipo) {
            setFormData(prev => ({ ...prev, idTipoReporte: matchedTipo.id }));
          }
        }
      } catch (err) {
        console.error("Error al cargar catálogos para reporte:", err);
      }
    };
    fetchData();
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      idTipoReporte: Number(formData.idTipoReporte),
      idMascota: Number(formData.idMascota),
      idUbicacionReporte: Number(formData.idUbicacionReporte),
      fechaReporte: formData.fechaReporte
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Tipo de Reporte</label>
          <select
            name="idTipoReporte"
            value={formData.idTipoReporte}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar tipo...</option>
            {tipos.map(t => <option key={t.id} value={t.id}>{t.descripcion}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Fecha del Incidente</label>
          <input
            type="datetime-local"
            name="fechaReporte"
            value={formData.fechaReporte}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Mascota</label>
        <select
          name="idMascota"
          value={formData.idMascota}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Seleccionar mascota...</option>
          {mascotas.map(m => (
            <option key={m.idMascota} value={m.idMascota}>
              {m.nombreMascota} (Dueño: {m.nombreDueno})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 font-bold mb-1">ID Ubicación (ms-geo)</label>
        <input
          type="number"
          name="idUbicacionReporte"
          value={formData.idUbicacionReporte}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500"
        />
        <p className="text-[10px] text-gray-400 mt-1">Este ID debe existir en el microservicio de geolocalización.</p>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Actualizar Reporte</Button>
      </div>
    </form>
  );
};

export default ReporteForm;
