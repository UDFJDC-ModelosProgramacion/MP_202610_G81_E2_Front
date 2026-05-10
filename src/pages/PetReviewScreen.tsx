import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* =====================================
   Tipo Review actualizado al nuevo DTO
===================================== */
type Review = {
  id: number;
  rating: number;
  comment: string;
  isSuccessStory: boolean;
  reviewDate: string;

  adopterId: number;
  adopterName: string;

  shelterId: number;
  shelterName: string;

  adoptionProcessId: number;

  petId: number;
  petName: string;
  breed?: string;
  photo?: string;
};

/* =====================================
   Grupo de mascota con reseñas
===================================== */
type PetGroup = {
  petId: number;
  petName: string;
  breed?: string;
  photo?: string;
  reviews: Review[];
  averageRating: number;
};

/* =====================================
   Config API
===================================== */
const API_BASE_URL = 
(import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api';

/* =====================================
   Página principal
===================================== */
export default function PetReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /* =====================================
     1. Obtener reseñas
  ===================================== */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_BASE_URL}/reviews`);

        if (!response.ok) {
          throw new Error("No fue posible cargar las reseñas.");
        }

        const data: Review[] = await response.json();

        setReviews(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Error inesperado."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  /* =====================================
     2. Agrupar reviews por mascota
  ===================================== */
  const pets = useMemo<PetGroup[]>(() => {
    const groups = new Map<number, Review[]>();

    reviews.forEach((review) => {
      if (!groups.has(review.petId)) {
        groups.set(review.petId, []);
      }

      groups.get(review.petId)?.push(review);
    });

    const result: PetGroup[] = [];

    groups.forEach((petReviews, petId) => {
      const first = petReviews[0];

      const total = petReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );

      const average = total / petReviews.length;

      result.push({
        petId,
        petName: first.petName,
        breed: first.breed,
        photo: first.photo,
        reviews: petReviews,
        averageRating: Number(average.toFixed(1)),
      });
    });

    return result;
  }, [reviews]);

  /* =====================================
     3. Selección automática primera mascota
  ===================================== */
  useEffect(() => {
    if (pets.length > 0 && selectedPetId === null) {
      setSelectedPetId(pets[0].petId);
    }
  }, [pets, selectedPetId]);

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.petId === selectedPetId),
    [pets, selectedPetId]
  );

  /* =====================================
     Helpers visuales
  ===================================== */
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-purple-600";
    if (rating >= 5) return "text-yellow-500";
    return "text-red-500";
  };

  /* =====================================
     Render
  ===================================== */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-white">
            Revisar Reseñas
          </h1>

          <p className="text-white/80 mt-2">
            Consulta experiencias previas de adopción.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Loading */}
        {isLoading && (
          <p className="text-gray-500">
            Cargando reseñas...
          </p>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Vacío */}
        {!isLoading && !errorMessage && pets.length === 0 && (
          <p className="text-gray-400 italic">
            No existen reseñas aún.
          </p>
        )}

        {/* Selector mascota */}
        {pets.length > 0 && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block font-semibold mb-2">
              Mascota con reseñas
            </label>

            <select
              value={selectedPetId ?? ""}
              onChange={(e) =>
                setSelectedPetId(Number(e.target.value))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              {pets.map((pet) => (
                <option
                  key={pet.petId}
                  value={pet.petId}
                >
                  {pet.petName} ({pet.reviews.length} reseñas)
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Resumen mascota */}
        {selectedPet && (
          <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  {selectedPet.photo ? (
                    <img
                      src={selectedPet.photo}
                      alt={selectedPet.petName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🐾
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {selectedPet.petName}
                  </p>

                  <p className="text-gray-500">
                    {selectedPet.breed || "Raza no especificada"}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    {selectedPet.reviews.length} reseñas
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-4xl font-bold ${getRatingColor(
                    selectedPet.averageRating
                  )}`}
                >
                  {selectedPet.averageRating}
                </p>

                <p className="text-gray-400 text-sm">
                  Promedio /10
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Lista reseñas */}
        {selectedPet && (
          <section className="space-y-4">
            {selectedPet.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg">
                      {review.adopterName}
                    </p>

                    <p className="text-sm text-gray-400">
                      {review.reviewDate}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Refugio: {review.shelterName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-3xl font-bold ${getRatingColor(
                        review.rating
                      )}`}
                    >
                      {review.rating}
                    </p>

                    <p className="text-gray-400 text-sm">
                      /10
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>

                {review.isSuccessStory && (
                  <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    Historia exitosa
                  </span>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Footer */}
        <div className="text-center pt-6">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 font-semibold"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}