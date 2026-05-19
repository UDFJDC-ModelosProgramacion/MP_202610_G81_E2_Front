import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PetDetailScreen } from '../../pages/PetDetailScreen';
import { vi, describe, test, expect, beforeEach } from 'vitest';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const mockPetDetail = {
  id: 1,
  name: 'Firulais',
  species: 'Perro',
  breed: 'Golden Retriever',
  bornDate: '2022-03-15',
  sex: 'Macho',
  size: 'Large',
  temperament: 'Amigable',
  specificNeeds: 'Dieta especial',
  originLocation: 'Bogotá',
  isRescued: true,
  status: 'IN_SHELTER',
  photo: 'http://example.com/firulais.jpg',
  shelterId: 10,
  shelter: {
    id: 10,
    shelterName: 'Refugio Esperanza',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    phoneNumber: '3001234567',
    nit: '900123456-1',
    description: 'Un refugio dedicado a mascotas',
  },
  medicalHistory: {
    id: 100,
    createdDate: '2023-01-01',
    lastUpdated: '2024-06-01',
    petId: 1,
    veterinarianId: 5,
    vaccineEntries: [
      { id: 1, vaccineName: 'Rabia', adminDate: '2023-02-15', nextDueDate: '2024-02-15', medicalHistoryId: 100 },
      { id: 2, vaccineName: 'Parvovirus', adminDate: '2023-03-10', nextDueDate: '2024-03-10', medicalHistoryId: 100 },
    ],
    medicalEvents: [
      { id: 1, eventType: 'Consulta', description: 'Revisión general', eventDate: '2023-04-20', medicalHistoryId: 100 },
    ],
  },
  adoptionRequestIds: [101, 102],
};

const renderWithRouter = (petId?: string) => {
  const initialEntry = petId ? `/detalle-mascota?petId=${petId}` : '/detalle-mascota';
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PetDetailScreen />
    </MemoryRouter>
  );
};

describe('PetDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  test('muestra estado de carga inicialmente', () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderWithRouter('1');
    expect(screen.getByText(/Cargando detalles de la mascota/i)).toBeInTheDocument();
  });

  test('muestra error cuando no se especifica petId', async () => {
    renderWithRouter();
    expect(await screen.findByText(/No se especificó el ID de la mascota/i)).toBeInTheDocument();
  });

  test('muestra error cuando la petición falla', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });
    renderWithRouter('1');
    expect(await screen.findByText(/Error al obtener los detalles de la mascota/i)).toBeInTheDocument();
  });

  test('muestra error de red', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );
    renderWithRouter('1');
    expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
  });

  test('muestra información básica de la mascota', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPetDetail,
    });
    renderWithRouter('1');

    expect(await screen.findByText(/Detalle de Firulais/i)).toBeInTheDocument();
    expect(screen.getByText('Golden Retriever')).toBeInTheDocument();
    expect(screen.getByText('Perro')).toBeInTheDocument();
    expect(screen.getByText('Macho')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
    expect(screen.getByText('Amigable')).toBeInTheDocument();
    expect(screen.getByText('En refugio')).toBeInTheDocument();
  });

  test('muestra información del refugio', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPetDetail,
    });
    renderWithRouter('1');

    expect(await screen.findByText('Refugio Esperanza')).toBeInTheDocument();
    expect(screen.getByText('Calle 123 #45-67')).toBeInTheDocument();
    expect(screen.getByText('3001234567')).toBeInTheDocument();
  });

  test('muestra vacunas de la historia clínica', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPetDetail,
    });
    renderWithRouter('1');

    expect(await screen.findByText('Rabia')).toBeInTheDocument();
    expect(screen.getByText('Parvovirus')).toBeInTheDocument();
    expect(screen.getByText('2023-02-15')).toBeInTheDocument();
  });

  test('muestra eventos médicos de la historia clínica', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPetDetail,
    });
    renderWithRouter('1');

    expect(await screen.findByText('Consulta')).toBeInTheDocument();
    expect(screen.getByText('Revisión general')).toBeInTheDocument();
    expect(screen.getByText('2023-04-20')).toBeInTheDocument();
  });

  test('muestra IDs de procesos de adopción', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPetDetail,
    });
    renderWithRouter('1');

    expect(await screen.findByText('Proceso #101')).toBeInTheDocument();
    expect(screen.getByText('Proceso #102')).toBeInTheDocument();
  });

  test('muestra mensaje cuando no hay vacunas', async () => {
    const petWithoutVaccines = {
      ...mockPetDetail,
      medicalHistory: {
        ...mockPetDetail.medicalHistory,
        vaccineEntries: [],
      },
    };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => petWithoutVaccines,
    });
    renderWithRouter('1');

    expect(await screen.findByText(/No hay vacunas registradas/i)).toBeInTheDocument();
  });

  test('muestra mensaje cuando no hay historia clínica', async () => {
    const petWithoutHistory = {
      ...mockPetDetail,
      medicalHistory: null,
    };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => petWithoutHistory,
    });
    renderWithRouter('1');

    expect(await screen.findByText(/No hay historia clínica registrada/i)).toBeInTheDocument();
  });

  test('muestra mensaje cuando no hay procesos de adopción', async () => {
    const petWithoutAdoptions = {
      ...mockPetDetail,
      adoptionRequestIds: [],
    };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => petWithoutAdoptions,
    });
    renderWithRouter('1');

    expect(await screen.findByText(/No hay procesos de adopción asociados/i)).toBeInTheDocument();
  });

  test('llama a la API con el ID correcto', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPetDetail,
    });
    renderWithRouter('42');

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      const callUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(callUrl).toContain('/pets/42/detail');
    });
  });

  test('muestra botón de solicitar adopción', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPetDetail,
    });
    renderWithRouter('1');

    expect(await screen.findByText(/Solicitar Adopción de Firulais/i)).toBeInTheDocument();
  });

  test('muestra datos adicionales de la mascota', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPetDetail,
    });
    renderWithRouter('1');

    expect(await screen.findByText('Dieta especial')).toBeInTheDocument();
    expect(screen.getByText('2022-03-15')).toBeInTheDocument();
    expect(screen.getByText('Sí')).toBeInTheDocument(); // isRescued = true
  });
});
