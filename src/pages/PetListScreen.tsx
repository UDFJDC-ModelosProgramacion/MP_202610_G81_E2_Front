import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Tipos basados en PetDetailDTO del backend
export interface MedicalHistory {
    id: number;
    vaccinations?: string;
    surgeries?: string;
    illnesses?: string;
}

export interface PetDetail {
    id: number;
    name: string;
    species: string;
    breed: string;
    bornDate?: string;
    sex: string;
    size: string;
    temperament: string;
    specificNeeds?: string;
    originLocation?: string;
    isRescued?: boolean;
    status?: string;
    photo: string;
    shelterId: number;
    medicalHistory?: MedicalHistory;
    adoptionRequestIds?: number[];
}

export const PetListScreen: React.FC = () => {
    const navigate = useNavigate();
    const [pets, setPets] = useState<PetDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para filtros
    const [filterBreed, setFilterBreed] = useState('');
    const [filterSize, setFilterSize] = useState('');
    const [filterTemperament, setFilterTemperament] = useState('');

    const fetchPets = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filterBreed) params.append('breed', filterBreed);
            if (filterSize) params.append('size', filterSize);
            if (filterTemperament) params.append('temperament', filterTemperament);

            const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api';
            const url = `${API_BASE_URL}/pets${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Error fetching pets');
            }
            const data = await response.json();
            setPets(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error desconocido');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPets();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center p-6">
            <div className="w-full max-w-6xl">
                {/* Header similar al de las imágenes: fondo morado */}
                <div className="bg-[#6C5CE7] rounded-xl p-6 mb-8 text-white flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Busca a tu amigo de 4 patas</h1>
                        <p className="opacity-90">Adopta, no compres. Ellos necesitan de tu amor.</p>
                    </div>
                </div>

                {/* Filtros */}
                <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Raza</label>
                        <input
                            type="text"
                            placeholder="Ej. Labrador"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={filterBreed}
                            onChange={(e) => setFilterBreed(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tamaño</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={filterSize}
                            onChange={(e) => setFilterSize(e.target.value)}
                        >
                            <option value="">Cualquiera</option>
                            <option value="Small">Pequeño</option>
                            <option value="Medium">Mediano</option>
                            <option value="Large">Grande</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Temperamento</label>
                        <input
                            type="text"
                            placeholder="Ej. Juguetón"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={filterTemperament}
                            onChange={(e) => setFilterTemperament(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="bg-[#6C5CE7] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-colors w-full md:w-auto"
                        >
                            Buscar
                        </button>
                    </div>
                </form>

                {/* Lista de mascotas */}
                {loading ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-lg">Cargando mascotas...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <p className="text-red-500 text-lg">{error}</p>
                    </div>
                ) : pets.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-lg">No se encontraron mascotas con estos filtros.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pets.map((pet) => (
                            <div key={pet.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-48 w-full bg-gray-200 overflow-hidden">
                                     <img 
                                        src={pet.photo || 'https://via.placeholder.com/300x200?text=No+Photo'} 
                                        alt={`Foto de ${pet.name}`}
                                        className="w-full h-full object-cover"
                                     />
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-semibold">
                                            {pet.species}
                                        </span>
                                    </div>
                                    <div className="text-gray-600 text-sm mb-4 space-y-1">
                                        <p><span className="font-semibold text-gray-700">Raza:</span> {pet.breed}</p>
                                        <p><span className="font-semibold text-gray-700">Tamaño:</span> {pet.size}</p>
                                        <p><span className="font-semibold text-gray-700">Temperamento:</span> {pet.temperament}</p>
                                        <p><span className="font-semibold text-gray-700">Sexo:</span> {pet.sex}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <button 
                                            className="w-full bg-[#6C5CE7] text-white hover:opacity-90 transition-colors py-2 rounded-lg font-semibold"
                                            onClick={() => navigate(`/detalle-mascota?petId=${pet.id}`)}
                                        >
                                            Ver Detalle
                                        </button>
                                        <button 
                                            className="w-full border-2 border-[#6C5CE7] text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white transition-colors py-2 rounded-lg font-semibold"
                                            onClick={() => navigate(`/solicitar-adopcion?petId=${pet.id}`)}
                                        >
                                            Solicitar Adopción
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PetListScreen;
