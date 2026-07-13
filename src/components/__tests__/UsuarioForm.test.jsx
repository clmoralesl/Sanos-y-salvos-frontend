import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import UsuarioForm from '../UsuarioForm';

afterEach(cleanup);

describe('UsuarioForm Component', () => {
  it('debe renderizar el formulario correctamente', () => {
    render(<UsuarioForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/Nombre Completo/i)).toBeDefined();
    expect(screen.getByText(/Email/i)).toBeDefined();
    expect(screen.getByText(/Teléfono/i)).toBeDefined();
    expect(screen.getByText(/Tipo de Cuenta/i)).toBeDefined();
  });

  it('debe permitir escribir en los campos y hacer submit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<UsuarioForm onSubmit={onSubmit} onCancel={() => {}} />);

    const nombreInput = container.querySelector('input[name="nombre"]');
    fireEvent.change(nombreInput, { target: { name: 'nombre', value: 'Juan Perez' } });

    const emailInput = container.querySelector('input[name="email"]');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'juan@test.com' } });

    const telInput = container.querySelector('input[name="telefono"]');
    fireEvent.change(telInput, { target: { name: 'telefono', value: '123456789' } });

    const btnSubmit = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(btnSubmit);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      nombre: 'Juan Perez',
      email: 'juan@test.com',
      telefono: '123456789',
      idTipoCuenta: 1
    });
  });

  it('debe llamar a onCancel al presionar el botón Cancelar', () => {
    const onCancel = vi.fn();
    render(<UsuarioForm onSubmit={() => {}} onCancel={onCancel} />);

    const btnCancel = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(btnCancel);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
