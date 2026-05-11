import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import ShelterScreen from '../../pages/ShelterListScreen';
import userEvent from '@testing-library/user-event';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('ShelterListScreen Component', () => {
  const mockShelters = [
    {
      id: 1,
      name: 'Refugio Esperanza',
      nit: '123456789',
      phone: '3001234567',
      email: 'contacto@esperanza.com',
      website: 'www.esperanza.com',
      city: 'Bogotá',
      address: 'Calle 123',
      locationDetails: 'Frente al parque',
      status: 'ACTIVE',
      description: 'Refugio para perritos en Bogotá',
    },
    {
      id: 2,
      name: 'Huellitas Felices',
      nit: '987654321',
      phone: '3009876543',
      email: 'hola@huellitas.com',
      website: 'www.huellitas.com',
      city: 'Medellín',
      address: 'Carrera 45',
      locationDetails: 'Cerca a la estación',
      status: 'INACTIVE',
      description: 'Cuidamos gatos y perros',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ShelterScreen />
      </BrowserRouter>
    );
  };

  test('muestra el estado de carga inicialmente', () => {
    (globalThis.fetch as any).mockImplementationOnce(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Cargando refugios...')).toBeInTheDocument();
  });

  test('renderiza la lista de refugios correctamente desde el API', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockShelters,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Cargando refugios...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Refugio Esperanza')).toBeInTheDocument();
    expect(screen.getByText('Bogotá')).toBeInTheDocument();
    
    expect(screen.getByText('Huellitas Felices')).toBeInTheDocument();
    expect(screen.getByText('Medellín')).toBeInTheDocument();

    expect(screen.getByText('Se encontraron')).toBeInTheDocument();
    expect(screen.getByText('2 shelters')).toBeInTheDocument();
  });

  test('muestra un mensaje de error si la petición falla', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Error al obtener los refugios')).toBeInTheDocument();
    });
  });

  test('muestra mensaje si hay un error de red', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('muestra mensaje cuando no hay refugios', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No se encontraron refugios registrados')).toBeInTheDocument();
    });
  });

  test('filtra refugios por nombre', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockShelters,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Refugio Esperanza')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar shelter por nombre o ciudad...');
    await userEvent.setup({ delay: null }).type(searchInput, 'huellitas');

    expect(screen.queryByText('Refugio Esperanza')).not.toBeInTheDocument();
    expect(screen.getByText('Huellitas Felices')).toBeInTheDocument();
  });

  test('filtra refugios por ciudad', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockShelters,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bogotá')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar shelter por nombre o ciudad...');
    await userEvent.setup({ delay: null }).type(searchInput, 'bogot');

    expect(screen.getByText('Refugio Esperanza')).toBeInTheDocument();
    expect(screen.queryByText('Huellitas Felices')).not.toBeInTheDocument();
  });

  test('navega al detalle del refugio al hacer clic en el botón', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockShelters[0]],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Refugio Esperanza')).toBeInTheDocument();
    });

    const detailButton = screen.getByRole('button', { name: /Ver detalle/i });
    fireEvent.click(detailButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/shelters/1');
  });
});
