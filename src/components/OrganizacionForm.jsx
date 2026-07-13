import React, { useState } from 'react';
import Button from './Button';
import { formatRut, filterPhoneDigits, buildPhone, stripPhonePrefix } from '../utils/formatters';

const OrganizacionForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreOrganizacion: initialData?.nombreOrganizacion || '',
    direccion: initialData?.direccion || '',
    telefonoDigits: stripPhonePrefix(initialData?.telefono),
    email: initialData?.email || '',
    rut: initialData?.rut || '',
    rutRepresentante: initialData?.rutRepresentante || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRutChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: formatRut(value) });
  };

  const handlePhoneChange = (e) => {
    setFormData({ ...formData, telefonoDigits: filterPhoneDigits(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombreOrganizacion: formData.nombreOrganizacion,
      direccion: formData.direccion,
      telefono: buildPhone(formData.telefonoDigits),
      email: formData.email,
      rut: formData.rut,
      rutRepresentante: formData.rutRepresentante
    });
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
        <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="contacto@organizacion.cl"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Teléfono <span className="text-red-500">*</span></label>
        <div className="mt-1 flex rounded-md border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <span className="bg-gray-100 text-gray-600 px-3 py-2 text-sm font-bold border-r border-gray-300 flex items-center select-none">
            +56
          </span>
          <input
            type="tel"
            value={formData.telefonoDigits}
            onChange={handlePhoneChange}
            maxLength={9}
            required
            className="flex-1 p-2 focus:outline-none text-sm"
            placeholder="912345678"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">9 dígitos (ej: 912345678)</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">RUT Organización</label>
        <input
          type="text"
          name="rut"
          value={formData.rut}
          onChange={handleRutChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Ej: 70.123.456-7"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">RUT Representante Legal</label>
        <input
          type="text"
          name="rutRepresentante"
          value={formData.rutRepresentante}
          onChange={handleRutChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Ej: 12.345.678-9"
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
