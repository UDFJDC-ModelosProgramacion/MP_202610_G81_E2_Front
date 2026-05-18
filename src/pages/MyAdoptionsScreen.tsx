import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function MyAdoptionsScreen() {
  const navigate = useNavigate();
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyAdoptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
          navigate('/login');
          return;
        }

        const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api';
        
        // Consumir el endpoint GET /adoptions
        const response = await fetch(`${API_BASE_URL}/adoptions`);
        
        if (!response.ok) {
          throw new Error('No se pudieron cargar las adopciones.');
        }

        const data = await response.json();
        
        // Filtrar en el frontend por el email del adoptante en sesión
        const myFilteredAdoptions = data.filter((adoption: any) => {
           const email = adoption.adopter?.email || adoption.adopterEmail || adoption.userEmail;
           return email === userEmail;
        });

        setAdoptions(myFilteredAdoptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar adopciones');
      } finally {
        setLoading(false);
      }
    };

    fetchMyAdoptions();
  }, [navigate]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-orange-500 py-8 px-6 shadow-md relative">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold"
          >
            ← Volver
          </button>
          <h1 className="text-white text-4xl font-bold">Mis Adopciones</h1>
          <p className="text-white/90 mt-2 text-lg">
            Historial de los peluditos que has traído a tu familia.
          </p>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-8">

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg font-semibold">Cargando tus adopciones...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-red-50 rounded-xl border border-red-200">
            <p className="text-red-500 text-lg font-semibold">{error}</p>
          </div>
        ) : adoptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-[#DCDDE1]">
            <div className="text-7xl mb-4">🐾</div>
            <h2 className="text-2xl font-bold text-[#2D3436] mb-2">Aún no tienes adopciones registradas</h2>
            <p className="text-gray-600 mb-6">Explora nuestra lista de mascotas y encuentra a tu próximo amigo.</p>
            <button
              onClick={() => navigate('/listar-mascotas')}
              className="px-6 py-3 bg-[#6C5CE7] text-white rounded-lg font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              Ver Mascotas Disponibles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adoptions.map((adoption) => {
              const pet = adoption.pet || {};
              return (
                <div key={adoption.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
                    <img 
                      src={pet.photo || 'https://via.placeholder.com/300x200?text=No+Photo'} 
                      alt={`Foto de ${pet.name || 'mascota'}`}
                      className="w-full h-full object-cover"
                    />
                    {adoption.status && (
                       <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#2D3436] shadow-sm uppercase tracking-wide">
                         {adoption.status}
                       </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-[#2D3436]">{pet.name || `Mascota #${adoption.petId || ''}`}</h3>
                      {pet.species && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-semibold">
                          {pet.species}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 text-sm mb-4 space-y-2 border-t border-gray-100 pt-3 mt-3">
                      <p><span className="font-semibold text-[#2D3436]">Raza:</span> {pet.breed || '-'}</p>
                      <p><span className="font-semibold text-[#2D3436]">Fecha:</span> {adoption.adoptionDate || adoption.requestDate || 'Sin registro'}</p>
                      {adoption.comments && (
                        <p className="italic text-gray-500 line-clamp-2">"{adoption.comments}"</p>
                      )}
                    </div>
                    <button 
                      className="w-full border-2 border-[#6C5CE7] text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white transition-colors py-2 rounded-lg font-semibold"
                      onClick={() => navigate(`/listar-mascotas`)}
                    >
                      Buscar Otro Amigo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
