import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api';
import {
  getComunasPorRegion,
  getRegiones,
  getUbicacionById,
  registrarUbicacion,
  reverseGeocode
} from '../geoService';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('geoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registra una ubicación y devuelve los datos', async () => {
    const ubicacion = {
      id: 10,
      latitud: -33.45,
      longitud: -70.66
    };

    api.post.mockResolvedValue({ data: ubicacion });

    const resultado = await registrarUbicacion(
      -33.45,
      -70.66,
      5,
      'Avenida Central 123'
    );

    expect(api.post).toHaveBeenCalledWith('/geo/v1/ubicaciones', {
      latitud: -33.45,
      longitud: -70.66,
      idComuna: 5,
      direccionEspecifica: 'Avenida Central 123'
    });

    expect(resultado).toEqual(ubicacion);
  });

  it('obtiene una ubicación por id', async () => {
    api.get.mockResolvedValue({
      data: { id: 7, direccionEspecifica: 'Los Aromos 45' }
    });

    const resultado = await getUbicacionById(7);

    expect(api.get).toHaveBeenCalledWith('/geo/v1/ubicaciones/7');
    expect(resultado.id).toBe(7);
  });

  it('devuelve las regiones cuando la respuesta es un arreglo', async () => {
    const regiones = [{ id: 1, nombre: 'Valparaíso' }];

    api.get.mockResolvedValue({ data: regiones });

    const resultado = await getRegiones();

    expect(api.get).toHaveBeenCalledWith(
      '/geo/v1/catalogos-geo/regiones'
    );
    expect(resultado).toEqual(regiones);
  });

  it('devuelve un arreglo vacío cuando regiones no es un arreglo', async () => {
    api.get.mockResolvedValue({ data: null });

    const resultado = await getRegiones();

    expect(resultado).toEqual([]);
  });

  it('devuelve comunas por región', async () => {
    const comunas = [{ id: 10, nombre: 'Viña del Mar' }];

    api.get.mockResolvedValue({ data: comunas });

    const resultado = await getComunasPorRegion(2);

    expect(api.get).toHaveBeenCalledWith(
      '/geo/v1/catalogos-geo/regiones/2/comunas'
    );
    expect(resultado).toEqual(comunas);
  });

  it('devuelve arreglo vacío cuando las comunas no vienen como arreglo', async () => {
    api.get.mockResolvedValue({ data: {} });

    const resultado = await getComunasPorRegion(2);

    expect(resultado).toEqual([]);
  });

  it('realiza geocodificación inversa correctamente', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        address: {
          city: 'Viña del Mar',
          state: 'Valparaíso',
          road: 'Avenida Libertad',
          house_number: '123'
        }
      })
    });

    const resultado = await reverseGeocode(-33.01, -71.55);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://nominatim.openstreetmap.org/reverse?format=json&lat=-33.01&lon=-71.55&zoom=18'
    );

    expect(resultado).toEqual({
      comuna: 'Viña del Mar',
      region: 'Valparaíso',
      direccionEspecifica: 'Avenida Libertad 123'
    });
  });

  it('utiliza valores alternativos cuando faltan datos geográficos', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        address: {
          suburb: 'Sector Norte'
        },
        display_name: 'Ubicación aproximada'
      })
    });

    const resultado = await reverseGeocode(-33, -71);

    expect(resultado).toEqual({
      comuna: 'Sector Norte',
      region: 'Desconocida',
      direccionEspecifica: 'Ubicación aproximada'
    });
  });

  it('devuelve null cuando falla la geocodificación inversa', async () => {
    global.fetch = vi.fn().mockRejectedValue(
      new Error('Error de red')
    );

    const resultado = await reverseGeocode(-33, -71);

    expect(resultado).toBeNull();
  });
  it('debe utilizar town y la calle cuando no existe ciudad ni número', async () => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue({
      address: {
        town: 'Quilpué',
        state: 'Valparaíso',
        road: 'Calle Freire'
      }
    })
  });

  const resultado = await reverseGeocode(-33.04, -71.44);

  expect(resultado).toEqual({
    comuna: 'Quilpué',
    region: 'Valparaíso',
    direccionEspecifica: 'Calle Freire'
  });
});
});