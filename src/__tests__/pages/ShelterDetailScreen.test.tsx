import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import ShelterDetailScreen from '../../pages/ShelterDetailScreen';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('ShelterDetailScreen Component', () => {
  const mockShelter = {
    id: 1,
    shelterName: 'Refugio Patitas Felices',
    nit: '123456789-0',
    phoneNumber: '3001234567',
    address: 'Calle Falsa 123',
    city: 'Bogota',
    description: 'Un lugar feliz para perritos.',
    websiteUrl: 'https://patitasfelices.org',
    mediaItems: [],
  };

  const mockPets = [
    {
      id: 101,
      name: 'Firulais',
      breed: 'Mestizo',
      sex: 'Macho',
      size: 'Mediano',
      photo: '',
    },
    {
      id: 102,
      name: 'Luna',
      breed: 'Labrador',
      sex: 'Hembra',
      size: 'Grande',
      photo: '',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  const renderComponent = (id = '1') => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/shelters/:id" element={<ShelterDetailScreen />} />
        </Routes>
      </BrowserRouter>
    );
  };

  test('Muestra el estado de carga y renderiza información del refugio y mascotas', async () => {
    // Mock the Promise.all fetch calls
    (globalThis.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/shelters/1')) {
            return Promise.resolve({
                ok: true,
                json: async () => mockShelter,
            });
        }
        if (url.includes('/pets?shelterId=1')) {
            return Promise.resolve({
                ok: true,
                json: async () => mockPets,
            });
        }
        return Promise.reject(new Error('not found'));
    });

    // We have to push the route to match /shelters/1
    window.history.pushState({}, 'Test page', '/shelters/1');
    renderComponent();

    // Verify loading state
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Cargando detalles...')).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    // Verify Shelter Info
    expect(screen.getByText('Refugio Patitas Felices')).toBeInTheDocument();
    expect(screen.getByText('123456789-0')).toBeInTheDocument();
    expect(screen.getByText('3001234567')).toBeInTheDocument();
    expect(screen.getByText('Calle Falsa 123, Bogota')).toBeInTheDocument();
    expect(screen.getByText('Un lugar feliz para perritos.')).toBeInTheDocument();
    expect(screen.getByText('https://patitasfelices.org')).toBeInTheDocument();

    // Verify Pets Info
    expect(screen.getByText('Firulais')).toBeInTheDocument();
    expect(screen.getByText('Mestizo')).toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Labrador')).toBeInTheDocument();

    // Verify Buttons exist
    expect(screen.getByRole('button', { name: /Conocer a Firulais/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agendar Cita/i })).toBeInTheDocument();
  });

  test('El botón Agendar Cita navega correctamente', async () => {
    (globalThis.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/shelters/1')) {
            return Promise.resolve({ ok: true, json: async () => mockShelter });
        }
        if (url.includes('/pets?shelterId=1')) {
            return Promise.resolve({ ok: true, json: async () => mockPets });
        }
    });

    window.history.pushState({}, 'Test page', '/shelters/1');
    renderComponent();

    await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    const agendarBtn = screen.getByRole('button', { name: /Agendar Cita/i });
    fireEvent.click(agendarBtn);

    expect(mockedNavigate).toHaveBeenCalledWith('/agendar-cita/1');
  });

  test('El botón Conocer a [mascota] navega correctamente', async () => {
    (globalThis.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/shelters/1')) {
            return Promise.resolve({ ok: true, json: async () => mockShelter });
        }
        if (url.includes('/pets?shelterId=1')) {
            return Promise.resolve({ ok: true, json: async () => mockPets });
        }
    });

    window.history.pushState({}, 'Test page', '/shelters/1');
    renderComponent();

    await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    const conocerBtn = screen.getByRole('button', { name: /Conocer a Firulais/i });
    fireEvent.click(conocerBtn);

    expect(mockedNavigate).toHaveBeenCalledWith('/solicitar-adopcion?petId=101');
  });

  test('Muestra un mensaje cuando el refugio no tiene mascotas', async () => {
    (globalThis.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/shelters/1')) {
            return Promise.resolve({ ok: true, json: async () => mockShelter });
        }
        if (url.includes('/pets?shelterId=1')) {
            return Promise.resolve({ ok: true, json: async () => [] }); // No pets
        }
    });

    window.history.pushState({}, 'Test page', '/shelters/1');
    renderComponent();

    await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No hay mascotas publicadas')).toBeInTheDocument();
  });

  test('Maneja error si falla la petición del refugio', async () => {
    (globalThis.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/shelters/1')) {
            return Promise.resolve({ ok: false, status: 404 });
        }
        if (url.includes('/pets?shelterId=1')) {
            return Promise.resolve({ ok: true, json: async () => [] });
        }
    });

    window.history.pushState({}, 'Test page', '/shelters/1');
    renderComponent();

    await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Error obteniendo la información del refugio')).toBeInTheDocument();
  });
});
