import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

let requestInterceptorCallback;
let requestInterceptorError;
let authInterceptorCallback;
let authInterceptorError;
let responseSuccessCallback;
let responseErrorCallback;

vi.mock('axios', () => {
  let requestCount = 0;

  const requestUse = vi.fn((success, error) => {
    requestCount++;

    if (requestCount === 1) {
      requestInterceptorCallback = success;
      requestInterceptorError = error;
    } else {
      authInterceptorCallback = success;
      authInterceptorError = error;
    }
  });

  const responseUse = vi.fn((success, error) => {
    responseSuccessCallback = success;
    responseErrorCallback = error;
  });

  const mockAxiosInstance = {
    interceptors: {
      request: {
        use: requestUse
      },
      response: {
        use: responseUse
      }
    },
    defaults: {
      headers: {}
    }
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance)
    }
  };
});

describe('API Interceptors', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    await import('./api');
  });

  it('debe adjuntar la cabecera de id de auth0 por defecto cuando el almacenamiento local está vacío', () => {
    const mockConfig = { headers: {} };

    const result = requestInterceptorCallback(mockConfig);

    expect(result.headers['X-Auth0-Id']).toBe('auth0|local_dummy_001');
  });

  it('debe adjuntar el id del usuario actual desde el almacenamiento local', () => {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: 'user|999'
      })
    );

    const mockConfig = { headers: {} };

    const result = requestInterceptorCallback(mockConfig);

    expect(result.headers['X-Auth0-Id']).toBe('user|999');
  });

  it('no debe sobrescribir X-Auth0-Id si la cabecera Authorization está presente', () => {
    const mockConfig = {
      headers: {
        Authorization: 'Bearer token123'
      }
    };

    const result = requestInterceptorCallback(mockConfig);

    expect(result.headers['X-Auth0-Id']).toBeUndefined();
  });

  it('setupInterceptors debe agregar el token Bearer', async () => {
    const { setupInterceptors } = await import('./api');

    setupInterceptors(async () => 'abc123');

    const config = { headers: {} };

    const result = await authInterceptorCallback(config);

    expect(result.headers.Authorization).toBe('Bearer abc123');
  });

  it('setupInterceptors debe continuar si falla la obtención del token', async () => {
    const { setupInterceptors } = await import('./api');

    setupInterceptors(async () => {
      throw new Error('sin token');
    });

    const config = { headers: {} };

    const result = await authInterceptorCallback(config);

    expect(result).toBe(config);
  });

  it('el interceptor de respuesta debe devolver la respuesta', () => {
    const response = {
      data: 'ok'
    };

    expect(responseSuccessCallback(response)).toBe(response);
  });

  it('debe disparar global-api-error cuando ocurre un error 500', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const error = {
      response: {
        status: 500
      }
    };

    await expect(
      responseErrorCallback(error)
    ).rejects.toEqual(error);

    expect(dispatchSpy).toHaveBeenCalled();

    dispatchSpy.mockRestore();
  });

  it('debe disparar global-api-error cuando no existe response', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const error = {};

    await expect(
      responseErrorCallback(error)
    ).rejects.toEqual(error);

    expect(dispatchSpy).toHaveBeenCalled();

    dispatchSpy.mockRestore();
  });

  it('debe rechazar errores del interceptor inicial de petición', async () => {
    const error = new Error('Error en petición');

    await expect(
      requestInterceptorError(error)
    ).rejects.toThrow('Error en petición');
  });

  it('debe rechazar errores del interceptor de autenticación', async () => {
    const error = new Error('Error del interceptor');

    await expect(
      authInterceptorError(error)
    ).rejects.toThrow('Error del interceptor');
  });
});