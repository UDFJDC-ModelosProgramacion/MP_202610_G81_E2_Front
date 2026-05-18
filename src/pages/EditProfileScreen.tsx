import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function EditProfileScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    city: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Asumiendo ID = 1 para el rol de Adoptante mientras se integra la sesión
  const adopterId = 1;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api'}/adopters/${adopterId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            email: data.email || '',
            password: '', // No precargamos la contraseña por seguridad
            confirmPassword: '',
            phoneNumber: data.phoneNumber || '',
            city: data.city || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [adopterId]);

  const handleChange = (e: { target: { id: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'El nombre es requerido.';
    if (!formData.email) newErrors.email = 'El correo es requerido.';

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres y contener letras y números.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api'}/adopters/${adopterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          city: formData.city
        }),
      });

      if (response.ok) {
        alert('Perfil actualizado correctamente.');
        navigate('/');
      } else {
        alert('Ocurrió un error inesperado al actualizar el perfil.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-10">
      <div className="w-full max-w-sm mx-auto p-8 bg-white border border-[#DCDDE1] rounded-xl shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#2D3436]">Editar Perfil</h2>
          <p className="text-sm text-[#A29BFE] mt-2">Actualiza tu información personal</p>
        </div>

        <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#2D3436]" htmlFor="name">Nombre Completo</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${errors.name ? 'border-[#D63031] bg-red-50' : 'border-[#DCDDE1] focus:border-[#6C5CE7]'
                }`}
              placeholder="Ana López"
            />
            {errors.name && <span className="text-xs font-semibold text-[#D63031] mt-1">{errors.name}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#2D3436]" htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${errors.email ? 'border-[#D63031] bg-red-50' : 'border-[#DCDDE1] focus:border-[#6C5CE7]'
                }`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && <span className="text-xs font-semibold text-[#D63031] mt-1">{errors.email}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#2D3436]" htmlFor="password">Nueva Contraseña</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${errors.password ? 'border-[#D63031] bg-red-50' : 'border-[#DCDDE1] focus:border-[#6C5CE7]'
                }`}
              placeholder="••••••••"
            />
            {errors.password && <span className="text-xs font-semibold text-[#D63031] mt-1">{errors.password}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#2D3436]" htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${errors.confirmPassword ? 'border-[#D63031] bg-red-50' : 'border-[#DCDDE1] focus:border-[#6C5CE7]'
                }`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <span className="text-xs font-semibold text-[#D63031] mt-1">{errors.confirmPassword}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#2D3436]" htmlFor="phoneNumber">Teléfono</label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-[#6C5CE7] transition-colors"
              placeholder="3001234567"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#2D3436]" htmlFor="city">Ciudad</label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 border border-[#DCDDE1] rounded-lg focus:outline-none focus:border-[#6C5CE7] transition-colors"
              placeholder="Bogotá"
            />
          </div>
        </form>

        <div className="mt-8 flex flex-col gap-4">
          <button
            form="edit-profile-form"
            type="submit"
            className="w-full p-3.5 bg-[#6C5CE7] text-white font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all"
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={() => navigate('/mis-adopciones')}
            className="w-full p-3.5 bg-white border-2 border-[#6C5CE7] text-[#6C5CE7] font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-all"
          >
            Ver Mis Adopciones
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-[#A29BFE] border-t border-[#DCDDE1] pt-6">
          <button onClick={() => navigate(-1)} className="text-[#6C5CE7] font-bold hover:text-[#2D3436] transition-colors">Volver Atrás</button>
        </div>
      </div>
    </div>
  );
}
