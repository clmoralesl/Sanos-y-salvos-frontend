import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Button from '../Button';
afterEach(cleanup);

describe('Button', () => {

  it('debe renderizar el texto recibido', () => {
    render(<Button>Guardar</Button>);

    expect(screen.getByText('Guardar')).toBeTruthy();
  });

  it('debe ejecutar onClick cuando se presiona', () => {
    const handleClick = vi.fn();

    render(
      <Button onClick={handleClick}>
        Guardar
      </Button>
    );

    fireEvent.click(screen.getByText('Guardar'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe quedar deshabilitado cuando disabled=true', () => {
    render(
      <Button disabled>
        Guardar
      </Button>
    );

    expect(screen.getByText('Guardar').disabled).toBe(true);
  });

});