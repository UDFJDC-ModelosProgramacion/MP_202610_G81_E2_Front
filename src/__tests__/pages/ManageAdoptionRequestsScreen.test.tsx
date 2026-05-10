/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ManageAdoptionRequestsScreen from '../../pages/ManageAdoptionRequestsScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

globalThis.fetch = vi.fn();

const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>);

const mockRequests = [
  {
    id: 1,
    requestDate: '2026-04-15',
    status: 'PENDING',
    comments: 'Tengo espacio y experiencia cuidando perros.',
    adopterId: 1,
    petId: 1,
    adopter: {
      id: 1,
      name: 'María González',
      email: 'maria@email.com'
    },
    pet: {
      id: 1,
      name: 'Luna',
      breed: 'Golden Retriever'
    }
  }
];

describe('ManageAdoptionRequestsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders adoption request list and detail', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRequests
    });

    renderWithRouter(<ManageAdoptionRequestsScreen />);

    expect(screen.getAllByText(/Solicitudes de Adopción/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText(/Detalle de Solicitud #001/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/María González/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Luna/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Tengo espacio y experiencia cuidando perros/i)).toBeInTheDocument();
  });

  it('approves a pending adoption request', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRequests
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockRequests[0], status: 'APPROVED' })
    });

    renderWithRouter(<ManageAdoptionRequestsScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Detalle de Solicitud #001/i)).toBeInTheDocument();
    });

    await userEvent.setup({ delay: null }).click(
      screen.getByRole('button', { name: /Aprobar Solicitud/i })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/adoption-requests/1',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('APPROVED')
        })
      );
    });

    expect(await screen.findByText(/Solicitud aprobada correctamente/i)).toBeInTheDocument();
  });

  it('rejects a pending adoption request', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRequests
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockRequests[0], status: 'REJECTED' })
    });

    renderWithRouter(<ManageAdoptionRequestsScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Detalle de Solicitud #001/i)).toBeInTheDocument();
    });

    await userEvent.setup({ delay: null }).click(
      screen.getByRole('button', { name: /Rechazar Solicitud/i })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/adoption-requests/1',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('REJECTED')
        })
      );
    });

    expect(await screen.findByText(/Solicitud rechazada correctamente/i)).toBeInTheDocument();
  });
});
