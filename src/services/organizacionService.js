import api from './api';

const PREFIX = '/mascotas/v1/organizaciones';

export const getOrganizaciones = async () => {
  const response = await api.get(PREFIX);
  return Array.isArray(response.data) ? response.data : [];
};

export const getOrganizacionById = async (id) => {
  const response = await api.get(`${PREFIX}/${id}`);
  return response.data;
};

export const createOrganizacion = async (organizacionData) => {
  const response = await api.post(PREFIX, organizacionData);
  return response.data;
};

export const updateOrganizacion = async (id, organizacionData) => {
  const response = await api.put(`${PREFIX}/${id}`, organizacionData);
  return response.data;
};

export const deleteOrganizacion = async (id) => {
  const response = await api.delete(`${PREFIX}/${id}`);
  return response.data;
};

export const updateOrganizacionEstado = async (id, estado) => {
  const response = await api.put(`${PREFIX}/${id}/estado?estado=${estado}`);
  return response.data;
};
