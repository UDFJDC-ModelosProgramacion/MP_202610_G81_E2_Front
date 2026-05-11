/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ManageAdoptionRequestsScreen from '../../pages/ManageAdoptionRequestsScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

globalThis.fetch = vi.fn();

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

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

  it('shows error when fetching requests fails', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Fetch failed'));
    renderWithRouter(<ManageAdoptionRequestsScreen />);
    expect(await screen.findByText(/Fetch failed/i)).toBeInTheDocument();
  });

  it('shows error when updating status fails', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRequests
    });
    fetchMock.mockRejectedValueOnce(new Error('Update failed'));

    renderWithRouter(<ManageAdoptionRequestsScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Detalle de Solicitud #001/i)).toBeInTheDocument();
    });

    await userEvent.setup({ delay: null }).click(
      screen.getByRole('button', { name: /Aprobar Solicitud/i })
    );

    expect(await screen.findByText(/Update failed/i)).toBeInTheDocument();
  });

  it('selects a different request when clicked in the sidebar', async () => {
    const multipleRequests = [
      ...mockRequests,
      { ...mockRequests[0], id: 2, adopter: { ...mockRequests[0].adopter, name: 'Juan Perez' } }
    ];
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => multipleRequests
    });

    renderWithRouter(<ManageAdoptionRequestsScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Detalle de Solicitud #001/i)).toBeInTheDocument();
    });

    // The first one is selected by default. We click the second one.
    const secondRequestArticle = screen.getAllByRole('article')[1];
    await userEvent.setup({ delay: null }).click(secondRequestArticle);

    expect(await screen.findByText(/Detalle de Solicitud #002/i)).toBeInTheDocument();
  });

  it('approves a request from the sidebar button', async () => {
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

    // The sidebar approve button
    const sidebarApproveButton = screen.getAllByRole('button', { name: /Aprobar/i })[0];
    await userEvent.setup({ delay: null }).click(sidebarApproveButton);

    expect(await screen.findByText(/Solicitud aprobada correctamente/i)).toBeInTheDocument();
  });

  it('rejects a request from the sidebar button', async () => {
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

    // The sidebar reject button
    const sidebarRejectButton = screen.getAllByRole('button', { name: /Rechazar/i })[0];
    await userEvent.setup({ delay: null }).click(sidebarRejectButton);

    expect(await screen.findByText(/Solicitud rechazada correctamente/i)).toBeInTheDocument();
  });

  it('navigates back on Volver button click', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });
    renderWithRouter(<ManageAdoptionRequestsScreen />);
    await waitFor(() => {
      expect(screen.getByText(/No hay solicitudes registradas/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /Volver/i });
    await userEvent.setup({ delay: null }).click(backButton);
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});
