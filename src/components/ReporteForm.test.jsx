import React from 'react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach
} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import ReporteForm from './ReporteForm';
import { getTiposReporte } from '../services/catalogoService';
import { getMascotas } from '../services/mascotaService';

vi.mock('../services/catalogoService', () => ({
  getTiposReporte: vi.fn()
}));

vi.mock('../services/mascotaService', () => ({
  getMascotas: vi.fn()
}));

describe('ReporteForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getTiposReporte.mockResolvedValue([
      {
        id: 1,
        descripcion: 'Mascota Perdida'
      }
    ]);

    getMascotas.mockResolvedValue([
      {
        idMascota: 10,
        nombreMascota: 'Firulais',
        nombreDueno: 'Juan'
      }
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  it('debe renderizar los campos del formulario y las opciones cargadas desde los servicios', async () => {
    render(
      <ReporteForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByText('Tipo de Reporte')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Fecha del Incidente')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Mascota')
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText('Mascota Perdida')
      ).toBeInTheDocument();

      expect(
        screen.getByText('Firulais (Dueño: Juan)')
      ).toBeInTheDocument();
    });
  });

  it('debe gatillar onSubmit con números mapeados al enviar el formulario', async () => {
    const handleSubmit = vi.fn();

    const { container } = render(
      <ReporteForm
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Mascota Perdida')
      ).toBeInTheDocument();
    });

    const selectTipo = container.querySelector(
      'select[name="idTipoReporte"]'
    );

    const selectMascota = container.querySelector(
      'select[name="idMascota"]'
    );

    const inputUbicacion = container.querySelector(
      'input[name="idUbicacionReporte"]'
    );

    fireEvent.change(selectTipo, {
      target: {
        value: '1'
      }
    });

    fireEvent.change(selectMascota, {
      target: {
        value: '10'
      }
    });

    fireEvent.change(inputUbicacion, {
      target: {
        value: '55'
      }
    });

    fireEvent.submit(
      container.querySelector('form')
    );

    expect(handleSubmit).toHaveBeenCalledTimes(1);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        idTipoReporte: 1,
        idMascota: 10,
        idUbicacionReporte: 55
      })
    );
  });

  it('debe gatillar onCancel al hacer clic en el botón de cancelación', async () => {
    const handleCancel = vi.fn();

    render(
      <ReporteForm
        onSubmit={vi.fn()}
        onCancel={handleCancel}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Mascota Perdida')
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cancelar'
      })
    );

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('debe seleccionar automáticamente el tipo cuando recibe initialData', async () => {
    const { container } = render(
      <ReporteForm
        initialData={{
          tipoReporte: 'Mascota Perdida'
        }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const selectTipo = container.querySelector(
      'select[name="idTipoReporte"]'
    );

    await waitFor(() => {
      expect(selectTipo.value).toBe('1');
    });
  });

  it('debe manejar el error al cargar los catálogos', async () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    getTiposReporte.mockRejectedValue(
      new Error('Error cargando catálogos')
    );

    render(
      <ReporteForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error al cargar catálogos para reporte'
        ),
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});