/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { RegisterScreen } from '../../pages/RegisterScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

globalThis.fetch = vi.fn();

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('RegisterScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    renderWithRouter(<RegisterScreen />);
    
    expect(screen.getByLabelText('Nombre Completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    renderWithRouter(<RegisterScreen />);
    
    const submitButton = screen.getByRole('button', { name: /registrarse/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('El nombre es requerido.')).toBeInTheDocument();
    expect(await screen.findByText('El correo es requerido.')).toBeInTheDocument();
    expect(await screen.findByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument();
  });

  it('shows validation error when passwords do not match', async () => {
    renderWithRouter(<RegisterScreen />);
    
    const nameInput = screen.getByLabelText('Nombre Completo');
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');
    
    await userEvent.setup({ delay: null }).type(nameInput, 'Juan Perez');
    await userEvent.setup({ delay: null }).type(emailInput, 'juan@example.com');
    await userEvent.setup({ delay: null }).type(passwordInput, '123456');
    await userEvent.setup({ delay: null }).type(confirmPasswordInput, '1234567');
    
    const submitButton = screen.getByRole('button', { name: /registrarse/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('submits to the correct API endpoint with correct user registration payload', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Ana López', email: 'ana@example.com' })
    });

    vi.spyOn(globalThis, 'alert').mockImplementation(() => {});

    renderWithRouter(<RegisterScreen />);

    const nameInput = screen.getByLabelText('Nombre Completo');
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');

    await userEvent.setup({ delay: null }).type(nameInput, 'Ana López');
    await userEvent.setup({ delay: null }).type(emailInput, 'ana@example.com');
    await userEvent.setup({ delay: null }).type(passwordInput, 'password123');
    await userEvent.setup({ delay: null }).type(confirmPasswordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /registrarse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Ana López',
            email: 'ana@example.com',
            password: 'password123'
          })
        })
      );
    });

    // Verify complete payload structure
    const fetchCall = (globalThis.fetch as any).mock.calls[0];
    const payload = JSON.parse(fetchCall[1].body);
    
    expect(payload).toHaveProperty('name', 'Ana López');
    expect(payload).toHaveProperty('email', 'ana@example.com');
    expect(payload).toHaveProperty('password', 'password123');
    expect(payload).not.toHaveProperty('confirmPassword');
  });

  it('handles duplicate email error with 409 status', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Email already registered' })
    });

    renderWithRouter(<RegisterScreen />);

    const nameInput = screen.getByLabelText('Nombre Completo');
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');

    await userEvent.setup({ delay: null }).type(nameInput, 'Ana López');
    await userEvent.setup({ delay: null }).type(emailInput, 'existing@example.com');
    await userEvent.setup({ delay: null }).type(passwordInput, 'password123');
    await userEvent.setup({ delay: null }).type(confirmPasswordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /registrarse/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('Este correo ya se encuentra registrado.')).toBeInTheDocument();
  });

  it('handles connection errors gracefully', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithRouter(<RegisterScreen />);

    const nameInput = screen.getByLabelText('Nombre Completo');
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');

    await userEvent.setup({ delay: null }).type(nameInput, 'Ana López');
    await userEvent.setup({ delay: null }).type(emailInput, 'ana@example.com');
    await userEvent.setup({ delay: null }).type(passwordInput, 'password123');
    await userEvent.setup({ delay: null }).type(confirmPasswordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /registrarse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error de conexión:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
