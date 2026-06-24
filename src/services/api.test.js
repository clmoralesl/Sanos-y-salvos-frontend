import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

let requestInterceptorCallback;

vi.mock('axios', () => {
  const useMock = vi.fn((successCb) => {
    requestInterceptorCallback = successCb;
  });
  const mockAxiosInstance = {
    interceptors: {
      request: { use: useMock },
      response: { use: vi.fn() }
    },
    defaults: { headers: {} }
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
    localStorage.setItem('currentUser', JSON.stringify({ id: 'user|999' }));
    const mockConfig = { headers: {} };
    const result = requestInterceptorCallback(mockConfig);
    expect(result.headers['X-Auth0-Id']).toBe('user|999');
  });

  it('no debe sobrescribir X-Auth0-Id si la cabecera Authorization está presente', () => {
    const mockConfig = { headers: { Authorization: 'Bearer token123' } };
    const result = requestInterceptorCallback(mockConfig);
    expect(result.headers['X-Auth0-Id']).toBeUndefined();
  });
});
