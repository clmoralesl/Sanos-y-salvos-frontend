import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api', () => ({
  default: {
    get: vi.fn()
  }
}));

import api from '../api';

import {
  getRazas,
  getTamanios,
  getCaracteristicas,
  getTiposReporte,
  getEspecies
} from '../catalogoService';

describe('catalogoService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe obtener razas', async () => {
    api.get.mockResolvedValue({ data: ['Labrador'] });

    const result = await getRazas();

    expect(api.get).toHaveBeenCalledWith('/mascotas/v1/catalogos/razas');
    expect(result).toEqual(['Labrador']);
  });

  it('debe obtener tamaños', async () => {
    api.get.mockResolvedValue({ data: ['Grande'] });

    const result = await getTamanios();

    expect(api.get).toHaveBeenCalledWith('/mascotas/v1/catalogos/tamanios');
    expect(result).toEqual(['Grande']);
  });

  it('debe obtener especies', async () => {
    api.get.mockResolvedValue({ data: ['Perro'] });

    const result = await getEspecies();

    expect(api.get).toHaveBeenCalledWith('/mascotas/v1/catalogos/especies');
    expect(result).toEqual(['Perro']);
  });

});