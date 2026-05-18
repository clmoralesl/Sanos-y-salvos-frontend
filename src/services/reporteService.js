import api from './api';

const PREFIX = '/mascotas/v1/reportes';

export const getReportes = async () => {
  const response = await api.get(PREFIX);
  return response.data;
};

export const getReporteById = async (id) => {
  const response = await api.get(`${PREFIX}/${id}`);
  return response.data;
};

export const createReporte = async (reporteData) => {
  const response = await api.post(PREFIX, reporteData);
  return response.data;
};

export const cerrarReporte = async (id) => {
  const response = await api.put(`${PREFIX}/${id}/cerrar`);
  return response.data;
};

export const updateReporte = async (id, reporteData) => {
  const response = await api.put(`${PREFIX}/${id}`, reporteData);
  return response.data;
};

export const deleteReporte = async (id) => {
  const response = await api.delete(`${PREFIX}/${id}`);
  return response.data;
};
