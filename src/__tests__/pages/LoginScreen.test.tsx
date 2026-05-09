import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    fireEvent.click(submitButton);

    expect(await screen.findByText(/El correo es obligatorio/i)).toBeInTheDocument();
    expect(await screen.findByText(/La contraseña es obligatoria/i)).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('Simula login exitoso y redirecciona a /home', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-token' })
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Ingresar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/login'), expect.any(Object));
      expect(mockedNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('Simula login fallido y muestra mensaje de error', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'wrongpass' } });

    const submitButton = screen.getByRole('button', { name: /Ingresar/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Credenciales inválidas/i)).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
});
