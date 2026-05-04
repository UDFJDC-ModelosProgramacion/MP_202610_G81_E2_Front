import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api';

interface ShelterFormData {
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

export function CreateShelterScreen() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ShelterFormData>({
    name: '',
    nit: '',
    phone: '',
    email: '',
    website: '',
    city: '',
    address: '',
    locationDetails: '',
    status: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Este campo es obligatorio';
    if (!formData.nit) newErrors.nit = 'Este campo es obligatorio';
    if (!formData.phone) newErrors.phone = 'Este campo es obligatorio';
    if (!formData.city) newErrors.city = 'Este campo es obligatorio';
    if (!formData.address) newErrors.address = 'Este campo es obligatorio';
    
    if (!formData.email) {
      newErrors.email = 'Este campo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        shelterName: formData.name,
        nit: formData.nit,
        phoneNumber: formData.phone,
        address: formData.address,
        status: formData.status,
        city: formData.city,
        locationDetails: formData.locationDetails,
        description: formData.description,
        websiteUrl: formData.website
      };

      const response = await fetch(`${API_BASE_URL}/shelters`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
        });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert('Ocurrió un error al registrar el refugio. Verifica los datos.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-white text-4xl font-bold">Registrar Shelter</h1>
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
            <h2 className="text-3xl font-bold text-[#2D3436] mb-4">Shelter registrado exitosamente</h2>
            <p className="text-gray-600 text-lg mb-8">
              La información del shelter ha sido guardada correctamente
            </p>
            <div className="text-8xl">🏠🐾</div>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
            >
              Ir al inicio
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label htmlFor="name" className="block font-semibold text-[#2D3436] mb-2">
                  🏠 Nombre del shelter <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                  placeholder="Ingrese el nombre del shelter"
                />
                {errors.name && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="nit" className="block font-semibold text-[#2D3436] mb-2">
                  🪪 NIT <span className="text-red-500">*</span>
                </label>
                <input
                  id="nit"
                  type="text"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.nit ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                  placeholder="Ingrese el NIT"
                />
                {errors.nit && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.nit}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block font-semibold text-[#2D3436] mb-2">
                  📞 Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.phone ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                  placeholder="Ingrese el teléfono"
                />
                {errors.phone && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block font-semibold text-[#2D3436] mb-2">
                  ✉️ Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                  placeholder="Ingrese el email"
                />
                {errors.email && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="website" className="block font-semibold text-[#2D3436] mb-2">
                  🌐 Sitio web
                </label>
                <input
                  id="website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  placeholder="Ingrese el sitio web"
                />
              </div>

              <div>
                <label htmlFor="city" className="block font-semibold text-[#2D3436] mb-2">
                  📍 Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.city ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                  placeholder="Ingrese la ciudad"
                />
                {errors.city && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block font-semibold text-[#2D3436] mb-2">
                  🏡 Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border ${
                    errors.address ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors`}
                  placeholder="Ingrese la dirección"
                />
                {errors.address && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="locationDetails" className="block font-semibold text-[#2D3436] mb-2">
                  📌 Detalles de ubicación
                </label>
                <input
                  id="locationDetails"
                  type="text"
                  name="locationDetails"
                  value={formData.locationDetails}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  placeholder="Ingrese detalles adicionales de ubicación"
                />
              </div>

              <div>
                <label htmlFor="status" className="block font-semibold text-[#2D3436] mb-2">
                  🔽 Estado
                </label>
                <select 
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                >
                  <option value="">Seleccione un estado</option>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block font-semibold text-[#2D3436] mb-2">
                  📝 Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none transition-colors"
                  placeholder="Ingrese una descripción del shelter"
                />
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
                  className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}