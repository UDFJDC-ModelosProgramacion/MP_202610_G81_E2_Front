import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

// Tipos según backend
type Pet = {
  id: number;
  name: string;
  breed: string;
  status: string;
  photo?: string;
};

// Lo que realmente devuelve el backend (petId, no pet object)
type AdoptionProcessRaw = {
  id: number;
  petId?: number;
  adoptionRequestId?: number;
  status?: string;
  creationDate?: string;
};

// Tipo enriquecido con pet resuelto para la UI
type AdoptionProcess = {
  id: number;
  petId?: number;
  pet?: Pet;
  status?: string;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  isSuccessStory?: boolean;
  adopterId?: number;
  adoptionProcessId?: number;
  reviewDate?: string;
  adopterName?: string;
};

const API_BASE_URL =
  (import.meta as any).env.VITE_API_URL ?? "http://localhost:8080/api";

export default function CreateReviewScreen() {
  const navigate = useNavigate();

  // Estado para procesos de adopción (solo los confirmados/aprobados)
  const [adoptionProcesses, setAdoptionProcesses] = useState<AdoptionProcess[]>([]);
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(true);

  // Estado del formulario
  const [selectedProcessId, setSelectedProcessId] = useState<number | "">("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Estado para reseñas existentes
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // ID temporal del adoptante (hasta implementar login)
  const adopterId = 1;

  const today = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 1. Cargar procesos de adopción y resolver pets
  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        setIsLoadingProcesses(true);
        const response = await fetch(`${API_BASE_URL}/adoption-processes`);

        if (!response.ok) {
          throw new Error("Error al obtener procesos de adopción.");
        }

        const data: AdoptionProcessRaw[] = await response.json();

        // Tomar todos los procesos (o filtrar por status si hay datos)
        const filtered = data.length > 0 ? data : [];

        // Resolver los pets para cada proceso
        const enriched: AdoptionProcess[] = await Promise.all(
          filtered.map(async (proc) => {
            let pet: Pet | undefined;
            if (proc.petId) {
              try {
                const petRes = await fetch(`${API_BASE_URL}/pets/${proc.petId}`);
                if (petRes.ok) {
                  pet = await petRes.json();
                }
              } catch {
                // Pet no disponible, continuamos sin info
              }
            }
            return {
              id: proc.id,
              petId: proc.petId,
              pet,
              status: proc.status,
            };
          })
        );

        setAdoptionProcesses(enriched);

        if (enriched.length > 0) {
          setSelectedProcessId(enriched[0].id);
        }
      } catch (error) {
        console.error("Error fetching adoption processes:", error);
        setErrorMessage(
          "No pudimos cargar los procesos de adopción en este momento."
        );
      } finally {
        setIsLoadingProcesses(false);
      }
    };

    fetchProcesses();
  }, []);


  // 2. Cargar reseñas existentes
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const response = await fetch(`${API_BASE_URL}/reviews`);

        if (!response.ok) {
          throw new Error("Error al obtener reseñas.");
        }

        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  // Proceso seleccionado
  const selectedProcess = useMemo(
    () => adoptionProcesses.find((p) => p.id === selectedProcessId),
    [adoptionProcesses, selectedProcessId]
  );

  // 3. Enviar reseña
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (selectedProcessId === "" || !selectedProcess) {
      setErrorMessage(
        "Debes seleccionar un proceso de adopción para calificar."
      );
      return;
    }

    if (rating < 1 || rating > 10) {
      setErrorMessage("La calificación debe estar entre 1 y 10.");
      return;
    }

    if (!comment.trim()) {
      setErrorMessage("Debes escribir un comentario para tu reseña.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          isSuccessStory: rating >= 7,
          adopterId,
          adoptionProcessId: selectedProcess.id,
        }),
      });

      if (!response.ok) {
        throw new Error("No fue posible registrar la reseña.");
      }

      setSuccessMessage("¡Reseña publicada exitosamente!");
      setComment("");
      setRating(5);

      // Recargar reseñas
      const refreshRes = await fetch(`${API_BASE_URL}/reviews`);
      if (refreshRes.ok) {
        setReviews(await refreshRes.json());
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible registrar la reseña."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Color del rating según valor
  const getRatingColor = (value: number) => {
    if (value >= 8) return "text-green-600";
    if (value >= 5) return "text-purple-600";
    return "text-red-500";
  };

  const translateStatus = (status?: string) => {
    switch (status) {
      case "APPROVED": return "Aprobada";
      case "COMPLETED": return "Completada";
      case "CONFIRMED": return "Confirmada";
      default: return status;
    }
  };

  const renderProcessOptions = () => {
    if (isLoadingProcesses) {
      return <option value="">Cargando procesos...</option>;
    }

    if (adoptionProcesses.length === 0) {
      return <option value="">No hay procesos de adopción disponibles</option>;
    }

    return adoptionProcesses.map((process) => (
      <option key={process.id} value={process.id}>
        Proceso #{process.id}
        {process.pet ? ` – ${process.pet.name}` : ""}
        {process.status ? ` (${translateStatus(process.status)})` : ""}
      </option>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con degradado */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-white text-4xl font-bold">
            Crear Reseña de Adopción
          </h1>
          <p className="text-white/80 mt-2 text-lg">
            Comparte tu experiencia de adopción y ayuda a otros adoptantes.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Tarjeta de la Mascota Adoptada */}
        <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-[#2D3436] mb-4">
            Mascota Adoptada
          </h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {selectedProcess?.pet?.photo ? (
                <img
                  src={selectedProcess.pet.photo}
                  alt={selectedProcess.pet.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                "🐾"
              )}
            </div>
            <div>
              <p className="text-xl font-bold text-[#2D3436]">
                {isLoadingProcesses
                  ? "Cargando..."
                  : selectedProcess?.pet?.name ?? "Selecciona un proceso"}
              </p>
              <p className="text-gray-500 text-sm">
                {selectedProcess?.pet?.breed || "Raza no especificada"}
              </p>
              {selectedProcess && (
                <span className="inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                  Adopción Confirmada
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Formulario de reseña */}
        <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-[#2D3436] mb-6">Tu Reseña</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selector de proceso de adopción */}
            <div>
              <label
                htmlFor="processId"
                className="block font-semibold text-[#2D3436] mb-2"
              >
                Proceso de adopción <span className="text-red-500">*</span>
              </label>
              <select
                id="processId"
                value={selectedProcessId}
                onChange={(e) => setSelectedProcessId(Number(e.target.value))}
                disabled={isLoadingProcesses || adoptionProcesses.length === 0}
                className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {renderProcessOptions()}
              </select>
            </div>

            {/* Calificación 1-10 */}
            <div>
              <label
                htmlFor="rating"
                className="block font-semibold text-[#2D3436] mb-2"
              >
                Calificación (1-10) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="rating"
                  type="range"
                  min={1}
                  max={10}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <span
                  className={`text-3xl font-bold min-w-[3ch] text-right ${getRatingColor(
                    rating
                  )}`}
                >
                  {rating}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                <span>Malo</span>
                <span>Excelente</span>
              </div>
            </div>

            {/* Comentario */}
            <div>
              <label
                htmlFor="comment"
                className="block font-semibold text-[#2D3436] mb-2"
              >
                Comentario <span className="text-red-500">*</span>
              </label>
              <textarea
                id="comment"
                placeholder="Comparte tu experiencia con la adopción. ¿Cómo ha sido la convivencia? ¿Qué le recomendarías a otros adoptantes?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors h-32 resize-none"
              />
            </div>

            {/* Fecha automática (solo lectura) */}
            <div>
              <label
                htmlFor="reviewDate"
                className="block font-semibold text-[#2D3436] mb-2"
              >
                Fecha de la reseña
              </label>
              <input
                id="reviewDate"
                type="text"
                value={today}
                readOnly
                className="w-full px-4 py-3 bg-gray-100 border border-[#DCDDE1] rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Mensajes de feedback */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-700 font-medium">
                  {successMessage}
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </div>
            )}

            {/* Botón de enviar */}
            <button
              type="submit"
              disabled={isSubmitting || adoptionProcesses.length === 0}
              className="w-full py-4 bg-[#6C5CE7] text-white font-bold rounded-lg hover:bg-[#5a4bcf] transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? "Publicando reseña..." : "Publicar Reseña"}
            </button>
          </form>
        </section>

        {/* Lista de reseñas existentes */}
        <section>
          <h2 className="text-2xl font-bold text-[#2D3436] mb-4">
            Reseñas de Adoptantes
          </h2>

          {isLoadingReviews ? (
            <p className="text-gray-500">Cargando reseñas...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-400 italic">
              Aún no hay reseñas publicadas. ¡Sé el primero!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-[#2D3436]">
                        {review.adopterName ||
                          `Adoptante #${review.adopterId ?? "?"}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {review.reviewDate ||
                          new Date().toLocaleDateString("es-CO")}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span
                        className={`text-2xl font-bold ${getRatingColor(
                          review.rating
                        )}`}
                      >
                        {review.rating}
                      </span>
                      <span className="text-gray-400 text-sm">/10</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer de navegación */}
        <div className="text-center pb-4">
          <Link
            to="/"
            className="text-gray-500 font-semibold hover:text-[#2D3436] transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
