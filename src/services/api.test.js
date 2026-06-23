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

  it('should attach default auth0 id header when local storage is empty', () => {
    const mockConfig = { headers: {} };
    const result = requestInterceptorCallback(mockConfig);
    expect(result.headers['X-Auth0-Id']).toBe('auth0|local_dummy_001');
  });

  it('should attach current user id from local storage', () => {
    localStorage.setItem('currentUser', JSON.stringify({ id: 'user|999' }));
    const mockConfig = { headers: {} };
    const result = requestInterceptorCallback(mockConfig);
    expect(result.headers['X-Auth0-Id']).toBe('user|999');
  });

  it('should not overwrite X-Auth0-Id if Authorization header is present', () => {
    const mockConfig = { headers: { Authorization: 'Bearer token123' } };
    const result = requestInterceptorCallback(mockConfig);
    expect(result.headers['X-Auth0-Id']).toBeUndefined();
  });
});
