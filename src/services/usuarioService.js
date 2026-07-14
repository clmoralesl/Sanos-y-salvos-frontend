import api from './api';

const PREFIX = '/mascotas/v1/usuarios';

export const getMe = async () => {
  const response = await api.get(`${PREFIX}/me`);
  return response.data;
};

export const updateMe = async (userData) => {
  const response = await api.put(`${PREFIX}/me`, userData);
  return response.data;
};

export const deleteMe = async () => {
  const response = await api.delete(`${PREFIX}/me`);
  return response.data;
};

export const registrarUsuario = async (userData) => {
  const response = await api.post(`${PREFIX}/registro`, userData);
  return response.data;
};

export const getUsuarios = async () => {
  const response = await api.get(PREFIX);
  return Array.isArray(response.data) ? response.data : [];
};

export const updateUsuarioMembresia = async (id, estado) => {
  const response = await api.put(`${PREFIX}/${id}/membresia?estado=${estado}`);
  return response.data;
};
