import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ShelterDTO {
    id: number;
    shelterName: string;
    city: string;
    phoneNumber: string;
    status: string;
    email?: string;
    type?: string;
}

const pawSvgDataUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 24 24' fill='%239CA3AF' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 8c-1.657 0-3-1.79-3-4s1.343-4 3-4 3 1.79 3 4-1.343 4-3 4zm-5.5 3c-1.38 0-2.5-1.567-2.5-3.5S5.12 4 6.5 4 9 5.567 9 7.5 7.88 11 6.5 11zm11 0c-1.38 0-2.5-1.567-2.5-3.5S16.12 4 17.5 4 20 5.567 20 7.5 18.88 11 17.5 11zM12 24c-4.418 0-8-3.134-8-7 0-2.614 2.148-5 5.5-5 1.503 0 2.87.525 4 1.417 1.13-.892 2.497-1.417 4-1.417 3.352 0 5.5 2.386 5.5 5 0 3.866-3.582 7-8 7z'/%3E%3C/svg%3E";

const ShelterListScreen: React.FC = () => {
    const [shelters, setShelters] = useState<ShelterDTO[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchInput, setSearchInput] = useState<string>('');
    const navigate = useNavigate();

    const fetchShelters = async (nameFilter: string = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api';
            const url = nameFilter 
                ? `${API_BASE_URL}/shelters?name=${encodeURIComponent(nameFilter)}`
                : `${API_BASE_URL}/shelters`;
            
            const response = await fetch(url, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Error obteniendo los refugios');
            }

            const data = await response.json();
            setShelters(data);
        } catch (err: any) {
            setError(err.message || 'Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchShelters();
    }, []);

    const handleFilter = () => {
        setSearchTerm(searchInput);
        fetchShelters(searchInput);
    };

    const handleReset = () => {
        setSearchInput('');
        setSearchTerm('');
        fetchShelters('');
    };

    // Imágen genérica de un lugar/edificio para representar las instalaciones (no animales)
    const defaultImg = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80";

    const translateStatus = (status: string) => {
        if (!status) return 'DESCONOCIDO';
        if (status.toUpperCase() === 'ACTIVE') return 'ACTIVO';
        if (status.toUpperCase() === 'INACTIVE') return 'INACTIVO';
        return status.toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center relative">
            {/* Fondo de Huellitas */}
            <div 
                className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
                style={{ backgroundImage: `url("${pawSvgDataUrl}")`, backgroundSize: '120px 120px' }}
            ></div>

            {/* Header section matching the image gradient */}
            <header className="w-full bg-gradient-to-r from-purple-600 to-orange-500 pt-8 pb-24 px-6 shadow-xl relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col items-start">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-6 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        ← Volver al Inicio
                    </button>
                    <h1 className="text-white text-5xl font-bold mb-8">Lista de Refugios</h1>
                </div>
            </header>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto w-full px-6 -mt-16 z-20 relative">
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar refugio por nombre..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleFilter(); }}
                                className="w-full py-3 pl-12 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-700 bg-gray-50"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Tipo</label>
                        <select className="w-full py-3 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-gray-700 appearance-none">
                            <option value="">Todos los Tipos</option>
                            <option value="rescue">Centro de Rescate</option>
                            <option value="foster">Casa de Acogida</option>
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Ciudad</label>
                        <select className="w-full py-3 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-gray-700 appearance-none">
                            <option value="">Todas las Ciudades</option>
                            <option value="medellin">Medellin</option>
                            <option value="bogota">Bogota</option>
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                        <select className="w-full py-3 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 text-gray-700 appearance-none">
                            <option value="">Todos los Estados</option>
                            <option value="ACTIVE">ACTIVO</option>
                            <option value="INACTIVE">INACTIVO</option>
                        </select>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button 
                            onClick={handleFilter}
                            className="flex-1 md:flex-none py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all"
                        >
                            Filtrar
                        </button>
                        <button 
                            onClick={handleReset}
                            className="flex-1 md:flex-none py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl shadow-md transition-all"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <main className="w-full max-w-7xl mx-auto px-6 py-8 z-10 relative">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20" data-testid="loading-state">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
                        <p className="mt-4 text-gray-700 font-medium text-lg">Cargando refugios...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md mb-8" data-testid="error-state">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                ) : shelters.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-10 text-center border border-gray-100" data-testid="empty-state">
                        <span className="text-6xl mb-4 block">🏠</span>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {searchTerm ? 'Refugio no encontrado' : 'No hay refugios existentes'}
                        </h2>
                        <p className="text-gray-500">
                            {searchTerm ? 'Intenta buscar con un nombre diferente o limpia los filtros.' : 'Vuelve más tarde para ver nuevos refugios.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                                {shelters.length} resultados encontrados
                            </p>
                        </div>

                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                            {shelters.map((shelter) => (
                                <div key={shelter.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden flex flex-col" data-testid="shelter-card">
                                    <div className="relative h-56 overflow-hidden bg-gray-200">
                                        <div className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-md z-10 flex items-center gap-1 ${shelter.status === 'ACTIVE' || shelter.status === 'ACTIVO' ? 'bg-orange-500' : 'bg-gray-500'}`}>
                                            {(shelter.status === 'ACTIVE' || shelter.status === 'ACTIVO') && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {translateStatus(shelter.status)}
                                        </div>
                                        <img
                                            src={defaultImg}
                                            alt={shelter.shelterName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            {shelter.type || 'Centro de Rescate'}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{shelter.shelterName}</h3>
                                        
                                        <div className="flex items-center text-gray-600 mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{shelter.city || 'Desconocida'}, CO</span>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-3 mb-6">
                                            <div className="text-sm text-gray-600 flex items-center mb-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {shelter.phoneNumber || 'N/A'}
                                            </div>
                                            {shelter.email && (
                                                <div className="text-sm text-gray-600 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {shelter.email}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <button 
                                                onClick={() => navigate(`/shelters/${shelter.id}`)}
                                                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors"
                                            >
                                                Ver shelter
                                            </button>
                                        </div>
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

export default ShelterListScreen;