import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleChange = (e: { target: { id: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'El nombre es requerido.';
    if (!formData.email) newErrors.email = 'El correo es requerido.';
    
    if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api'}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        alert('Registro exitoso. ¡Bienvenido!');
        navigate('/'); 
      } else if (response.status === 409 || response.status === 400) {
        setErrors({ email: 'Este correo ya se encuentra registrado.' });
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-8 bg-white border border-[#DCDDE1] rounded-xl shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#2D3436]">Crear Cuenta</h2>
        {/* Actualizado para clientes/adoptantes */}
        <p className="text-sm text-[#A29BFE] mt-2">Únete para encontrar a tu nuevo mejor amigo</p>
      </div>

      <form id="register-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#2D3436]" htmlFor="name">Nombre Completo</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
              errors.name ? 'border-[#D63031] bg-red-50' : 'border-[#DCDDE1] focus:border-[#6C5CE7]'
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
            className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
              errors.email ? 'border-[#D63031] bg-red-50' : 'border-[#DCDDE1] focus:border-[#6C5CE7]'
            }`}
            placeholder="correo@ejemplo.com"
          />
          {errors.email && <span className="text-xs font-semibold text-[#D63031] mt-1">{errors.email}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#2D3436]" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
              errors.password ? 'border-[#D63031] bg-red-50' : 'border-[#DCDDE1] focus:border-[#6C5CE7]'
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
            className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
              errors.confirmPassword ? 'border-[#D63031] bg-red-50' : 'border-[#DCDDE1] focus:border-[#6C5CE7]'
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <span className="text-xs font-semibold text-[#D63031] mt-1">{errors.confirmPassword}</span>}
        </div>
      </form>

      <div className="mt-8 flex flex-col gap-4">
        <button
          form="register-form"
          type="submit"
          className="w-full p-3.5 bg-[#6C5CE7] text-white font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all"
        >
          Registrarse
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-[#A29BFE] border-t border-[#DCDDE1] pt-6">
        ¿Ya tienes cuenta?{' '}
        <Link to="/" className="text-[#6C5CE7] font-bold hover:text-[#2D3436] transition-colors">Inicia sesión</Link>
      </div>
    </div>
  );
}