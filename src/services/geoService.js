import api from './api';

const PREFIX = '/geo/v1/ubicaciones';

export const registrarUbicacion = async (latitud, longitud, idComuna = 1) => {
  
  
  
  const response = await api.post(PREFIX, {
    latitud,
    longitud,
    idComuna
  });
  return response.data;
};

export const getUbicacionById = async (id) => {
  const response = await api.get(`${PREFIX}/${id}`);
  return response.data;
};



export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
    const data = await response.json();
    return {
      comuna: data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || 'Desconocida',
      region: data.address?.state || 'Desconocida'
    };
  } catch (err) {
    console.error('Error en reverse geocoding:', err);
    return null;
  }
};
