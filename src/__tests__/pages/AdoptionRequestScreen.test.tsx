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
});
