/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PetReviewScreen from '../../pages/PetReviewScreen';
import { vi, describe, it, expect, beforeEach } from 'vitest';

globalThis.fetch = vi.fn();

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('PetReviewScreen - Unit & Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Return a never-resolving promise to keep it in loading state
    (globalThis.fetch as any).mockReturnValue(new Promise(() => {}));

    renderWithRouter(<PetReviewScreen />);

    expect(screen.getByText('Cargando reseñas...')).toBeInTheDocument();
  });

  it('shows empty state when no reviews are returned', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<PetReviewScreen />);

    await waitFor(() => {
      expect(screen.getByText('No existen reseñas aún.')).toBeInTheDocument();
    });
  });

  it('shows error message when the API fetch fails', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    renderWithRouter(<PetReviewScreen />);

    await waitFor(() => {
      expect(screen.getByText('No fue posible cargar las reseñas.')).toBeInTheDocument();
    });
  });

  it('renders reviews grouped by pet and selects the first pet automatically', async () => {
    const mockReviews = [
      {
        id: 1,
        rating: 10,
        comment: 'Un perrito muy lindo',
        isSuccessStory: true,
        reviewDate: '2026-05-10',
        adopterId: 1,
        adopterName: 'Leo',
        shelterId: 1,
        shelterName: 'Refugio Feliz',
        adoptionProcessId: 1,
        petId: 1,
        petName: 'Boby',
        breed: 'Labrador',
      },
      {
        id: 2,
        rating: 8,
        comment: 'Gato juguetón',
        isSuccessStory: true,
        reviewDate: '2026-05-09',
        adopterId: 2,
        adopterName: 'Ana',
        shelterId: 1,
        shelterName: 'Refugio Feliz',
        adoptionProcessId: 2,
        petId: 2,
        petName: 'Michi',
        breed: 'Persa',
      }
    ];

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReviews,
    });

    renderWithRouter(<PetReviewScreen />);

    await waitFor(() => {
      // It should display the selected pet's name
      expect(screen.getByText('Boby')).toBeInTheDocument();
      // It should display the selected pet's breed
      expect(screen.getByText('Labrador')).toBeInTheDocument();
      // It should display the review comment
      expect(screen.getByText('Un perrito muy lindo')).toBeInTheDocument();
    });

    // Check if the select dropdown has both pets
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Boby (1 reseñas)')).toBeInTheDocument();
    expect(screen.getByText('Michi (1 reseñas)')).toBeInTheDocument();
  });

  it('changes displayed reviews when a different pet is selected', async () => {
    const mockReviews = [
      {
        id: 1,
        rating: 10,
        comment: 'Un perrito muy lindo',
        isSuccessStory: true,
        reviewDate: '2026-05-10',
        adopterId: 1,
        adopterName: 'Leo',
        shelterId: 1,
        shelterName: 'Refugio Feliz',
        adoptionProcessId: 1,
        petId: 1,
        petName: 'Boby',
        breed: 'Labrador',
      },
      {
        id: 2,
        rating: 8,
        comment: 'Gato juguetón',
        isSuccessStory: true,
        reviewDate: '2026-05-09',
        adopterId: 2,
        adopterName: 'Ana',
        shelterId: 1,
        shelterName: 'Refugio Feliz',
        adoptionProcessId: 2,
        petId: 2,
        petName: 'Michi',
        breed: 'Persa',
      }
    ];

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReviews,
    });

    renderWithRouter(<PetReviewScreen />);

    await waitFor(() => {
      expect(screen.getByText('Boby')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });

    await waitFor(() => {
      // Now it should show Michi and its review
      expect(screen.getByText('Michi')).toBeInTheDocument();
      expect(screen.getByText('Gato juguetón')).toBeInTheDocument();
    });
  });
});
