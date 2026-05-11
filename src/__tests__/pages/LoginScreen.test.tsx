import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginScreen } from '../../pages/LoginScreen';
import { vi, describe, test, expect, beforeEach } from 'vitest';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('LoginScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <LoginScreen />
      </BrowserRouter>
    );
  };

  test('Renderiza correctamente los inputs', () => {
    renderComponent();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
  });

  test('Muestra errores de validación si los campos están vacíos al enviar', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /Ingresar/i });
    fireEvent.submit(screen.getByTestId("login-form"));

    expect(await screen.findByText(/El correo es obligatorio/i)).toBeInTheDocument();
    expect(await screen.findByText(/La contraseña es obligatoria/i)).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('shows validation errors for invalid email format', async () => {
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText(/Ingresa tu correo/i);
    await userEvent.setup({ delay: null }).type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /Ingresar/i });
    fireEvent.submit(screen.getByTestId("login-form"));

    expect(await screen.findByText('El formato del correo es inválido')).toBeInTheDocument();
  });

  test('shows validation errors for weak passwords', async () => {
    renderComponent();
    
    const passwordInput = screen.getByPlaceholderText(/Ingresa tu contraseña/i);
    
    // Test too short
    await userEvent.setup({ delay: null }).type(passwordInput, 'pass12');
    const submitButton = screen.getByRole('button', { name: /Ingresar/i });
    fireEvent.submit(screen.getByTestId("login-form"));
    expect(await screen.findByText('La contraseña debe tener al menos 8 caracteres y contener letras y números')).toBeInTheDocument();
  });

  test('submits to the correct API endpoint with valid credentials', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'mock-token' })
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText(/Ingresa tu correo/i);
    const passwordInput = screen.getByPlaceholderText(/Ingresa tu contraseña/i);

    await userEvent.setup({ delay: null }).type(emailInput, 'user@example.com');
    await userEvent.setup({ delay: null }).type(passwordInput, 'Password123');

    const submitButton = screen.getByRole('button', { name: /Ingresar/i });
    fireEvent.submit(screen.getByTestId("login-form"));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/login'), expect.any(Object));
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('Simula login fallido y muestra mensaje de error', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false, status: 401,
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'WrongPass123' } });

    const submitButton = screen.getByRole('button', { name: /Ingresar/i });
    fireEvent.submit(screen.getByTestId("login-form"));

    expect(await screen.findByText(/Correo o contraseña incorrectos./i)).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
  test('simula error 500 y muestra mensaje genérico', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false, status: 500,
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText(/Ingresa tu correo/i);
    const passwordInput = screen.getByPlaceholderText(/Ingresa tu contraseña/i);

    await userEvent.setup({ delay: null }).type(emailInput, 'user@example.com');
    await userEvent.setup({ delay: null }).type(passwordInput, 'Password123');

    fireEvent.submit(screen.getByTestId("login-form"));

    expect(await screen.findByText(/Error en el inicio de sesión. Intenta de nuevo./i)).toBeInTheDocument();
  });

  test('simula fallo de red', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    const emailInput = screen.getByPlaceholderText(/Ingresa tu correo/i);
    const passwordInput = screen.getByPlaceholderText(/Ingresa tu contraseña/i);

    await userEvent.setup({ delay: null }).type(emailInput, 'user@example.com');
    await userEvent.setup({ delay: null }).type(passwordInput, 'Password123');

    fireEvent.submit(screen.getByTestId("login-form"));

    expect(await screen.findByText(/Error al conectar con el servidor/i)).toBeInTheDocument();
  });

  test('navega hacia atrás al hacer clic en Volver', () => {
    renderComponent();
    const backButton = screen.getByRole('button', { name: /Volver/i });
    fireEvent.click(backButton);
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});
