import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api';
import {
  deleteMe,
  getMe,
  getUsuarios,
  registrarUsuario,
  updateMe,
  updateUsuarioMembresia
} from '../usuarioService';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('usuarioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtiene el perfil del usuario autenticado', async () => {
    const usuario = {
      id: 1,
      nombre: 'Valeska',
      email: 'valeska@example.com'
    };

    api.get.mockResolvedValue({ data: usuario });

    const resultado = await getMe();

    expect(api.get).toHaveBeenCalledWith(
      '/mascotas/v1/usuarios/me'
    );
    expect(resultado).toEqual(usuario);
  });

  it('actualiza el perfil del usuario autenticado', async () => {
    const datos = {
      nombre: 'Valeska actualizada',
      telefono: '999999999'
    };

    api.put.mockResolvedValue({
      data: { id: 1, ...datos }
    });

    const resultado = await updateMe(datos);

    expect(api.put).toHaveBeenCalledWith(
      '/mascotas/v1/usuarios/me',
      datos
    );

    expect(resultado.nombre).toBe(
      'Valeska actualizada'
    );
  });

  it('elimina el perfil del usuario autenticado', async () => {
    api.delete.mockResolvedValue({
      data: { mensaje: 'Usuario eliminado' }
    });

    const resultado = await deleteMe();

    expect(api.delete).toHaveBeenCalledWith(
      '/mascotas/v1/usuarios/me'
    );

    expect(resultado.mensaje).toBe('Usuario eliminado');
  });

  it('registra un usuario', async () => {
    const usuario = {
      auth0Id: 'auth0|123',
      nombre: 'Valeska',
      email: 'valeska@example.com'
    };

    api.post.mockResolvedValue({
      data: { id: 5, ...usuario }
    });

    const resultado = await registrarUsuario(usuario);

    expect(api.post).toHaveBeenCalledWith(
      '/mascotas/v1/usuarios/registro',
      usuario
    );

    expect(resultado.id).toBe(5);
  });

  it('obtiene todos los usuarios', async () => {
    const usuarios = [
      { id: 1, nombre: 'Usuario uno' },
      { id: 2, nombre: 'Usuario dos' }
    ];

    api.get.mockResolvedValue({ data: usuarios });

    const resultado = await getUsuarios();

    expect(api.get).toHaveBeenCalledWith(
      '/mascotas/v1/usuarios'
    );
    expect(resultado).toEqual(usuarios);
  });

  it('devuelve arreglo vacío cuando usuarios no es un arreglo', async () => {
    api.get.mockResolvedValue({ data: null });

    const resultado = await getUsuarios();

    expect(resultado).toEqual([]);
  });

  it('actualiza la membresía de un usuario', async () => {
    api.put.mockResolvedValue({
      data: {
        id: 15,
        estadoMembresia: 'APROBADA'
      }
    });

    const resultado = await updateUsuarioMembresia(
      15,
      'APROBADA'
    );

    expect(api.put).toHaveBeenCalledWith(
      '/mascotas/v1/usuarios/15/membresia?estado=APROBADA'
    );

    expect(resultado.estadoMembresia).toBe('APROBADA');
  });
});