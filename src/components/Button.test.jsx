import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  it('should render label text correctly', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  it('should trigger onClick callback on click event', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Enviar</Button>);
    fireEvent.click(screen.getByText('Enviar'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled and not trigger onClick when disabled is true', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled={true}>Enviar</Button>);
    const button = screen.getByText('Enviar');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
