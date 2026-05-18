import api from './api';

const PREFIX = '/bff/v1/reportes';

export const getDetalleReporte = async (id) => {
  const response = await api.get(`${PREFIX}/${id}/detalle`);
  return response.data;
};
