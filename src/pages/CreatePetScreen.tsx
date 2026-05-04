import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Definimos la interfaz de los datos para TypeScript
interface PetFormData {
  name: string;
  species: string;
  size: string;
  sex: string;
  breed: string;
  temperament: string;
  imageUrl: string;
  origin: string;
  bornDate: string;
  isRescued: boolean;
  termsAccepted: boolean;
  specificNeeds: string;
}

export function CreatePetScreen() {
  const navigate = useNavigate();

  // 2. Tipamos el estado inicial usando la interfaz
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    species: '',
    size: '',
    sex: '',
    breed: '',
    temperament: '',
    imageUrl: '',
    origin: '',
    bornDate: '',
    isRescued: false,
    termsAccepted: false,
    specificNeeds: ''
  });

  // 3. Tipamos el estado de errores como un objeto de strings
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // 4. Tipamos el evento de cambio para inputs y selects
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    
    // Verificamos si es un checkbox para sacar el atributo 'checked'
    const isCheckbox = type === 'checkbox';
    const val = isCheckbox ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({ ...prev, [id]: val }));
    
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  // 5. Tipamos el evento de envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Requerido';
    if (!formData.species) newErrors.species = 'Requerido';
    if (!formData.size) newErrors.size = 'Requerido';
    if (!formData.sex) newErrors.sex = 'Requerido';
    if (!formData.temperament) newErrors.temperament = 'Requerido';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'Requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        bornDate: formData.bornDate,
        sex: formData.sex,
        size: formData.size,
        temperament: formData.temperament,
        specificNeeds: formData.specificNeeds,
        originLocation: formData.origin,
        isRescued: formData.isRescued,
        photo: formData.imageUrl,
        shelterId: 1 
      };

      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api'}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        alert('Ocurrió un error al registrar la mascota.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-white text-4xl font-bold">Registrar Mascota</h1>
          <p className="text-white/80 mt-2">Agrega un nuevo peludito al refugio</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {isSuccess ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#2D3436] mb-4">Mascota registrada</h2>
            <p className="text-gray-600 text-lg mb-8">El peludito ya está disponible para adopción.</p>
            <div className="text-8xl">🐕🐈</div>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Ir al inicio
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Todos los campos ahora están sueltos dentro del form, creando una sola columna */}
              
              <div>
                <label className="block font-semibold text-[#2D3436] mb-2" htmlFor="name">
                  Nombre de la mascota <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors`}
                  placeholder="Nombre"
                />
                {errors.name && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#2D3436] mb-2" htmlFor="species">
                  Especie <span className="text-red-500">*</span>
                </label>
                <select
                  id="species"
                  value={formData.species}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.species ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors`}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Dog">Perro</option>
                  <option value="Cat">Gato</option>
                  <option value="Other">Otro</option>
                </select>
                {errors.species && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.species}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#2D3436] mb-2" htmlFor="size">
                  Tamaño <span className="text-red-500">*</span>
                </label>
                <select
                  id="size"
                  value={formData.size}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.size ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors`}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Small">Pequeño</option>
                  <option value="Medium">Mediano</option>
                  <option value="Large">Grande</option>
                </select>
                {errors.size && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.size}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#2D3436] mb-2" htmlFor="sex">
                  Sexo <span className="text-red-500">*</span>
                </label>
                <select
                  id="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.sex ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors`}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Male">Macho</option>
                  <option value="Female">Hembra</option>
                </select>
                {errors.sex && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.sex}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#2D3436] mb-2" htmlFor="temperament">
                  Temperamento <span className="text-red-500">*</span>
                </label>
                <select
                  id="temperament"
                  value={formData.temperament}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.temperament ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors`}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Calm">Tranquilo</option>
                  <option value="Playful">Juguetón</option>
                  <option value="Shy">Tímido</option>
                  <option value="Active">Activo</option>
                </select>
                {errors.temperament && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.temperament}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#2D3436] mb-2" htmlFor="breed">
                  Raza de la mascota
                </label>
                <input
                  id="breed"
                  type="text"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                  placeholder="Raza"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3436] mb-2" htmlFor="specificNeeds">
                  Necesidades Especiales
                </label>
                <input
                  id="specificNeeds"
                  type="text"
                  value={formData.specificNeeds}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                  placeholder="Necesidades Especiales"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3436] mb-2" htmlFor="bornDate">
                  Fecha de Nacimiento o Edad
                </label>
                <input
                  id="bornDate"
                  type="text" 
                  value={formData.bornDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                  placeholder="Edad / Fecha Nac." 
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3436] mb-2" htmlFor="origin">
                  Lugar de Rescate o Procedencia
                </label>
                <input
                  id="origin"
                  type="text"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                  placeholder="Lugar de procedencia"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3436] mb-2" htmlFor="imageUrl">
                  Foto de la Mascota
                </label>
                <input
                  id="imageUrl"
                  type="text"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                  placeholder="URL de la imagen (JPG, PNG)"
                />
              </div>

              <div className="flex flex-col gap-4 py-2">
                <div className="flex items-center gap-3">
                  <input
                    id="isRescued"
                    type="checkbox"
                    checked={formData.isRescued}
                    onChange={handleChange}
                    className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500 cursor-pointer"
                  />
                  <label htmlFor="isRescued" className="text-[#2D3436] font-medium cursor-pointer">
                    Rescatada
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="termsAccepted"
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className={`w-5 h-5 border-gray-300 rounded focus:ring-pink-500 cursor-pointer ${
                      errors.termsAccepted ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  <label htmlFor="termsAccepted" className="text-[#2D3436] font-medium cursor-pointer">
                    Acepta los términos y condiciones <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.termsAccepted && <p className="text-red-500 text-sm font-semibold">{errors.termsAccepted}</p>}
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-[#DCDDE1]">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 bg-white border border-[#DCDDE1] text-[#2D3436] font-semibold rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  Agregar mascota al refugio
                </button>
              </div>
              
            </form>
          </div>
        )}
      </div>
    </div>
  );
}