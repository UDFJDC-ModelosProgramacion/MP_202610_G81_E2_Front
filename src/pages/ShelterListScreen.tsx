import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Interfaz para definir el tipo de dato que viene del backend
export interface Shelter {
    id: number;
    name: string;
    nit: string;
    phone: string;
    email: string;
    website: string;
    city: string;
    address: string;
    locationDetails: string;
    status: string;
    description: string;
}

const ShelterScreen: React.FC = () => {
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShelters = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/shelters', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los refugios');
                }

                const data = await response.json();
                setShelters(data);
            } catch (err: any) {
                setError(err.message || 'Error de conexión');
            } finally {
                setIsLoading(false);
            }
        };

        fetchShelters();
    }, []);

    const filteredShelters = shelters.filter(shelter => 
        (shelter?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (shelter?.city || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Imagen por defecto temporal (ya que la API no retorna una imagen según el DTO provisto)
    const defaultImg = "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80";

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">

            {/* FONDO DE HUELLAS (Decorativo) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 select-none">
                <div className="grid grid-cols-6 gap-20 rotate-12 scale-150">
                    {[...Array(30)].map((_, i) => (
                        <span key={i} className="text-8xl">🐾</span>
                    ))}
                </div>
            </div>

            {/* HEADER / BANNER */}
            <header className="relative z-10 bg-gradient-to-r from-purple-600 to-orange-500 pt-12 pb-20 px-6 shadow-xl">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-white text-5xl font-bold mb-8">Shelters</h1>

                    <div className="relative max-w-2xl">
                        <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar shelter por nombre o ciudad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-4 pl-12 pr-4 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300/30 text-lg transition-all text-[#2D3436]"
                        />
                    </div>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="relative z-10 max-w-6xl mx-auto px-6 -mt-10">
                {isLoading ? (
                    // Indicador de Carga
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                        <p className="mt-4 text-[#2D3436] font-medium text-lg">Cargando refugios...</p>
                    </div>
                ) : error ? (
                    // Mensaje de Error
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md mb-8">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                ) : filteredShelters.length === 0 ? (
                    // Mensaje Sin Resultados
                    <div className="bg-white rounded-xl shadow-md p-10 text-center border border-gray-100">
                        <span className="text-6xl mb-4 block">🏠</span>
                        <h2 className="text-2xl font-bold text-[#2D3436] mb-2">No se encontraron refugios registrados</h2>
                        <p className="text-gray-500">Intenta con otros términos de búsqueda o vuelve más tarde.</p>
                    </div>
                ) : (
                    <>
                        {/* CONTADOR */}
                        <div className="bg-white inline-flex items-center px-4 py-2 rounded-lg shadow-sm mb-8 border border-gray-100">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                                Se encontraron <span className="text-[#2D3436]">{filteredShelters.length} shelters</span>
                            </p>
                        </div>

                        {/* GRID DE TARJETAS */}
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
                            {filteredShelters.map((shelter) => (
                                <div key={shelter.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">

                                    {/* IMAGEN Y BADGE */}
                                    <div className="relative h-64 overflow-hidden">
                                        <div className={`absolute top-4 right-4 text-white text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase z-20 shadow-md ${shelter.status === 'ACTIVE' || shelter.status === 'ACTIVO' ? 'bg-[#f97316]' : 'bg-gray-500'}`}>
                                            {shelter.status === 'ACTIVE' || shelter.status === 'ACTIVO' ? (
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                            ) : null}
                                            {shelter.status}
                                        </div>
                                        <img
                                            src={defaultImg}
                                            alt={shelter.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>

                                    {/* TEXTO Y BOTÓN */}
                                    <div className="p-8">
                                        <h3 className="text-2xl font-extrabold text-[#2D3436] mb-2 truncate" title={shelter.name}>{shelter.name}</h3>

                                        <div className="flex items-center text-purple-600 font-bold mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate" title={shelter.city}>{shelter.city}</span>
                                        </div>

                                        <p className="text-gray-600 mb-6 line-clamp-2 h-12 text-sm">
                                            {shelter.description || "Sin descripción disponible."}
                                        </p>

                                        <button 
                                            onClick={() => navigate(`/shelters/${shelter.id}`)}
                                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Ver detalle
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default ShelterScreen;