import api from './api';

const PREFIX = '/geo/v1/ubicaciones';

export const registrarUbicacion = async (latitud, longitud, idComuna, direccionEspecifica) => {
  const response = await api.post(PREFIX, {
    latitud,
    longitud,
    idComuna,
    direccionEspecifica
  });
  return response.data;
};

export const getUbicacionById = async (id) => {
  const response = await api.get(`${PREFIX}/${id}`);
  return response.data;
};

export const getRegiones = async () => {
  const response = await api.get('/geo/v1/catalogos-geo/regiones');
  return Array.isArray(response.data) ? response.data : [];
};

export const getComunasPorRegion = async (idRegion) => {
  const response = await api.get(`/geo/v1/catalogos-geo/regiones/${idRegion}/comunas`);
  return Array.isArray(response.data) ? response.data : [];
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
    const data = await response.json();
    const comuna = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || 'Desconocida';
    const region = data.address?.state || 'Desconocida';
    const street = data.address?.road || '';
    const number = data.address?.house_number || '';
    const direccionEspecifica = (street && number) ? `${street} ${number}` : (street || data.display_name || 'Sin dirección específica');
    return {
      comuna,
      region,
      direccionEspecifica
    };
  } catch (err) {
    return null;
  }
};
