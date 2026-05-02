import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import "./AdoptionRequestScreen.css";

type Pet = {
  id: number;
  name: string;
  breed: string;
  age: string;
  size: string;
  shelter: string;
  status: "AVAILABLE" | "IN_SHELTER";
};

type AdoptionRequestPayload = {
  adopterId: number;
  petId: number;
  comment: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

const samplePets: Pet[] = [
  {
    id: 1,
    name: "Luna",
    breed: "Mestiza",
    age: "2 años",
    size: "Mediana",
    shelter: "Refugio San Roque",
    status: "AVAILABLE",
  },
  {
    id: 2,
    name: "Max",
    breed: "Labrador",
    age: "3 años",
    size: "Grande",
    shelter: "Huellitas Bogotá",
    status: "AVAILABLE",
  },
  {
    id: 3,
    name: "Nala",
    breed: "Criolla",
    age: "1 año",
    size: "Pequeña",
    shelter: "Patitas Felices",
    status: "IN_SHELTER",
  },
];

async function createAdoptionRequest(payload: AdoptionRequestPayload) {
  const response = await fetch(`${API_BASE_URL}/adoption-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No fue posible registrar la solicitud de adopción.");
  }

  return response.json();
}

export default function AdoptionRequestScreen() {
  const navigate = useNavigate();

  const [selectedPetId, setSelectedPetId] = useState<number>(samplePets[0].id);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /*
    Temporal para pruebas. Falta seguir la parte del login y que el ID salga autenticado
  */
  const adopterId = 1;

  const selectedPet = useMemo(
    () => samplePets.find((pet) => pet.id === selectedPetId),
    [selectedPetId]
  );

  const today = new Date().toLocaleDateString("es-CO");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!selectedPet) {
      setErrorMessage("Debes seleccionar una mascota antes de enviar la solicitud.");
      return;
    }

    if (!comment.trim()) {
      setErrorMessage("Debes escribir un motivo de adopción.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createAdoptionRequest({
        adopterId,
        petId: selectedPet.id,
        comment: comment.trim(),
      });

      setSuccessMessage("Solicitud registrada correctamente.");
      setComment("");

      // navigate("/adoptions/status");---Para organizar luego la HU12 en la semana que toque.
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

  return (
    <main className="adoption-page">
      <section className="adoption-card">
        <div className="adoption-header">
          <h1>Solicitar adopción</h1>
          <p>Completa el formulario para iniciar el proceso de adopción.</p>
        </div>

        <div className="adoption-content">
          <aside className="pet-preview">
            <div className="pet-image">Imagen de la mascota</div>

            <h2>{selectedPet?.name ?? "Mascota"}</h2>

            <div className="pet-info">
              <p><strong>Raza:</strong> {selectedPet?.breed}</p>
              <p><strong>Edad:</strong> {selectedPet?.age}</p>
              <p><strong>Tamaño:</strong> {selectedPet?.size}</p>
              <p><strong>Refugio:</strong> {selectedPet?.shelter}</p>
              <p><strong>Estado:</strong> Disponible</p>
            </div>
          </aside>

          <form className="adoption-form" onSubmit={handleSubmit}>
            <label htmlFor="petId">Mascota disponible</label>
            <select
              id="petId"
              value={selectedPetId}
              onChange={(event) => setSelectedPetId(Number(event.target.value))}
            >
              {samplePets
                .filter((pet) => pet.status === "AVAILABLE" || pet.status === "IN_SHELTER")
                .map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} - {pet.breed}
                  </option>
                ))}
            </select>

            <label htmlFor="requestDate">Fecha de solicitud</label>
            <input id="requestDate" type="text" value={today} readOnly />

            <label htmlFor="comment">Motivo de adopción</label>
            <textarea
              id="comment"
              placeholder="Escribe por qué deseas adoptar esta mascota..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />

            {successMessage && (
              <div className="message success">
                <span>✔ {successMessage}</span>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigate("/adoptions/status")}
                >
                  Ver mis solicitudes
                </button>
              </div>
            )}

            {errorMessage && <p className="message error">⚠ {errorMessage}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </button>

            <div className="form-footer">
              <Link to="/">Volver al inicio</Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
