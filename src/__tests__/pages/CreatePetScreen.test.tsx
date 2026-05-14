/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CreatePetScreen } from '../../pages/CreatePetScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock fetch
globalThis.fetch = vi.fn();

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

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

    // Verify all select dropdowns are present (species, size, sex, temperament, breed = 5 comboboxes)
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(5);

    // Verify option labels are shown
    expect(screen.getByText('Especie')).toBeInTheDocument();
    expect(screen.getByText('Tamaño')).toBeInTheDocument();
    expect(screen.getByText('Sexo')).toBeInTheDocument();
      expect(screen.getByText(/Raza de la mascota/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Rescatada')).toBeInTheDocument();
    expect(screen.getByText('Temperamento')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('URL de la imagen (JPG, PNG)')).toBeInTheDocument();
    expect(screen.getByLabelText(/Acepta los términos y condiciones/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Lugar de procedencia')).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha de Nacimiento/i)).toBeInTheDocument();
    
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
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('submits form successfully when all mandatory fields are filled', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, status: 'IN_SHELTER' })
    });

    // Mock alert to prevent errors during test
    vi.spyOn(globalThis, 'alert').mockImplementation(() => {});

    renderWithRouter(<CreatePetScreen />);

    // Fill fields
    const user = userEvent.setup({ delay: null });
    
    await user.type(screen.getByPlaceholderText('Nombre'), 'Firulais');
    
    // Select dropdowns by document.querySelector or role if multiple
    // Let's just fire events on them since no accessible name
    fireEvent.change(document.querySelector('#species') as HTMLSelectElement, { target: { value: 'Dog' } });
    fireEvent.change(document.querySelector('#size') as HTMLSelectElement, { target: { value: 'Medium' } });
    fireEvent.change(document.querySelector('#sex') as HTMLSelectElement, { target: { value: 'Male' } });
    
    // Raza is a select now based on species=Dog
    fireEvent.change(document.querySelector('#breed') as HTMLSelectElement, { target: { value: 'Pug' } });
    
    fireEvent.change(document.querySelector('#temperament') as HTMLSelectElement, { target: { value: 'Calm' } });
    
    await user.type(screen.getByPlaceholderText('URL de la imagen (JPG, PNG)'), 'http://img.com/a.jpg');
    
    fireEvent.change(document.querySelector('#bornDate') as HTMLInputElement, { target: { value: '2023-01-01' } });
    
    const termsCheck = screen.getByLabelText(/Acepta los términos y condiciones/i);
    await user.click(termsCheck);

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
    
    // Check fetch payload
    const fetchCall = (globalThis.fetch as any).mock.calls[0];
    const fetchBody = JSON.parse(fetchCall[1].body);
    
    expect(fetchBody.name).toBe('Firulais');
    expect(fetchBody.species).toBe('Dog');
    expect(fetchBody.shelterId).toBe(1); // hardcoded in component
  });

  it('submits to the correct API endpoint with all required pet fields', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, status: 'IN_SHELTER' })
    });

    vi.spyOn(globalThis, 'alert').mockImplementation(() => {});

    renderWithRouter(<CreatePetScreen />);

    const user = userEvent.setup({ delay: null });
    
    // Fill all required fields
    await user.type(screen.getByPlaceholderText('Nombre'), 'Buddy');
    fireEvent.change(document.querySelector('#species') as HTMLSelectElement, { 
      target: { value: 'Dog' } 
    });
    fireEvent.change(document.querySelector('#size') as HTMLSelectElement, { 
      target: { value: 'Large' } 
    });
    fireEvent.change(document.querySelector('#sex') as HTMLSelectElement, { 
      target: { value: 'Male' } 
    });
      // Raza is a select dropdown since species is Dog
      fireEvent.change(document.querySelector('#breed') as HTMLSelectElement, { target: { value: 'Labrador Retriever' } });
    
    fireEvent.change(document.querySelector("#temperament") as HTMLSelectElement, { target: { value: "Playful" } });
      // Fill optional fields
    await user.type(screen.getByPlaceholderText('Necesidades Especiales'), 'None');
    await user.type(screen.getByPlaceholderText('Lugar de procedencia'), 'Street');
    fireEvent.change(document.querySelector('#bornDate') as HTMLInputElement, { target: { value: '2022-01-15' } });
    await user.type(screen.getByPlaceholderText('URL de la imagen (JPG, PNG)'), 'https://example.com/photo.jpg');
    
    // Check rescued checkbox
    const rescuedCheck = screen.getByLabelText('Rescatada');
    await user.click(rescuedCheck);
    
    // Check terms checkbox
    const termsCheck = screen.getByLabelText(/Acepta los términos y condiciones/i);
    await user.click(termsCheck);

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/pets',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"name":"Buddy"')
        })
      );
    });

    // Verify complete payload structure
    const fetchCall = (globalThis.fetch as any).mock.calls[0];
    const payload = JSON.parse(fetchCall[1].body);
    
    expect(payload).toHaveProperty('name', 'Buddy');
    expect(payload).toHaveProperty('species', 'Dog');
    expect(payload).toHaveProperty('breed', 'Labrador Retriever');
    expect(payload).toHaveProperty('sex', 'Male');
    expect(payload).toHaveProperty('size', 'Large');
    expect(payload).toHaveProperty('temperament', 'Playful');
    expect(payload).toHaveProperty('photo', 'https://example.com/photo.jpg');
    expect(payload).toHaveProperty('shelterId', 1);
    expect(payload).toHaveProperty('bornDate', '2022-01-15');
    expect(payload).toHaveProperty('specificNeeds', 'None');
    expect(payload).toHaveProperty('originLocation', 'Street');
    expect(payload).toHaveProperty('isRescued', true);
  });

  it('navigates back on Volver button click', async () => {
    renderWithRouter(<CreatePetScreen />);
    const backButton = screen.getByRole('button', { name: /Volver/i });
    await userEvent.setup({ delay: null }).click(backButton);
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });

  it('navigates back on Cancelar button click', async () => {
    renderWithRouter(<CreatePetScreen />);
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await userEvent.setup({ delay: null }).click(cancelButton);
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });

  it('shows generic error alert when fetch fails', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<CreatePetScreen />);

    // Fill minimum required fields
    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByPlaceholderText('Nombre'), 'Buddy');
    fireEvent.change(document.querySelector('#species') as HTMLSelectElement, { target: { value: 'Dog' } });
    fireEvent.change(document.querySelector('#size') as HTMLSelectElement, { target: { value: 'Large' } });
    fireEvent.change(document.querySelector('#sex') as HTMLSelectElement, { target: { value: 'Male' } });
    fireEvent.change(document.querySelector('#breed') as HTMLSelectElement, { target: { value: 'Labrador Retriever' } });
    fireEvent.change(document.querySelector("#temperament") as HTMLSelectElement, { target: { value: "Playful" } });
    await user.type(screen.getByPlaceholderText('URL de la imagen (JPG, PNG)'), 'https://example.com/photo.jpg');
    fireEvent.change(document.querySelector('#bornDate') as HTMLInputElement, { target: { value: '2022-01-15' } });
    
    await user.click(screen.getByLabelText(/Acepta los términos y condiciones/i));

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error al conectar con el servidor.');
    });
  });

  it('shows specific error alert when API returns non-ok status', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Bad Request' })
    });

    renderWithRouter(<CreatePetScreen />);

    // Fill minimum required fields
    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByPlaceholderText('Nombre'), 'Buddy');
    fireEvent.change(document.querySelector('#species') as HTMLSelectElement, { target: { value: 'Dog' } });
    fireEvent.change(document.querySelector('#size') as HTMLSelectElement, { target: { value: 'Large' } });
    fireEvent.change(document.querySelector('#sex') as HTMLSelectElement, { target: { value: 'Male' } });
    fireEvent.change(document.querySelector('#breed') as HTMLSelectElement, { target: { value: 'Labrador Retriever' } });
    fireEvent.change(document.querySelector("#temperament") as HTMLSelectElement, { target: { value: "Playful" } });
    await user.type(screen.getByPlaceholderText('URL de la imagen (JPG, PNG)'), 'https://example.com/photo.jpg');
    fireEvent.change(document.querySelector('#bornDate') as HTMLInputElement, { target: { value: '2022-01-15' } });
    
    await user.click(screen.getByLabelText(/Acepta los términos y condiciones/i));

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Ocurrió un error al registrar la mascota.');
    });
  });

  it('navigates to home when clicking Ir al inicio after successful creation', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, status: 'IN_SHELTER' })
    });

    renderWithRouter(<CreatePetScreen />);

    // Fill minimum required fields
    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByPlaceholderText('Nombre'), 'Buddy');
    fireEvent.change(document.querySelector('#species') as HTMLSelectElement, { target: { value: 'Dog' } });
    fireEvent.change(document.querySelector('#size') as HTMLSelectElement, { target: { value: 'Large' } });
    fireEvent.change(document.querySelector('#sex') as HTMLSelectElement, { target: { value: 'Male' } });
    fireEvent.change(document.querySelector('#breed') as HTMLSelectElement, { target: { value: 'Labrador Retriever' } });
    fireEvent.change(document.querySelector("#temperament") as HTMLSelectElement, { target: { value: "Playful" } });
    await user.type(screen.getByPlaceholderText('URL de la imagen (JPG, PNG)'), 'https://example.com/photo.jpg');
    fireEvent.change(document.querySelector('#bornDate') as HTMLInputElement, { target: { value: '2022-01-15' } });
    
    await user.click(screen.getByLabelText(/Acepta los términos y condiciones/i));

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    expect(await screen.findByText('Mascota registrada')).toBeInTheDocument();

    const homeButton = screen.getByRole('button', { name: /Ir al inicio/i });
    await userEvent.setup({ delay: null }).click(homeButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  it('resets breed and custom fields when species changes', async () => {
    renderWithRouter(<CreatePetScreen />);
    const user = userEvent.setup({ delay: null });

    // Select Other species
    const speciesSelect = document.querySelector('#species') as HTMLSelectElement;
    fireEvent.change(speciesSelect, { target: { value: 'Other' } });

    // Type custom species
    const customSpeciesInput = await screen.findByPlaceholderText('Ej. Conejo, Hurón...');
    await user.type(customSpeciesInput, 'Loro');

    // Type custom breed
    const customBreedInput = await screen.findByPlaceholderText('Especifique la raza');
    await user.type(customBreedInput, 'Guacamaya');

    // Change species back to Dog
    fireEvent.change(speciesSelect, { target: { value: 'Dog' } });

    // The custom species input should be gone
    expect(screen.queryByPlaceholderText('Ej. Conejo, Hurón...')).not.toBeInTheDocument();
    
    // Select breed "Otra" for Dog
    const breedSelect = document.querySelector('#breed') as HTMLSelectElement;
    fireEvent.change(breedSelect, { target: { value: 'Otra' } });

    // Type custom breed again
    const customBreedInput2 = await screen.findByPlaceholderText('Especifique la raza');
    await user.type(customBreedInput2, 'Mezcla');

    // Change breed to a specific one
    fireEvent.change(breedSelect, { target: { value: 'Pug' } });

    // The custom breed input should be gone
    expect(screen.queryByPlaceholderText('Especifique la raza')).not.toBeInTheDocument();
  });

  it('clears validation errors on change', async () => {
    renderWithRouter(<CreatePetScreen />);
    const user = userEvent.setup({ delay: null });

    const submitBtn = screen.getByRole('button', { name: /agregar mascota al refugio/i });
    fireEvent.click(submitBtn);

    // Should show error for name
    const errorMessages = await screen.findAllByText('Requerido');
    expect(errorMessages.length).toBeGreaterThan(0);

    const nameInput = screen.getByPlaceholderText('Nombre');
    expect(nameInput).toHaveClass('border-red-500');

    // Type in name to clear error
    await user.type(nameInput, 'Bobby');
    expect(nameInput).not.toHaveClass('border-red-500');
  });
});
