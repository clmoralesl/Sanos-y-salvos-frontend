import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api';
import {
  createMascota,
  deleteMascota,
  getMascotaById,
  getMascotas,
  getMisMascotas,
  updateMascota
} from '../mascotaService';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('mascotaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtiene todas las mascotas', async () => {
    const mascotas = [
      { id: 1, nombreMascota: 'Luna' },
      { id: 2, nombreMascota: 'Max' }
    ];

    api.get.mockResolvedValue({ data: mascotas });

    const resultado = await getMascotas();

    expect(api.get).toHaveBeenCalledWith(
      '/mascotas/v1/mascotas'
    );
    expect(resultado).toEqual(mascotas);
  });

  it('devuelve arreglo vacío si la respuesta de mascotas no es un arreglo', async () => {
    api.get.mockResolvedValue({ data: null });

    const resultado = await getMascotas();

    expect(resultado).toEqual([]);
  });

  it('obtiene las mascotas del usuario autenticado', async () => {
    const mascotas = [{ id: 3, nombreMascota: 'Milo' }];

    api.get.mockResolvedValue({ data: mascotas });

    const resultado = await getMisMascotas();

    expect(api.get).toHaveBeenCalledWith(
      '/mascotas/v1/mascotas/me'
    );
    expect(resultado).toEqual(mascotas);
  });

  it('devuelve arreglo vacío si mis mascotas no es un arreglo', async () => {
    api.get.mockResolvedValue({ data: {} });

    const resultado = await getMisMascotas();

    expect(resultado).toEqual([]);
  });

  it('obtiene una mascota por id', async () => {
    const mascota = { id: 8, nombreMascota: 'Nina' };

    api.get.mockResolvedValue({ data: mascota });

    const resultado = await getMascotaById(8);

    expect(api.get).toHaveBeenCalledWith(
      '/mascotas/v1/mascotas/8'
    );
    expect(resultado).toEqual(mascota);
  });

  it('crea una mascota', async () => {
    const nuevaMascota = {
      nombreMascota: 'Rocky',
      idRaza: 4
    };

    api.post.mockResolvedValue({
      data: { id: 20, ...nuevaMascota }
    });

    const resultado = await createMascota(nuevaMascota);

    expect(api.post).toHaveBeenCalledWith(
      '/mascotas/v1/mascotas',
      nuevaMascota
    );

    expect(resultado.id).toBe(20);
  });

  it('actualiza una mascota', async () => {
    const datosActualizados = {
      nombreMascota: 'Rocky actualizado'
    };

    api.put.mockResolvedValue({
      data: { id: 20, ...datosActualizados }
    });

    const resultado = await updateMascota(
      20,
      datosActualizados
    );

    expect(api.put).toHaveBeenCalledWith(
      '/mascotas/v1/mascotas/20',
      datosActualizados
    );

    expect(resultado.nombreMascota).toBe(
      'Rocky actualizado'
    );
  });

  it('elimina una mascota', async () => {
    api.delete.mockResolvedValue({
      data: { mensaje: 'Mascota eliminada' }
    });

    const resultado = await deleteMascota(20);

    expect(api.delete).toHaveBeenCalledWith(
      '/mascotas/v1/mascotas/20'
    );

    expect(resultado).toEqual({
      mensaje: 'Mascota eliminada'
    });
  });
});