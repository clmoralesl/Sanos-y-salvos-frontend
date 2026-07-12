import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Modal from '../Modal';

afterEach(cleanup);

describe('Modal', () => {

  it('no debe renderizar cuando isOpen es false', () => {
    render(
      <Modal isOpen={false} title="Prueba">
        Contenido
      </Modal>
    );

    expect(screen.queryByText('Contenido')).toBeNull();
  });

  it('debe renderizar cuando isOpen es true', () => {
    render(
      <Modal isOpen={true} title="Prueba">
        Contenido
      </Modal>
    );

    expect(screen.getByText('Contenido')).toBeDefined();
  });

  it('debe ejecutar onClose al hacer click en el fondo', () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} title="Prueba" onClose={onClose}>
        Contenido
      </Modal>
    );

    const overlay = document.querySelector('.bg-gray-900\\/50');

    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

});