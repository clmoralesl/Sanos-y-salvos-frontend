import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import GlobalErrorView from '../GlobalErrorView';

afterEach(cleanup);

describe('GlobalErrorView Component', () => {
  it('debe renderizar hijos si no hay error', () => {
    render(
      <GlobalErrorView>
        <div data-testid="child">Hijo</div>
      </GlobalErrorView>
    );
    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.queryByText('Error de Conexión')).toBeNull();
  });

  it('debe mostrar error al recibir el evento global-api-error', () => {
    render(
      <GlobalErrorView>
        <div data-testid="child">Hijo</div>
      </GlobalErrorView>
    );

    const event = new Event('global-api-error');
    act(() => {
      window.dispatchEvent(event);
    });

    expect(screen.getByText('Error de Conexión')).toBeDefined();
    expect(screen.queryByTestId('child')).toBeNull();
  });

  it('debe recargar la página al presionar reintentar', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <GlobalErrorView>
        <div data-testid="child">Hijo</div>
      </GlobalErrorView>
    );

    const event = new Event('global-api-error');
    act(() => {
      window.dispatchEvent(event);
    });

    const btn = screen.getByRole('button', { name: /Reintentar/i });
    fireEvent.click(btn);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
