import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

import api from '../api';

import {
  getReportes,
  getReporteById,
  createReporte,
  cerrarReporte,
  updateReporte,
  deleteReporte
} from '../reporteService';

describe('reporteService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe obtener todos los reportes', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1 }] });

    const result = await getReportes();

    expect(api.get).toHaveBeenCalledWith('/mascotas/v1/reportes');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('debe obtener un reporte por id', async () => {
    api.get.mockResolvedValue({ data: { id: 1 } });

    const result = await getReporteById(1);

    expect(api.get).toHaveBeenCalledWith('/mascotas/v1/reportes/1');
    expect(result).toEqual({ id: 1 });
  });

  it('debe crear un reporte', async () => {
    const payload = { idMascota: 10 };
    api.post.mockResolvedValue({ data: { id: 99 } });

    const result = await createReporte(payload);

    expect(api.post).toHaveBeenCalledWith('/mascotas/v1/reportes', payload);
    expect(result).toEqual({ id: 99 });
  });

  it('debe cerrar un reporte', async () => {
    api.put.mockResolvedValue({ data: { estado: 'CERRADO' } });

    const result = await cerrarReporte(5);

    expect(api.put).toHaveBeenCalledWith('/mascotas/v1/reportes/5/cerrar');
    expect(result).toEqual({ estado: 'CERRADO' });
  });

  it('debe actualizar un reporte', async () => {
    const payload = { descripcion: 'actualizado' };
    api.put.mockResolvedValue({ data: { id: 5, ...payload } });

    const result = await updateReporte(5, payload);

    expect(api.put).toHaveBeenCalledWith('/mascotas/v1/reportes/5', payload);
    expect(result).toEqual({ id: 5, descripcion: 'actualizado' });
  });

  it('debe eliminar un reporte', async () => {
    api.delete.mockResolvedValue({ data: { ok: true } });

    const result = await deleteReporte(5);

    expect(api.delete).toHaveBeenCalledWith('/mascotas/v1/reportes/5');
    expect(result).toEqual({ ok: true });
  });

});