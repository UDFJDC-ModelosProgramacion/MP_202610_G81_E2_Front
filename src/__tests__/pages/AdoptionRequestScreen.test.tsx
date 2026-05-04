/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AdoptionRequestScreen from '../../pages/AdoptionRequestScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

globalThis.fetch = vi.fn();

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AdoptionRequestScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and shows loading state initially', () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<AdoptionRequestScreen />);
    
    expect(screen.getByText(/Solicitar adopción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mascota disponible/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Motivo de adopción/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar solicitud de adopción/i })).toBeInTheDocument();
  });

  it('shows error if comment is empty on submit', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Firulais', status: 'AVAILABLE' }
      ],
    });

    renderWithRouter(<AdoptionRequestScreen />);
    
    // Wait for the pet to be loaded
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Enviar solicitud de adopción/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('Debes escribir un motivo de adopción.')).toBeInTheDocument();
  });

  it('submits to the API with correct adoption request payload', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    
    // Mock GET /pets
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'Firulais', breed: 'Labrador', status: 'AVAILABLE', size: 'large' }
      ],
    });

    // Mock POST /adoption-requests
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, status: 'PENDING' }),
    });

    renderWithRouter(<AdoptionRequestScreen />);

    // Wait for pets to load
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument();
    });

    // Fill in the comment field
    const commentField = screen.getByLabelText(/Motivo de adopción/i);
    await userEvent.setup({ delay: null }).type(commentField, 'Quiero darle un hogar');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Enviar solicitud de adopción/i });
    fireEvent.click(submitButton);

    // Verify the POST request was made to the correct endpoint with the right payload
    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(call => 
        call[0].includes('/adoption-requests') && call[1]?.method === 'POST'
      );
      
      expect(postCall).toBeDefined();
      expect(postCall[0]).toBe('http://localhost:8080/api/adoption-requests');
      
      const requestBody = JSON.parse(postCall[1].body);
      expect(requestBody).toEqual({
        adopterId: 1,
        petId: 1,
        comments: 'Quiero darle un hogar',
        requestDate: expect.any(String)
      });
    });
  });
});
