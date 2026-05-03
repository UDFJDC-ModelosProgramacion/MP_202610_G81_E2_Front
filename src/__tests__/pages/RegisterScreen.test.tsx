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
    
    await userEvent.type(nameInput, 'Juan Perez');
    await userEvent.type(emailInput, 'juan@example.com');
    await userEvent.type(passwordInput, '123456');
    await userEvent.type(confirmPasswordInput, '1234567');
    
    const submitButton = screen.getByRole('button', { name: /registrarse/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });
});
