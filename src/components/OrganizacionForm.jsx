import React, { useState } from 'react';
import Button from './Button';

const OrganizacionForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    nombreOrganizacion: '',
    direccion: '',
    telefono: '',
    rut: '',
    rutRepresentante: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre de la Organización</label>
        <input
          type="text"
          name="nombreOrganizacion"
          value={formData.nombreOrganizacion}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Dirección</label>
        <input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
        <input
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">RUT Organización</label>
        <input
          type="text"
          name="rut"
          value={formData.rut}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">RUT Representante Legal</label>
        <input
          type="text"
          name="rutRepresentante"
          value={formData.rutRepresentante}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
};

export default OrganizacionForm;
