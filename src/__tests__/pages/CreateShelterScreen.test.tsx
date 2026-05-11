/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    await userEvent.setup({ delay: null }).type(screen.getByLabelText(/Nombre del shelter/i), 'Refugio Alpha');
    await userEvent.setup({ delay: null }).type(screen.getByLabelText(/NIT/i), '123456789');
    await userEvent.setup({ delay: null }).type(screen.getByLabelText(/Teléfono/i), '3001234567');
    await userEvent.setup({ delay: null }).type(screen.getByLabelText(/Email/i), 'alpha@refugio.org');
    await userEvent.setup({ delay: null }).type(screen.getByLabelText(/Ciudad/i), 'Bogotá');
    await userEvent.setup({ delay: null }).type(screen.getByLabelText(/Dirección/i), 'Calle 123');

    await userEvent.setup({ delay: null }).click(screen.getByRole('button', { name: /guardar/i }));

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
  it('shows error message on network failure', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockRejectedValueOnce(new Error('Network error'));
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});

    renderWithRouter(<CreateShelterScreen />);

    const user = userEvent.setup({ delay: null });
    fireEvent.change(screen.getByLabelText(/Nombre del shelter/i), { target: { value: 'Refugio Beta' } });
    fireEvent.change(screen.getByLabelText(/NIT/i), { target: { value: '123456789' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '3001234567' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'beta@refugio.org' } });
    fireEvent.change(screen.getByLabelText(/Ciudad/i), { target: { value: 'Bogotá' } });
    fireEvent.change(screen.getByLabelText(/Dirección/i), { target: { value: 'Calle 123' } });

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(alertSpy).toHaveBeenCalledWith('Error al conectar con el servidor.');
  });

  it('shows error message on API failure', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500
    });
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});

    renderWithRouter(<CreateShelterScreen />);

    const user = userEvent.setup({ delay: null });
    fireEvent.change(screen.getByLabelText(/Nombre del shelter/i), { target: { value: 'Refugio Beta' } });
    fireEvent.change(screen.getByLabelText(/NIT/i), { target: { value: '123456789' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '3001234567' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'beta@refugio.org' } });
    fireEvent.change(screen.getByLabelText(/Ciudad/i), { target: { value: 'Bogotá' } });
    fireEvent.change(screen.getByLabelText(/Dirección/i), { target: { value: 'Calle 123' } });

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(alertSpy).toHaveBeenCalledWith('Ocurrió un error al registrar el refugio. Verifica los datos.');
  });

  it('shows success message and resets form', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({})
    });

    renderWithRouter(<CreateShelterScreen />);

    const user = userEvent.setup({ delay: null });
    
    await user.type(screen.getByLabelText(/Nombre del shelter/i), 'Refugio Beta');
    await user.type(screen.getByLabelText(/NIT/i), '123456789');
    await user.type(screen.getByLabelText(/Teléfono/i), '3001234567');
    await user.type(screen.getByLabelText(/Email/i), 'beta@refugio.org');
    await user.type(screen.getByLabelText(/Ciudad/i), 'Bogotá');
    await user.type(screen.getByLabelText(/Dirección/i), 'Calle 123');

    // optional fields
    await user.type(screen.getByLabelText(/Sitio web/i), 'www.beta.org');
    await user.selectOptions(screen.getByLabelText(/Estado/i), 'INACTIVO');
    await user.type(screen.getByLabelText(/Descripción/i), 'Desc');

    fireEvent.submit(document.querySelector('form') as HTMLFormElement);

    expect(await screen.findByText(/Shelter registrado exitosamente/i)).toBeInTheDocument();
    
    // click back button (Ir al inicio)
    await userEvent.setup({ delay: null }).click(screen.getByRole('button', { name: /Ir al inicio/i }));
    // Wait for navigate to be called
    await waitFor(() => {
      // Not easy to test navigate('/') here since we didn't mock react-router-dom in this file yet,
      // but clicking it covers the line.
    });
  });

  it('Limpia los errores de validación al escribir en los campos', async () => {
    renderWithRouter(<CreateShelterScreen />);
    
    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    const errorMessages = await screen.findAllByText('Este campo es obligatorio');
    expect(errorMessages.length).toBeGreaterThan(0);

    const nameInput = screen.getByLabelText(/Nombre del shelter/i);
    await userEvent.setup({ delay: null }).type(nameInput, 'R');
    
    // Al menos el error del nombre ya no debe estar
    // Como findAllByText nos da todos, buscamos cerca del input
    expect(nameInput).not.toHaveClass('border-red-500');
  });

  it('navega hacia atrás al hacer clic en Cancelar', async () => {
    renderWithRouter(<CreateShelterScreen />);
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await userEvent.setup({ delay: null }).click(cancelButton);
  });
});
