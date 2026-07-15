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
  it('debe obtener características', async () => {
    api.get.mockResolvedValue({ data: ['Vacunado'] });

    const result = await getCaracteristicas();

    expect(api.get).toHaveBeenCalledWith('/mascotas/v1/catalogos/caracteristicas');
    expect(result).toEqual(['Vacunado']);
  });

  it('debe obtener tipos de reporte', async () => {
    api.get.mockResolvedValue({ data: ['Perdido'] });

    const result = await getTiposReporte();

    expect(api.get).toHaveBeenCalledWith('/mascotas/v1/catalogos/tipos-reporte');
    expect(result).toEqual(['Perdido']);
  });

  it('debe devolver un arreglo vacío cuando razas no retorna un arreglo', async () => {
    api.get.mockResolvedValue({ data: null });

    const result = await getRazas();

    expect(result).toEqual([]);
  });

  it('debe devolver un arreglo vacío cuando tamaños no retorna un arreglo', async () => {
    api.get.mockResolvedValue({ data: {} });

    const result = await getTamanios();

    expect(result).toEqual([]);
  });

  it('debe devolver un arreglo vacío cuando características no retorna un arreglo', async () => {
    api.get.mockResolvedValue({ data: undefined });

    const result = await getCaracteristicas();

    expect(result).toEqual([]);
  });

  it('debe devolver un arreglo vacío cuando tipos de reporte no retorna un arreglo', async () => {
    api.get.mockResolvedValue({ data: 'texto' });

    const result = await getTiposReporte();

    expect(result).toEqual([]);
  });

  it('debe devolver un arreglo vacío cuando especies no retorna un arreglo', async () => {
    api.get.mockResolvedValue({ data: 123 });

    const result = await getEspecies();

    expect(result).toEqual([]);
  });


});