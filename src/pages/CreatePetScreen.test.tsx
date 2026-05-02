import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CreatePetScreen } from './CreatePetScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('CreatePetScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    renderWithRouter(<CreatePetScreen />);
    
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();

    // Verify all select dropdowns are present (species, size, sex, temperament = 4 comboboxes)
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(4);

    // Verify option labels are shown
    expect(screen.getByText('Especie')).toBeInTheDocument();
    expect(screen.getByText('Tamaño')).toBeInTheDocument();
    expect(screen.getByText('Sexo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Raza')).toBeInTheDocument();
    expect(screen.getByLabelText('Rescatada')).toBeInTheDocument();
    expect(screen.getByText('Temperamento')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('URL de la imagen (JPG, PNG)')).toBeInTheDocument();
    expect(screen.getByLabelText('Acepta los términos y condiciones')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Lugar de procedencia')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Edad / Fecha Nac.')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /agregar mascota al refugio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderWithRouter(<CreatePetScreen />);
    
    const submitBtn = screen.getByRole('button', { name: /agregar mascota al refugio/i });
    fireEvent.click(submitBtn);

    // Form expects mandatory fields, so it should render 'Requerido' for them
    await waitFor(() => {
      const errorMessages = screen.getAllByText('Requerido');
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    // fetch shouldn't be called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits form successfully when all mandatory fields are filled', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, status: 'IN_SHELTER' })
    });

    // Mock alert to prevent errors during test
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithRouter(<CreatePetScreen />);

    // Fill fields
    const user = userEvent.setup();
    
    await user.type(screen.getByPlaceholderText('Nombre'), 'Firulais');
    
    // Select dropdowns by document.querySelector or role if multiple
    // Let's just fire events on them since no accessible name
    fireEvent.change(document.querySelector('#species') as HTMLSelectElement, { target: { value: 'Dog' } });
    fireEvent.change(document.querySelector('#size') as HTMLSelectElement, { target: { value: 'Medium' } });
    fireEvent.change(document.querySelector('#sex') as HTMLSelectElement, { target: { value: 'Male' } });
    
    await user.type(screen.getByPlaceholderText('Raza'), 'Pug');
    
    fireEvent.change(document.querySelector('#temperament') as HTMLSelectElement, { target: { value: 'Calm' } });
    
    await user.type(screen.getByPlaceholderText('URL de la imagen (JPG, PNG)'), 'http://img.com/a.jpg');
    
    fireEvent.change(document.querySelector('#bornDate') as HTMLInputElement, { target: { value: '2023-01-01' } });
    
    const termsCheck = screen.getByLabelText('Acepta los términos y condiciones');
    await user.click(termsCheck);

    const submitBtn = screen.getByRole('button', { name: /agregar mascota al refugio/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    // Check fetch payload
    const fetchCall = (global.fetch as any).mock.calls[0];
    const fetchBody = JSON.parse(fetchCall[1].body);
    
    expect(fetchBody.name).toBe('Firulais');
    expect(fetchBody.species).toBe('Dog');
    expect(fetchBody.shelterId).toBe(1); // hardcoded in component
  });
});
