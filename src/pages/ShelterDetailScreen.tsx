import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export interface MediaItem {
    id: number;
    url: string;
}

export interface ShelterDetailDTO {
    id: number;
    shelterName: string;
    nit: string;
    phoneNumber: string;
    address: string;
    city: string;
    description: string;
    websiteUrl: string;
    mediaItems?: MediaItem[];
}

export interface PetDetail {
    id: number;
    name: string;
    breed: string;
    sex: string;
    size: string;
    photo: string;
}

const pawSvgDataUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 24 24' fill='%239CA3AF' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 8c-1.657 0-3-1.79-3-4s1.343-4 3-4 3 1.79 3 4-1.343 4-3 4zm-5.5 3c-1.38 0-2.5-1.567-2.5-3.5S5.12 4 6.5 4 9 5.567 9 7.5 7.88 11 6.5 11zm11 0c-1.38 0-2.5-1.567-2.5-3.5S16.12 4 17.5 4 20 5.567 20 7.5 18.88 11 17.5 11zM12 24c-4.418 0-8-3.134-8-7 0-2.614 2.148-5 5.5-5 1.503 0 2.87.525 4 1.417 1.13-.892 2.497-1.417 4-1.417 3.352 0 5.5 2.386 5.5 5 0 3.866-3.582 7-8 7z'/%3E%3C/svg%3E";

// Fallback images
const fallbackShelterImg = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80";
const fallbackPetImg = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80";

const ShelterDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [shelter, setShelter] = useState<ShelterDetailDTO | null>(null);
    const [pets, setPets] = useState<PetDetail[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api';

                const [shelterRes, petsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/shelters/${id}`),
                    fetch(`${API_BASE_URL}/pets?shelterId=${id}`)
                ]);

                if (!shelterRes.ok) {
                    throw new Error('Error obteniendo la información del refugio');
                }

                const shelterData = await shelterRes.json();
                setShelter(shelterData);

                if (petsRes.ok) {
                    const petsData = await petsRes.json();
                    setPets(petsData);
                }
            } catch (err: any) {
                setError(err.message || 'Error de conexión');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchDetails();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative" data-testid="loading-state">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
                <p className="mt-4 text-gray-700 font-medium text-lg">Cargando detalles...</p>
            </div>
        );
    }

    if (error || !shelter) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" data-testid="error-state">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-lg w-full text-center">
                    <p className="font-bold mb-2">Ups, algo salió mal</p>
                    <p>{error || 'No se pudo cargar el refugio'}</p>
                    <button 
                        onClick={() => navigate('/shelters')}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Volver a Refugios
                    </button>
                </div>
            </div>
        );
    }

    const shelterImage = shelter.mediaItems && shelter.mediaItems.length > 0 ? shelter.mediaItems[0].url : fallbackShelterImg;

    return (
        <div className="min-h-screen bg-gray-50 relative pb-20">
            {/* Fondo de Huellitas */}
            <div 
                className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
                style={{ backgroundImage: `url("${pawSvgDataUrl}")`, backgroundSize: '120px 120px' }}
            ></div>

            {/* Banner Superior con Botón de Regreso */}
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 py-6 px-6 shadow-md relative z-10">
                <div className="max-w-7xl mx-auto flex items-center">
                    <button
                        onClick={() => navigate('/shelters')}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        ← Volver a la Lista
                    </button>
                </div>
            </div>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto px-6 mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Detalles del Refugio */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="h-64 w-full bg-gray-200">
                            <img src={shelterImage} alt={shelter.shelterName} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-8">
                            <h1 className="text-3xl font-extrabold text-gray-800 mb-6">{shelter.shelterName}</h1>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start text-gray-600">
                                    <span className="text-xl mr-3">📍</span>
                                    <div>
                                        <p className="font-semibold text-gray-800">Dirección</p>
                                        <p>{shelter.address}, {shelter.city}</p>
                                    </div>
                                </div>
                                <div className="flex items-start text-gray-600">
                                    <span className="text-xl mr-3">📞</span>
                                    <div>
                                        <p className="font-semibold text-gray-800">Teléfono</p>
                                        <p>{shelter.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-start text-gray-600">
                                    <span className="text-xl mr-3">🏢</span>
                                    <div>
                                        <p className="font-semibold text-gray-800">NIT</p>
                                        <p>{shelter.nit}</p>
                                    </div>
                                </div>
                                {shelter.websiteUrl && (
                                    <div className="flex items-start text-gray-600">
                                        <span className="text-xl mr-3">🌐</span>
                                        <div>
                                            <p className="font-semibold text-gray-800">Sitio Web</p>
                                            <a href={shelter.websiteUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline break-all">
                                                {shelter.websiteUrl}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => navigate(`/agendar-cita/${shelter.id}`)}
                                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors shadow-md text-lg"
                            >
                                Agendar Cita
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Sobre Nosotros</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {shelter.description || 'Este refugio no ha proporcionado una descripción.'}
                        </p>
                    </div>
                </div>

                {/* Columna Derecha: Mascotas Disponibles */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Encuentra a tu nuevo mejor amigo</h2>
                        <p className="text-gray-500 mb-8">Mascotas disponibles en este refugio esperando por un hogar lleno de amor.</p>

                        {pets.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                                <span className="text-5xl mb-4 block">🐕</span>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No hay mascotas publicadas</h3>
                                <p className="text-gray-500">Este refugio aún no ha publicado mascotas disponibles.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pets.map(pet => (
                                    <div key={pet.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                                        <div className="h-48 bg-gray-200 w-full">
                                            <img 
                                                src={pet.photo || fallbackPetImg} 
                                                alt={pet.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-3">{pet.name}</h3>
                                            
                                            <div className="space-y-2 mb-6">
                                                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                                    <span className="text-gray-500 font-medium">Raza</span>
                                                    <span className="text-gray-800 font-semibold">{pet.breed}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                                    <span className="text-gray-500 font-medium">Sexo</span>
                                                    <span className="text-gray-800 font-semibold">{pet.sex}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm pb-2">
                                                    <span className="text-gray-500 font-medium">Tamaño</span>
                                                    <span className="text-gray-800 font-semibold">{pet.size}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <button 
                                                    onClick={() => navigate(`/solicitar-adopcion?petId=${pet.id}`)}
                                                    className="w-full py-3 border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white rounded-lg font-bold transition-colors"
                                                >
                                                    Conocer a {pet.name}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShelterDetailScreen;
