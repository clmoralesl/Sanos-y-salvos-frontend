import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  it('debe renderizar el texto de etiqueta correctamente', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  it('debe gatillar el callback onClick al hacer clic', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Enviar</Button>);
    fireEvent.click(screen.getByText('Enviar'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe estar deshabilitado y no gatillar onClick cuando disabled es verdadero', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled={true}>Enviar</Button>);
    const button = screen.getByText('Enviar');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
