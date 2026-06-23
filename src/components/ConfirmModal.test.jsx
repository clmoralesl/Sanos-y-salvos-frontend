import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal Component', () => {
  it('should not render anything when isOpen is false', () => {
    const { container } = render(
      <ConfirmModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Confirmar eliminación"
        message="¿Estás seguro?"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render title, message and buttons when isOpen is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Confirmar eliminación"
        message="¿Estás seguro?"
      />
    );
    expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
  });

  it('should call onConfirm and onClose when confirm button is clicked', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Eliminar"
        message="¿Seguro?"
        confirmText="Eliminar"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Eliminar"
        message="¿Seguro?"
        confirmText="Eliminar"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });
});
