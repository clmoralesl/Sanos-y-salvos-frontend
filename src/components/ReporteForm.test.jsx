import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReporteForm from './ReporteForm';

vi.mock('../services/catalogoService', () => ({
  getTiposReporte: vi.fn(() => Promise.resolve([{ id: 1, descripcion: 'Mascota Perdida' }]))
}));

vi.mock('../services/mascotaService', () => ({
  getMascotas: vi.fn(() => Promise.resolve([{ idMascota: 10, nombreMascota: 'Firulais', nombreDueno: 'Juan' }]))
}));

describe('ReporteForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar los campos del formulario y las opciones cargadas desde los servicios', async () => {
    render(<ReporteForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('Tipo de Reporte')).toBeInTheDocument();
    expect(screen.getByText('Fecha del Incidente')).toBeInTheDocument();
    expect(screen.getByText('Mascota')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mascota Perdida')).toBeInTheDocument();
      expect(screen.getByText('Firulais (Dueño: Juan)')).toBeInTheDocument();
    });
  });

  it('debe gatillar onSubmit con números mapeados al enviar el formulario', async () => {
    const handleSubmit = vi.fn();
    const { container } = render(<ReporteForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Mascota Perdida')).toBeInTheDocument();
    });

    const selectTipo = container.querySelector('select[name="idTipoReporte"]');
    const selectMascota = container.querySelector('select[name="idMascota"]');
    const inputUbicacion = container.querySelector('input[name="idUbicacionReporte"]');

    fireEvent.change(selectTipo, { target: { value: '1' } });
    fireEvent.change(selectMascota, { target: { value: '10' } });
    fireEvent.change(inputUbicacion, { target: { value: '55' } });

    fireEvent.submit(container.querySelector('form'));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
      idTipoReporte: 1,
      idMascota: 10,
      idUbicacionReporte: 55
    }));
  });

  it('debe gatillar onCancel al hacer clic en el botón de cancelación', async () => {
    const handleCancel = vi.fn();
    render(<ReporteForm onSubmit={vi.fn()} onCancel={handleCancel} />);
    
    await waitFor(() => {
      expect(screen.getByText('Mascota Perdida')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
