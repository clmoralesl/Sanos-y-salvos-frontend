import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Toast from '../Toast';

afterEach(cleanup);

describe('Toast', () => {

  it('debe mostrar el mensaje recibido', () => {
    render(
      <Toast
        message="Operación exitosa"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Operación exitosa')).toBeDefined();
  });

  it('debe ejecutar onClose al hacer click en cerrar', () => {
    const onClose = vi.fn();

    render(
      <Toast
        message="Operación exitosa"
        onClose={onClose}
      />
    );

    const botones = screen.getAllByRole('button');

    fireEvent.click(botones[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

});