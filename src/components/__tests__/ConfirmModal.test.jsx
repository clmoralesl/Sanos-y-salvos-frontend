import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ConfirmModal from '../ConfirmModal';

afterEach(cleanup);

describe('ConfirmModal', () => {
  it('debe mostrar el mensaje recibido', () => {
    render(
      <ConfirmModal
        isOpen
        title="Eliminar"
        message="¿Desea eliminar?"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(screen.getByText('¿Desea eliminar?')).toBeDefined();
  });

  it('debe ejecutar onConfirm y onClose al confirmar', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen
        title="Eliminar"
        message="¿Desea eliminar?"
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByText('Confirmar'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar como primario si type no es danger', () => {
    render(
      <ConfirmModal
        isOpen
        title="Aceptar"
        message="¿Aceptar?"
        type="primary"
        confirmText="OK"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );

    const button = screen.getByText('OK');

    expect(button.className).toContain('bg-blue-600');
  });
});