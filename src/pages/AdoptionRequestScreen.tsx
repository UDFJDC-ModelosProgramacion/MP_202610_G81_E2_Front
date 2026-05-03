import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

// Definimos la estructura de la Mascota según lo que esperamos del backend
type Pet = {
  id: number;
  name: string;
  breed: string;
  age?: string; // Opcional por si tu backend usa bornDate en su lugar
  bornDate?: string;
  size: string;
  shelter?: string; // Opcional dependiendo de cómo te devuelva el backend la relación
  status: string;
};

type AdoptionRequestPayload = {
  adopterId: number;
  petId: number;
  comment: string;
};

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export default function AdoptionRequestScreen() {
  const navigate = useNavigate();

  // Estados para manejar las mascotas que vienen del backend
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);

  // Estados del formulario
  const [selectedPetId, setSelectedPetId] = useState<number | "">("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ID temporal (Hasta que implementes el Login)
  const adopterId = 1;

  // 1. EFECTO PARA TRAER LAS MASCOTAS DEL BACKEND (GET)
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setIsLoadingPets(true);
        const response = await fetch(`${API_BASE_URL}/pets`);
        
        if (!response.ok) {
          throw new Error("Error al obtener la lista de mascotas.");
        }

        const data = await response.json();
        
        // Filtramos para mostrar solo las que están disponibles o en refugio
        const availablePets = data.filter(
          (pet: Pet) => pet.status === "AVAILABLE" || pet.status === "IN_SHELTER"
        );
        
        setPets(availablePets);

        // Si hay mascotas disponibles, seleccionamos la primera por defecto
        if (availablePets.length > 0) {
          setSelectedPetId(availablePets[0].id);
        }
      } catch (error) {
        console.error("Error fetching pets:", error);
        setErrorMessage("No pudimos cargar la lista de mascotas disponibles en este momento.");
      } finally {
        setIsLoadingPets(false);
      }
    };

    fetchPets();
  }, []);

  // Memorizamos la mascota seleccionada para mostrar su info en la tarjeta
  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId),
    [pets, selectedPetId]
  );

  const today = new Date().toLocaleDateString("es-CO");

  // 2. FUNCIÓN PARA ENVIAR LA SOLICITUD AL BACKEND (POST)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!selectedPet || selectedPetId === "") {
      setErrorMessage("Debes seleccionar una mascota antes de enviar la solicitud.");
      return;
    }

    if (!comment.trim()) {
      setErrorMessage("Debes escribir un motivo de adopción.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/adoption-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adopterId,
          petId: selectedPet.id,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("No fue posible registrar la solicitud de adopción.");
      }

      setSuccessMessage("Solicitud registrada correctamente.");
      setComment("");
      
      
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible registrar la solicitud de adopción."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPetOptions = () => {
    if (isLoadingPets) {
      return <option value="">Cargando mascotas...</option>;
    }

    if (pets.length === 0) {
      return <option value="">No hay mascotas disponibles</option>;
    }

    return pets.map((pet) => (
      <option key={pet.id} value={pet.id}>
        {pet.name} - {pet.breed || "Raza desconocida"}
      </option>
    ));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
      <section className="bg-white rounded-2xl shadow-lg w-full max-w-5xl overflow-hidden">
        
        {/* Header con degradado */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 py-8 px-8 text-white">
          <h1 className="text-3xl font-bold">Solicitar adopción</h1>
          <p className="mt-2 text-white/90 text-lg">Completa el formulario para iniciar el proceso de adopción y darle un hogar a un nuevo amigo.</p>
        </div>

        {/* Contenido dividido en 2 columnas en PC, 1 columna en móviles */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Columna Izquierda: Vista previa de la Mascota */}
          <aside className="lg:col-span-2 bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col items-center">
            <div className="w-48 h-48 bg-[#DCDDE1] rounded-full flex items-center justify-center text-gray-500 mb-6 shadow-inner text-sm font-medium">
              Imagen de la mascota
            </div>

            <h2 className="text-3xl font-bold text-[#2D3436] mb-6">
              {isLoadingPets ? "Cargando..." : selectedPet?.name ?? "Selecciona una mascota"}
            </h2>

            <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <p className="flex justify-between border-b border-gray-50 pb-2">
                <strong className="text-[#2D3436]">Raza:</strong> 
                <span className="text-gray-600">{selectedPet?.breed || "-"}</span>
              </p>
              <p className="flex justify-between border-b border-gray-50 pb-2">
                <strong className="text-[#2D3436]">Edad / Nac.:</strong> 
                {/* Mostramos age o bornDate dependiendo de cómo lo llame tu backend */}
                <span className="text-gray-600">{selectedPet?.age || selectedPet?.bornDate || "-"}</span>
              </p>
              <p className="flex justify-between border-b border-gray-50 pb-2">
                <strong className="text-[#2D3436]">Tamaño:</strong> 
                <span className="text-gray-600">{selectedPet?.size || "-"}</span>
              </p>
              <p className="flex justify-between border-b border-gray-50 pb-2">
                <strong className="text-[#2D3436]">Refugio:</strong> 
                <span className="text-gray-600 text-right">{selectedPet?.shelter || "No especificado"}</span>
              </p>
              <p className="flex justify-between pt-1">
                <strong className="text-[#2D3436]">Estado:</strong> 
                {selectedPet ? (
                  <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">Disponible</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </p>
            </div>
          </aside>

          {/* Columna Derecha: Formulario */}
          <form className="lg:col-span-3 flex flex-col gap-6" onSubmit={handleSubmit}>
            
            {/* Campos del formulario */}
            <div>
              <label htmlFor="petId" className="block font-semibold text-[#2D3436] mb-2">
                Mascota disponible
              </label>
              <select
                id="petId"
                value={selectedPetId}
                onChange={(event) => setSelectedPetId(Number(event.target.value))}
                disabled={isLoadingPets || pets.length === 0}
                className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed">
                {renderPetOptions()}
              </select>
            </div>

            <div>
              <label htmlFor="requestDate" className="block font-semibold text-[#2D3436] mb-2">
                Fecha de solicitud
              </label>
              <input 
                id="requestDate" 
                type="text" 
                value={today} 
                readOnly 
                className="w-full px-4 py-3 bg-gray-100 border border-[#DCDDE1] rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="comment" className="block font-semibold text-[#2D3436] mb-2">
                Motivo de adopción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="comment"
                placeholder="Escribe por qué deseas adoptar a esta mascota. Habla de tu experiencia, tu hogar y tu tiempo..."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors h-32 resize-none"
              />
            </div>

            {/* Mensajes de feedback */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-green-700 font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  {successMessage}
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/adoptions/status")}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  Ver mis solicitudes
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium flex items-center gap-2">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                 {errorMessage}
              </div>
            )}

            {/* Botones */}
            <div className="mt-2 flex flex-col gap-4">
              <button 
                type="submit" 
                disabled={isSubmitting || pets.length === 0}
                className="w-full py-4 bg-[#6C5CE7] text-white font-bold rounded-lg hover:bg-[#5a4bcf] transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? "Enviando solicitud..." : "Enviar solicitud de adopción"}
              </button>

              <div className="text-center mt-2">
                <Link to="/" className="text-gray-500 font-semibold hover:text-[#2D3436] transition-colors">
                  ← Volver al inicio
                </Link>
              </div>
            </div>

          </form>
        </div>
      </section>
    </main>
  );
}