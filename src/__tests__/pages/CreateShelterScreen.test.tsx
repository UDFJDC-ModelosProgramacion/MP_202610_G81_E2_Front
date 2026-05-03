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
    // We expect errors for name, nit, email, city, and address (5 fields)
    expect(errorMessages.length).toBe(5);
  });
});
