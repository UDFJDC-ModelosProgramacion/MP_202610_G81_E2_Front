import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginScreen() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El formato del correo es inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres y contener letras y números';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8080/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      if (response.ok) {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/servicios');
      } else if (response.status === 401 || response.status === 403) {
        setErrors({ general: 'Correo o contraseña incorrectos.' });
      } else {
        setErrors({ general: 'Error en el inicio de sesión. Intenta de nuevo.' });
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setErrors({ general: 'Error al conectar con el servidor' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 py-8 px-6 shadow-md relative">
        <div className="max-w-3xl mx-auto flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 absolute left-6"
          >
            ← Volver
          </button>
          <h1 className="text-white text-4xl font-bold w-full text-center">Inicio de Sesión</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            {errors.general && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-semibold">
                {errors.general}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block font-semibold text-[#2D3436] mb-2">
                ✉️ Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full px-4 py-3 bg-white border ${errors.email ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors`}
                placeholder="Ingresa tu correo"
              />
              {errors.email && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block font-semibold text-[#2D3436] mb-2">
                🔒 Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`w-full px-4 py-3 bg-white border ${errors.password ? 'border-red-500 bg-red-50' : 'border-[#DCDDE1]'
                  } rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors`}
                placeholder="Ingresa tu contraseña"
              />
              {errors.password && <p className="mt-1 text-red-500 text-sm font-semibold">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all shadow-md"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
