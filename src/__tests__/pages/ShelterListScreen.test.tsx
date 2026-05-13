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
      shelterName: 'Refugio Esperanza',
      city: 'Bogota',
      phoneNumber: '3001234567',
      email: 'contacto@esperanza.com',
      status: 'ACTIVE',
      type: 'Centro de Rescate',
    },
    {
      id: 2,
      shelterName: 'Huellitas Felices',
      city: 'Medellin',
      phoneNumber: '3009876543',
      status: 'INACTIVE',
      type: 'Casa de Acogida',
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

  test('Carga inicial: Verificar que la API es llamada y las tarjetas de refugio se renderizan', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockShelters,
    });

    renderComponent();
    
    // verify loading state
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Cargando refugios...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    // verify API call
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/shelters'), expect.any(Object));

    // verify cards are rendered
    expect(screen.getByText('Refugio Esperanza')).toBeInTheDocument();
    expect(screen.getByText('Bogota, CO')).toBeInTheDocument();
    expect(screen.getByText('Huellitas Felices')).toBeInTheDocument();
    
    expect(screen.getByText('2 resultados encontrados')).toBeInTheDocument();
  });

  test('Búsqueda: Simular la escritura en la barra de búsqueda y el clic en Filtrar', async () => {
    // Initial fetch
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockShelters,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    // Reset fetch mock for the search action
    (globalThis.fetch as any).mockClear();
    
    // Mock the response for the filtered search
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockShelters[0]],
    });

    const searchInput = screen.getByPlaceholderText('Buscar refugio por nombre...');
    await userEvent.setup({ delay: null }).type(searchInput, 'Esperanza');
    
    const filterButton = screen.getByRole('button', { name: /^Filtrar$/i });
    fireEvent.click(filterButton);

    await waitFor(() => {
        // verify API was called with the ?name parameter
        expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/shelters?name=Esperanza'), expect.any(Object));
    });
  });

  test('Manejo de Errores: Verificar que se muestra un mensaje de error si la API falla', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Error obteniendo los refugios')).toBeInTheDocument();
    });
  });

  test('Estado Vacío: Verificar que se muestra un mensaje si la API devuelve una lista vacía', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No hay refugios existentes')).toBeInTheDocument();
    });
  });

  test('Clic en Acción: Simular el clic en el botón Ver shelter y verificar redirección', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockShelters[0]],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Refugio Esperanza')).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole('button', { name: /Ver shelter/i });
    fireEvent.click(actionButtons[0]);

    expect(mockedNavigate).toHaveBeenCalledWith('/shelters/1');
  });
  
  test('Botón de Limpiar Filtros limpia la búsqueda', async () => {
    // Initial fetch
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockShelters,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar refugio por nombre...');
    await userEvent.setup({ delay: null }).type(searchInput, 'Algo');
    
    // Reset fetch mock
    (globalThis.fetch as any).mockClear();
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockShelters,
    });
    
    const resetButton = screen.getByRole('button', { name: /Limpiar Filtros/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/shelters$/), expect.any(Object));
    });
  });
});
