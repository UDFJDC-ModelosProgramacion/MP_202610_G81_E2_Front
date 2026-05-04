/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CreateReviewScreen from '../../pages/CreateReviewScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

globalThis.fetch = vi.fn();

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// ---------- UNIT TESTS ----------
describe('CreateReviewScreen – Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading and form fields', () => {
    // Mock both fetches: adoption-processes and reviews
    (globalThis.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // processes
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // reviews

    renderWithRouter(<CreateReviewScreen />);

    expect(screen.getByText(/Crear Reseña de Adopción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Proceso de adopción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Calificación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Comentario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha de la reseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publicar Reseña/i })).toBeInTheDocument();
  });

  it('renders the rating slider with default value 5', () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithRouter(<CreateReviewScreen />);

    const slider = screen.getByLabelText(/Calificación/i) as HTMLInputElement;
    expect(slider).toHaveAttribute('type', 'range');
    expect(slider).toHaveAttribute('min', '1');
    expect(slider).toHaveAttribute('max', '10');
    expect(slider.value).toBe('5');
  });

  it('shows "Malo" and "Excelente" labels for the rating scale', () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithRouter(<CreateReviewScreen />);

    expect(screen.getByText('Malo')).toBeInTheDocument();
    expect(screen.getByText('Excelente')).toBeInTheDocument();
  });

  it('shows error when submitting without a comment', async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, pet: { id: 1, name: 'Luna', breed: 'Labrador', status: 'ADOPTED' }, status: 'APPROVED' },
        ],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithRouter(<CreateReviewScreen />);

    // Wait for processes to load
    await waitFor(() => {
      expect(screen.queryByText(/Cargando procesos/)).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Publicar Reseña/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('Debes escribir un comentario para tu reseña.')).toBeInTheDocument();
  });

  it('shows error when no adoption process is available', async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // empty processes
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithRouter(<CreateReviewScreen />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando procesos/)).not.toBeInTheDocument();
    });

    // The submit button should be disabled
    const submitButton = screen.getByRole('button', { name: /Publicar Reseña/i });
    expect(submitButton).toBeDisabled();
  });

  it('updates the rating when the slider is changed', async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithRouter(<CreateReviewScreen />);

    const slider = screen.getByLabelText(/Calificación/i) as HTMLInputElement;

    fireEvent.change(slider, { target: { value: '9' } });

    expect(slider.value).toBe('9');
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('renders the review date as read-only', () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithRouter(<CreateReviewScreen />);

    const dateInput = screen.getByLabelText(/Fecha de la reseña/i) as HTMLInputElement;
    expect(dateInput).toHaveAttribute('readOnly');
  });

  it('renders existing reviews from the API', async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // processes
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, rating: 10, comment: 'Excelente experiencia', adopterId: 1, adopterName: 'María González' },
          { id: 2, rating: 8, comment: 'Muy buena adopción', adopterId: 2, adopterName: 'Carlos Méndez' },
        ],
      });

    renderWithRouter(<CreateReviewScreen />);

    await waitFor(() => {
      expect(screen.getByText('Excelente experiencia')).toBeInTheDocument();
      expect(screen.getByText('Muy buena adopción')).toBeInTheDocument();
    });

    expect(screen.getByText('María González')).toBeInTheDocument();
    expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
  });

  it('shows "no reviews" message when the review list is empty', async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithRouter(<CreateReviewScreen />);

    await waitFor(() => {
      expect(
        screen.getByText(/Aún no hay reseñas publicadas/i)
      ).toBeInTheDocument();
    });
  });
});

// ---------- INTEGRATION TESTS ----------
describe('CreateReviewScreen – Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a review to the API with the correct payload', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;

    // Mock GET /adoption-processes
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 5,
          pet: { id: 10, name: 'Luna', breed: 'Labrador', status: 'ADOPTED' },
          adopter: { id: 1, name: 'Leo' },
          status: 'APPROVED',
        },
      ],
    });

    // Mock GET /reviews (initial load)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // Mock POST /reviews
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, rating: 8, comment: 'Gran experiencia' }),
    });

    // Mock GET /reviews (refresh after submit)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, rating: 8, comment: 'Gran experiencia', adopterId: 1 },
      ],
    });

    renderWithRouter(<CreateReviewScreen />);

    // Wait for adoption processes to load
    await waitFor(() => {
      expect(screen.queryByText(/Cargando procesos/)).not.toBeInTheDocument();
    });

    // Change rating to 8
    const slider = screen.getByLabelText(/Calificación/i);
    fireEvent.change(slider, { target: { value: '8' } });

    // Type a comment
    const commentField = screen.getByLabelText(/Comentario/i);
    await userEvent.setup({ delay: null }).type(commentField, 'Gran experiencia');

    // Submit
    const submitButton = screen.getByRole('button', { name: /Publicar Reseña/i });
    fireEvent.click(submitButton);

    // Verify POST call
    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(
        (call) =>
          call[0].includes('/reviews') && call[1]?.method === 'POST'
      );

      expect(postCall).toBeDefined();
      expect(postCall[0]).toBe('http://localhost:8080/api/reviews');

      const requestBody = JSON.parse(postCall[1].body);
      expect(requestBody).toEqual({
        rating: 8,
        comment: 'Gran experiencia',
        isSuccessStory: true,
        adopterId: 1,
        adoptionProcessId: 5,
      });
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Reseña publicada exitosamente/i)).toBeInTheDocument();
    });
  });

  it('shows error message when the API POST fails', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;

    // Mock GET /adoption-processes
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 3, pet: { id: 7, name: 'Max', breed: 'Pug', status: 'ADOPTED' }, status: 'COMPLETED' },
      ],
    });

    // Mock GET /reviews
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [] });

    // Mock POST /reviews - failure
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    renderWithRouter(<CreateReviewScreen />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando procesos/)).not.toBeInTheDocument();
    });

    const commentField = screen.getByLabelText(/Comentario/i);
    await userEvent.setup({ delay: null }).type(commentField, 'Mi reseña');

    fireEvent.click(screen.getByRole('button', { name: /Publicar Reseña/i }));

    await waitFor(() => {
      expect(screen.getByText(/No fue posible registrar la reseña/i)).toBeInTheDocument();
    });
  });

  it('loads adoption processes from the API on mount', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;

    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/adoption-processes')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, petId: 2, status: 'APPROVED' },
            { id: 2, petId: 3, status: 'CONFIRMED' },
          ],
        });
      }
      if (url.includes('/pets/2')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 2, name: 'Firulais', breed: 'Golden', status: 'ADOPTED' }),
        });
      }
      if (url.includes('/pets/3')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 3, name: 'Michi', breed: 'Persa', status: 'ADOPTED' }),
        });
      }
      if (url.includes('/reviews')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    renderWithRouter(<CreateReviewScreen />);

    // Verify it called the adoption-processes endpoint
    await waitFor(() => {
      expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8080/api/adoption-processes');
    });

    // Verify the pet name of the first selected process is shown
    await waitFor(() => {
      expect(screen.getByText('Firulais')).toBeInTheDocument();
    });
  });
});
