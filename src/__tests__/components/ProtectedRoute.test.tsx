import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when user is authenticated', () => {
    localStorage.setItem('isAuthenticated', 'true');

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Contenido Protegido</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Página de Login</div>} />
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Contenido Protegido</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});
