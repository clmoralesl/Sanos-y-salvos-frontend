import api from './api';

const PREFIX = '/mascotas/v1/catalogos';

export const getRazas = async () => {
  const response = await api.get(`${PREFIX}/razas`);
  return response.data;
};

export const getTamanios = async () => {
  const response = await api.get(`${PREFIX}/tamanios`);
  return response.data;
};

export const getCaracteristicas = async () => {
  const response = await api.get(`${PREFIX}/caracteristicas`);
  return response.data;
};

export const getTiposReporte = async () => {
  const response = await api.get(`${PREFIX}/tipos-reporte`);
  return response.data;
};
