import api from './api';

export const getNotificaciones = async (idUsuario, soloNoLeidas = false) => {
  const response = await api.get(`/notificaciones/v1/notificaciones/usuario/${idUsuario}?soloNoLeidas=${soloNoLeidas}`);
  return response.data;
};

export const marcarNotificacionLeida = async (idNotificacion) => {
  const response = await api.put(`/notificaciones/v1/notificaciones/${idNotificacion}/leer`);
  return response.data;
};
