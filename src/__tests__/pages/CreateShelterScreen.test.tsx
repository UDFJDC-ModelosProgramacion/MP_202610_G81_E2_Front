/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CreateShelterScreen } from '../../pages/CreateShelterScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

globalThis.fetch = vi.fn();

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('CreateShelterScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    renderWithRouter(<CreateShelterScreen />);
    
    expect(screen.getByLabelText(/Nombre del shelter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/NIT/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sitio web/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ciudad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Detalles de ubicación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    renderWithRouter(<CreateShelterScreen />);
    
    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    const errorMessages = await screen.findAllByText('Este campo es obligatorio');
    // We expect errors for name, nit, phone, email, city, and address (6 fields)
    expect(errorMessages.length).toBe(6);
  });

  it('submits to the API base url for shelters', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({})
    });

    renderWithRouter(<CreateShelterScreen />);

    await userEvent.type(screen.getByLabelText(/Nombre del shelter/i), 'Refugio Alpha');
    await userEvent.type(screen.getByLabelText(/NIT/i), '123456789');
    await userEvent.type(screen.getByLabelText(/Teléfono/i), '3001234567');
    await userEvent.type(screen.getByLabelText(/Email/i), 'alpha@refugio.org');
    await userEvent.type(screen.getByLabelText(/Ciudad/i), 'Bogotá');
    await userEvent.type(screen.getByLabelText(/Dirección/i), 'Calle 123');

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/shelters',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          shelterName: 'Refugio Alpha',
          nit: '123456789',
          phoneNumber: '3001234567',
          address: 'Calle 123',
          status: '',
          city: 'Bogotá',
          locationDetails: '',
          description: '',
          websiteUrl: ''
        })
      })
    );
  });
});
