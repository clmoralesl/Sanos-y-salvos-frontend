import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ConfirmModal from '../ConfirmModal';

afterEach(cleanup);

describe('ConfirmModal', () => {

  it('debe mostrar el mensaje recibido', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Eliminar"
        message="¿Desea eliminar?"
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByText('¿Desea eliminar?')).toBeDefined();
  });

  it('debe ejecutar onConfirm y onClose al confirmar', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        title="Eliminar"
        message="¿Desea eliminar?"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByText('Confirmar'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

});