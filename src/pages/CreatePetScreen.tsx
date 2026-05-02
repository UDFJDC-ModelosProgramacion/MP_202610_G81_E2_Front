import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CreatePetScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    bornDate: '',
    sex: '',
    size: '',
    temperament: '',
    originLocation: '',
    isRescued: false,
    photo: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [id]: checked });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Requerido';
    if (!formData.species) newErrors.species = 'Requerido';
    if (!formData.size) newErrors.size = 'Requerido';
    if (!formData.sex) newErrors.sex = 'Requerido';
    if (!formData.breed) newErrors.breed = 'Requerido';
    if (!formData.temperament) newErrors.temperament = 'Requerido';
    if (!formData.photo) newErrors.photo = 'Requerido';
    if (!formData.bornDate) newErrors.bornDate = 'Requerido';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'Requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Mocking shelterId for now since there's no auth context yet
      const payload = {
        ...formData,
        shelterId: 1
      };

      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api'}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Mascota registrada exitosamente.');
        navigate('/'); 
      } else {
        alert('Error al registrar la mascota.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 bg-gray-50 rounded-xl overflow-hidden font-sans shadow-lg border border-gray-200">
      <div className="bg-[#5a32e1] p-8 text-center text-white rounded-t-xl">
        <h2 className="text-2xl font-semibold">Ingrese los datos</h2>
        <h2 className="text-2xl font-semibold">de la mascota</h2>
        <p className="text-xs mt-2 text-purple-200">Obligatorios *</p>
      </div>

      <form id="create-pet-form" onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Nombre */}
          <div className="flex flex-col">
            <div className={`flex items-center justify-between border rounded-full px-4 py-3 bg-white ${errors.name ? 'border-red-500' : 'border-gray-400'}`}>
              <input id="name" type="text" placeholder="Nombre" value={formData.name} onChange={handleChange} className="w-full outline-none text-gray-700 bg-transparent" />
              <span className="text-red-500 text-lg">*</span>
            </div>
            {errors.name && <span className="text-xs text-red-500 mt-1 pl-4">{errors.name}</span>}
          </div>

          {/* Especie */}
          <div className="flex flex-col">
            <div className={`flex items-center justify-between border rounded-full px-4 py-3 bg-white ${errors.species ? 'border-red-500' : 'border-gray-400'}`}>
              <div className="flex items-center w-full">
                <span className="text-[#5a32e1] mr-2">◀</span>
                <select id="species" value={formData.species} onChange={handleChange} className="w-full outline-none text-gray-500 bg-transparent appearance-none">
                  <option value="" disabled>Especie</option>
                  <option value="Dog">Perro</option>
                  <option value="Cat">Gato</option>
                  <option value="Other">Otro</option>
                </select>
              </div>
              <span className="text-red-500 text-lg">*</span>
            </div>
            {errors.species && <span className="text-xs text-red-500 mt-1 pl-4">{errors.species}</span>}
          </div>

          {/* Tamaño */}
          <div className="flex flex-col">
            <div className={`flex items-center justify-between border rounded-full px-4 py-3 bg-white ${errors.size ? 'border-red-500' : 'border-gray-400'}`}>
              <div className="flex items-center w-full">
                <span className="text-[#5a32e1] mr-2">◀</span>
                <select id="size" value={formData.size} onChange={handleChange} className="w-full outline-none text-gray-500 bg-transparent appearance-none">
                  <option value="" disabled>Tamaño</option>
                  <option value="Small">Pequeño</option>
                  <option value="Medium">Mediano</option>
                  <option value="Large">Grande</option>
                </select>
              </div>
              <span className="text-red-500 text-lg">*</span>
            </div>
            {errors.size && <span className="text-xs text-red-500 mt-1 pl-4">{errors.size}</span>}
          </div>

          {/* Sexo */}
          <div className="flex flex-col">
            <div className={`flex items-center justify-between border rounded-full px-4 py-3 bg-white ${errors.sex ? 'border-red-500' : 'border-gray-400'}`}>
              <div className="flex items-center w-full">
                <span className="text-[#5a32e1] mr-2">◀</span>
                <select id="sex" value={formData.sex} onChange={handleChange} className="w-full outline-none text-gray-500 bg-transparent appearance-none">
                  <option value="" disabled>Sexo</option>
                  <option value="Male">Macho</option>
                  <option value="Female">Hembra</option>
                </select>
              </div>
              <span className="text-red-500 text-lg">*</span>
            </div>
            {errors.sex && <span className="text-xs text-red-500 mt-1 pl-4">{errors.sex}</span>}
          </div>

          {/* Raza */}
          <div className="flex flex-col">
            <div className={`flex items-center justify-between border rounded-full px-4 py-3 bg-white ${errors.breed ? 'border-red-500' : 'border-gray-400'}`}>
              <div className="flex items-center w-full">
                <span className="text-[#5a32e1] mr-2 opacity-50">◀</span>
                <input id="breed" type="text" placeholder="Raza" value={formData.breed} onChange={handleChange} className="w-full outline-none text-gray-700 bg-transparent" />
              </div>
              <span className="text-red-500 text-lg">*</span>
            </div>
            {errors.breed && <span className="text-xs text-red-500 mt-1 pl-4">{errors.breed}</span>}
          </div>

          {/* Rescatada Toggle */}
          <div className="flex items-center border rounded-full px-4 py-3 bg-white border-gray-400">
            <input id="isRescued" type="checkbox" checked={formData.isRescued} onChange={handleChange} className="w-5 h-5 accent-[#5a32e1] mr-3" />
            <label htmlFor="isRescued" className="text-gray-700 font-medium cursor-pointer flex-1">Rescatada</label>
          </div>

          {/* Temperamento */}
          <div className="flex flex-col">
            <div className={`flex items-center justify-between border rounded-full px-4 py-3 bg-white ${errors.temperament ? 'border-red-500' : 'border-gray-400'}`}>
              <div className="flex items-center w-full">
                <span className="text-[#5a32e1] mr-2">◀</span>
                <select id="temperament" value={formData.temperament} onChange={handleChange} className="w-full outline-none text-gray-500 bg-transparent appearance-none">
                  <option value="" disabled>Temperamento</option>
                  <option value="Calm">Tranquilo</option>
                  <option value="Active">Activo</option>
                  <option value="Aggressive">Agresivo</option>
                </select>
              </div>
              <span className="text-red-500 text-lg">*</span>
            </div>
            {errors.temperament && <span className="text-xs text-red-500 mt-1 pl-4">{errors.temperament}</span>}
          </div>

          {/* Subir imagen */}
          <div className="flex flex-col">
            <div className={`flex items-center justify-between border rounded-full px-4 py-3 bg-white ${errors.photo ? 'border-red-500' : 'border-gray-400'}`}>
              <div className="flex items-center w-full overflow-hidden">
                <span className="text-[#5a32e1] mr-2">⬆</span>
                <input id="photo" type="text" placeholder="URL de la imagen (JPG, PNG)" value={formData.photo} onChange={handleChange} className="w-full outline-none text-gray-700 bg-transparent text-sm" />
              </div>
              <span className="text-red-500 text-lg">*</span>
            </div>
            {errors.photo && <span className="text-xs text-red-500 mt-1 pl-4">{errors.photo}</span>}
          </div>

          {/* Acepta Términos */}
          <div className="flex flex-col">
            <div className={`flex items-center border rounded-full px-4 py-3 bg-white ${errors.termsAccepted ? 'border-red-500' : 'border-gray-400'}`}>
              <input id="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleChange} className="w-5 h-5 accent-[#5a32e1] mr-3" />
              <label htmlFor="termsAccepted" className="text-gray-700 font-medium text-sm cursor-pointer flex-1 text-center">Acepta los términos y condiciones</label>
              <span className="text-red-500 text-lg ml-2">*</span>
            </div>
            {errors.termsAccepted && <span className="text-xs text-red-500 mt-1 pl-4">{errors.termsAccepted}</span>}
          </div>

          {/* Lugar de procedencia */}
          <div className="flex items-center border rounded-full px-4 py-3 bg-white border-gray-400">
            <input id="originLocation" type="text" placeholder="Lugar de procedencia" value={formData.originLocation} onChange={handleChange} className="w-full outline-none text-gray-700 bg-transparent" />
          </div>

          {/* Edad (bornDate) */}
          <div className="flex flex-col">
            <div className={`flex items-center justify-between border rounded-full px-4 py-3 bg-white ${errors.bornDate ? 'border-red-500' : 'border-gray-400'}`}>
              <input id="bornDate" type="date" placeholder="Edad / Fecha Nac." value={formData.bornDate} onChange={handleChange} className="w-full outline-none text-gray-500 bg-transparent" />
              <span className="text-red-500 text-lg">*</span>
            </div>
            {errors.bornDate && <span className="text-xs text-red-500 mt-1 pl-4">{errors.bornDate}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button
            type="submit"
            className="w-full py-4 bg-[#5a32e1] text-white font-semibold rounded-full hover:bg-purple-800 transition-colors shadow-md"
          >
            Agregar mascota al refugio
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white text-gray-800 border border-gray-800 font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
