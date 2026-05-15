/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AdoptionRequestStatusScreen from '../../pages/AdoptionRequestStatusScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

globalThis.fetch = vi.fn();

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

const mockRequests = [
  {
    id: 1,
    requestDate: '2026-04-18',
    status: 'PENDING',
    comments: 'Tengo espacio y experiencia cuidando perros.',
    adopterId: 1,
    petId: 1,
    petName: 'Luna',
    shelterName: 'Refugio San Roque',
  },
  {
    id: 2,
    requestDate: '2026-04-12',
    status: 'APPROVED',
    comments: 'Quiero adoptar a Max.',
    adopterId: 1,
    petId: 2,
    petName: 'Max',
    shelterName: 'Huellitas Bogotá',
  },
  {
    id: 3,
    requestDate: '2026-04-10',
    status: 'REJECTED',
    comments: 'Quiero adoptar a Nala.',
    adopterId: 1,
    petId: 3,
    petName: 'Nala',
    shelterName: 'Patitas Felices',
  },
];

describe('AdoptionRequestStatusScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockRequests,
    } as Response);
  });

  it('renders the adoption request status screen title', async () => {
    renderWithRouter(<AdoptionRequestStatusScreen />);

    expect(
      await screen.findByText(/Mis solicitudes de adopción/i)
    ).toBeInTheDocument();
  });

  it('shows the adoption requests returned by the API', async () => {
    renderWithRouter(<AdoptionRequestStatusScreen />);

    expect(await screen.findByText(/Luna/i)).toBeInTheDocument();
    expect(await screen.findByText(/Max/i)).toBeInTheDocument();
    expect(await screen.findByText(/Nala/i)).toBeInTheDocument();
  });

  it('shows the detail of a selected request', async () => {
    renderWithRouter(<AdoptionRequestStatusScreen />);

    const detailButtons = await screen.findAllByText(/Ver detalle/i);
    await userEvent.click(detailButtons[1]);

    expect(await screen.findByText(/Detalle de solicitud/i)).toBeInTheDocument();
    expect(screen.getByText(/Max/i)).toBeInTheDocument();
    expect(screen.getByText(/Aprobada/i)).toBeInTheDocument();
  });

  it('filters requests by status', async () => {
    renderWithRouter(<AdoptionRequestStatusScreen />);

    const select = await screen.findByRole('combobox');
    await userEvent.selectOptions(select, 'APPROVED');

    await waitFor(() => {
      expect(screen.getByText(/Max/i)).toBeInTheDocument();
      expect(screen.queryByText(/Luna/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Nala/i)).not.toBeInTheDocument();
    });
  });

  it('shows an empty message when the adopter has no requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    renderWithRouter(<AdoptionRequestStatusScreen />);

    expect(
      await screen.findByText(/No tienes solicitudes de adopción registradas/i)
    ).toBeInTheDocument();
  });

  it('shows an error message when the API request fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    renderWithRouter(<AdoptionRequestStatusScreen />);

    expect(
      await screen.findByText(/No fue posible cargar las solicitudes/i)
    ).toBeInTheDocument();
  });
});
