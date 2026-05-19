import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// --- Interfaces ---
export interface VaccineEntry {
    id: number;
    vaccineName: string;
    adminDate: string;
    nextDueDate: string;
    medicalHistoryId: number;
}

export interface MedicalEvent {
    id: number;
    eventType: string;
    description: string;
    eventDate: string;
    medicalHistoryId: number;
    veterinarianId?: number;
}

export interface MedicalHistoryDetail {
    id: number;
    createdDate: string;
    lastUpdated: string;
    petId: number;
    veterinarianId?: number;
    medicalEvents: MedicalEvent[];
    vaccineEntries: VaccineEntry[];
}

export interface ShelterInfo {
    id: number;
    shelterName: string;
    nit?: string;
    phoneNumber?: string;
    address?: string;
    status?: string;
    city?: string;
    locationDetails?: string;
    description?: string;
    websiteUrl?: string;
}

export interface PetFullDetail {
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
    medicalHistory?: MedicalHistoryDetail;
    shelter?: ShelterInfo;
    adoptionRequestIds: number[];
}

// --- Componente Principal ---
export const PetDetailScreen: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const petId = searchParams.get('petId');

    const [pet, setPet] = useState<PetFullDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!petId) {
            setError('No se especificó el ID de la mascota.');
            setLoading(false);
            return;
        }

        const fetchPetDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api';
                const response = await fetch(`${API_BASE_URL}/pets/${petId}/detail`);

                if (!response.ok) {
                    throw new Error('Error al obtener los detalles de la mascota');
                }
                const data = await response.json();
                setPet(data);
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

        fetchPetDetail();
    }, [petId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-lg">Cargando detalles de la mascota...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md">
                    <div className="text-4xl mb-4">😿</div>
                    <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/listar-mascotas')}
                        className="bg-[#6C5CE7] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-colors"
                    >
                        Volver a la lista
                    </button>
                </div>
            </div>
        );
    }

    if (!pet) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center p-6">
            <div className="w-full max-w-4xl">

                {/* Header */}
                <div className="bg-[#6C5CE7] rounded-xl p-6 mb-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={() => navigate('/listar-mascotas')}
                            className="w-8 h-8 rounded-full bg-white/20 flex justify-center items-center text-white hover:bg-white/30 transition-colors text-sm"
                        >
                            ←
                        </button>
                        <h1 className="text-3xl font-bold">Detalle de {pet.name}</h1>
                    </div>
                    <p className="opacity-90 ml-11">Historia completa, vacunas e información del refugio</p>
                </div>

                {/* Grid principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Foto y datos básicos */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-64 w-full bg-gray-200 overflow-hidden">
                                <img
                                    src={pet.photo || 'https://via.placeholder.com/400x300?text=Sin+Foto'}
                                    alt={`Foto de ${pet.name}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-2xl font-bold text-gray-800">{pet.name}</h2>
                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                        pet.status === 'IN_SHELTER'
                                            ? 'bg-green-100 text-green-800'
                                            : pet.status === 'ADOPTED'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {pet.status === 'IN_SHELTER' ? 'En refugio' :
                                         pet.status === 'ADOPTED' ? 'Adoptado' : pet.status}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Especie:</span>
                                        <span>{pet.species}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Raza:</span>
                                        <span>{pet.breed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Sexo:</span>
                                        <span>{pet.sex}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Tamaño:</span>
                                        <span>{pet.size}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Temperamento:</span>
                                        <span>{pet.temperament}</span>
                                    </div>
                                    {pet.bornDate && (
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-700">Nacimiento:</span>
                                            <span>{pet.bornDate}</span>
                                        </div>
                                    )}
                                    {pet.isRescued !== undefined && (
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-700">Rescatado:</span>
                                            <span>{pet.isRescued ? 'Sí' : 'No'}</span>
                                        </div>
                                    )}
                                    {pet.specificNeeds && (
                                        <div className="pt-2 border-t border-gray-100">
                                            <span className="font-semibold text-gray-700 block mb-1">Necesidades especiales:</span>
                                            <span className="text-gray-600">{pet.specificNeeds}</span>
                                        </div>
                                    )}
                                    {pet.originLocation && (
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-700">Origen:</span>
                                            <span>{pet.originLocation}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información detallada */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Información del Refugio */}
                        {pet.shelter && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-purple-100 flex justify-center items-center text-sm">🏠</span>
                                    Refugio
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-700">Nombre: </span>
                                        <span className="text-gray-600">{pet.shelter.shelterName}</span>
                                    </div>
                                    {pet.shelter.address && (
                                        <div>
                                            <span className="font-semibold text-gray-700">Dirección: </span>
                                            <span className="text-gray-600">{pet.shelter.address}</span>
                                        </div>
                                    )}
                                    {pet.shelter.city && (
                                        <div>
                                            <span className="font-semibold text-gray-700">Ciudad: </span>
                                            <span className="text-gray-600">{pet.shelter.city}</span>
                                        </div>
                                    )}
                                    {pet.shelter.phoneNumber && (
                                        <div>
                                            <span className="font-semibold text-gray-700">Teléfono: </span>
                                            <span className="text-gray-600">{pet.shelter.phoneNumber}</span>
                                        </div>
                                    )}
                                    {pet.shelter.nit && (
                                        <div>
                                            <span className="font-semibold text-gray-700">NIT: </span>
                                            <span className="text-gray-600">{pet.shelter.nit}</span>
                                        </div>
                                    )}
                                    {pet.shelter.description && (
                                        <div className="md:col-span-2">
                                            <span className="font-semibold text-gray-700">Descripción: </span>
                                            <span className="text-gray-600">{pet.shelter.description}</span>
                                        </div>
                                    )}
                                    {pet.shelter.websiteUrl && (
                                        <div>
                                            <span className="font-semibold text-gray-700">Web: </span>
                                            <a href={pet.shelter.websiteUrl} target="_blank" rel="noopener noreferrer"
                                               className="text-[#6C5CE7] hover:underline">
                                                {pet.shelter.websiteUrl}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Vacunas */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-green-100 flex justify-center items-center text-sm">💉</span>
                                Vacunas
                            </h3>
                            {pet.medicalHistory && pet.medicalHistory.vaccineEntries && pet.medicalHistory.vaccineEntries.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold rounded-tl-lg">Vacuna</th>
                                                <th className="px-4 py-2 font-semibold">Fecha aplicación</th>
                                                <th className="px-4 py-2 font-semibold rounded-tr-lg">Próxima dosis</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pet.medicalHistory.vaccineEntries.map((vaccine) => (
                                                <tr key={vaccine.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-800">{vaccine.vaccineName}</td>
                                                    <td className="px-4 py-3 text-gray-600">{vaccine.adminDate}</td>
                                                    <td className="px-4 py-3 text-gray-600">{vaccine.nextDueDate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic">No hay vacunas registradas.</p>
                            )}
                        </div>

                        {/* Historia Clínica */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 flex justify-center items-center text-sm">📋</span>
                                Historia Clínica
                            </h3>
                            {pet.medicalHistory ? (
                                <div>
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <span className="font-semibold text-gray-700">Creada: </span>
                                            <span className="text-gray-600">{pet.medicalHistory.createdDate}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Última actualización: </span>
                                            <span className="text-gray-600">{pet.medicalHistory.lastUpdated}</span>
                                        </div>
                                    </div>

                                    {pet.medicalHistory.medicalEvents && pet.medicalHistory.medicalEvents.length > 0 ? (
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-700 text-sm">Eventos médicos:</h4>
                                            {pet.medicalHistory.medicalEvents.map((event) => (
                                                <div key={event.id} className="border-l-4 border-[#6C5CE7] pl-4 py-2 bg-purple-50 rounded-r-lg">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-semibold text-gray-800 text-sm">{event.eventType}</span>
                                                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">{event.eventDate}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-sm italic">No hay eventos médicos registrados.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic">No hay historia clínica registrada.</p>
                            )}
                        </div>

                        {/* Procesos de Adopción */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-orange-100 flex justify-center items-center text-sm">❤️</span>
                                Procesos de Adopción
                            </h3>
                            {pet.adoptionRequestIds && pet.adoptionRequestIds.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {pet.adoptionRequestIds.map((id) => (
                                        <span key={id} className="bg-purple-100 text-purple-800 text-sm px-3 py-1.5 rounded-lg font-medium">
                                            Proceso #{id}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic">No hay procesos de adopción asociados.</p>
                            )}
                        </div>

                        {/* Botón para solicitar adopción */}
                        <button
                            onClick={() => navigate(`/solicitar-adopcion?petId=${pet.id}`)}
                            className="w-full bg-[#6C5CE7] text-white py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:shadow-lg"
                        >
                            Solicitar Adopción de {pet.name}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetDetailScreen;
