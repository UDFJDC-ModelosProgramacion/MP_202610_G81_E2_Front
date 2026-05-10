import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PetListScreen } from '../../pages/PetListScreen';
import { vi, describe, test, expect, beforeEach } from 'vitest';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const mockPets = [
  {
    id: 1,
    name: 'Max',
    species: 'Perro',
    breed: 'Labrador',
    sex: 'Macho',
    size: 'Large',
    temperament: 'Juguetón',
    photo: '',
    shelterId: 1,
  },
  {
    id: 2,
    name: 'Luna',
    species: 'Gato',
    breed: 'Persa',
    sex: 'Hembra',
    size: 'Small',
    temperament: 'Tranquila',
    photo: '',
    shelterId: 1,
  },
];

const renderComponent = () =>
  render(
    <BrowserRouter>
      <PetListScreen />
    </BrowserRouter>
  );

describe('PetListScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  test('muestra estado de carga inicialmente', () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText(/Cargando mascotas/i)).toBeInTheDocument();
  });

  test('muestra lista de mascotas cuando la carga es exitosa', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPets,
    });
    renderComponent();
    expect(await screen.findByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Labrador')).toBeInTheDocument();
    expect(screen.getByText('Persa')).toBeInTheDocument();
  });

  test('muestra mensaje cuando no hay mascotas', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    renderComponent();
    expect(
      await screen.findByText(/No se encontraron mascotas con estos filtros/i)
    ).toBeInTheDocument();
  });

  test('muestra mensaje de error cuando la petición falla', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });
    renderComponent();
    expect(await screen.findByText(/Error fetching pets/i)).toBeInTheDocument();
  });

  test('muestra mensaje de error cuando hay fallo de red', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );
    renderComponent();
    expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
  });

  test('navega a solicitar-adopcion al hacer click en el botón', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPets,
    });
    renderComponent();
    const buttons = await screen.findAllByText(/Solicitar Adopción/i);
    fireEvent.click(buttons[0]);
    expect(mockedNavigate).toHaveBeenCalledWith('/solicitar-adopcion?petId=1');
  });

  test('llama a la API con filtros al enviar el formulario de búsqueda', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => mockPets })
      .mockResolvedValueOnce({ ok: true, json: async () => [mockPets[0]] });

    renderComponent();
    await screen.findByText('Max');

    const breedInput = screen.getByPlaceholderText(/Labrador/i);
    fireEvent.change(breedInput, { target: { value: 'Labrador' } });

    const searchButton = screen.getByRole('button', { name: /Buscar/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
      const secondCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[1][0] as string;
      expect(secondCall).toContain('breed=Labrador');
    });
  });

  test('renderiza el encabezado correctamente', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    renderComponent();
    expect(screen.getByText(/Busca a tu amigo de 4 patas/i)).toBeInTheDocument();
  });
});
