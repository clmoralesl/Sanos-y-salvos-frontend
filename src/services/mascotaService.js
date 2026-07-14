import api from './api';

const PREFIX = '/mascotas/v1/mascotas';

export const getMascotas = async () => {
  const response = await api.get(PREFIX);
  return Array.isArray(response.data) ? response.data : [];
};

export const getMisMascotas = async () => {
  const response = await api.get(`${PREFIX}/me`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getMascotaById = async (id) => {
  const response = await api.get(`${PREFIX}/${id}`);
  return response.data;
};

export const createMascota = async (mascotaData) => {
  const response = await api.post(PREFIX, mascotaData);
  return response.data;
};

export const updateMascota = async (id, mascotaData) => {
  const response = await api.put(`${PREFIX}/${id}`, mascotaData);
  return response.data;
};

export const deleteMascota = async (id) => {
  const response = await api.delete(`${PREFIX}/${id}`);
  return response.data;
};
