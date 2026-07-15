import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api';
import {
  getNotificaciones,
  marcarNotificacionLeida
} from '../notificacionService';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

describe('notificacionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtiene todas las notificaciones del usuario', async () => {
    const notificaciones = [
      { id: 1, mensaje: 'Nueva coincidencia', leida: false }
    ];

    api.get.mockResolvedValue({
      data: notificaciones
    });

    const resultado = await getNotificaciones(20);

    expect(api.get).toHaveBeenCalledWith(
      '/notificaciones/v1/notificaciones/usuario/20?soloNoLeidas=false'
    );

    expect(resultado).toEqual(notificaciones);
  });

  it('obtiene solamente notificaciones no leídas', async () => {
    const notificaciones = [
      { id: 2, mensaje: 'Reporte actualizado', leida: false }
    ];

    api.get.mockResolvedValue({
      data: notificaciones
    });

    const resultado = await getNotificaciones(20, true);

    expect(api.get).toHaveBeenCalledWith(
      '/notificaciones/v1/notificaciones/usuario/20?soloNoLeidas=true'
    );

    expect(resultado).toEqual(notificaciones);
  });

  it('devuelve arreglo vacío cuando la respuesta no es un arreglo', async () => {
    api.get.mockResolvedValue({
      data: null
    });

    const resultado = await getNotificaciones(20);

    expect(resultado).toEqual([]);
  });

  it('marca una notificación como leída', async () => {
    api.put.mockResolvedValue({
      data: {
        id: 9,
        leida: true
      }
    });

    const resultado = await marcarNotificacionLeida(9);

    expect(api.put).toHaveBeenCalledWith(
      '/notificaciones/v1/notificaciones/9/leer'
    );

    expect(resultado).toEqual({
      id: 9,
      leida: true
    });
  });
});
