import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ServiceScreen } from '../../pages/ServiceScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('ServiceScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders all functional buttons', () => {
    renderWithRouter(<ServiceScreen />);
    
    expect(screen.getByText(/Servicios Adopción/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Registrar Shelter/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Registrar Mascota/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Listar Mascotas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Solicitar Adopción/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gestionar Solicitudes de Adopción/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear Reseña de Adopción/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver Reseñas de Mascotas/i })).toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    localStorage.setItem('isAuthenticated', 'true');
    renderWithRouter(<ServiceScreen />);
    
    const logoutBtn = screen.getByRole('button', { name: /Salir/i });
    fireEvent.click(logoutBtn);
    
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });
});
