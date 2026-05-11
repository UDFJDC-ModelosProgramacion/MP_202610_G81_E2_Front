import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ServiceScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4 p-6 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 max-w-sm w-full relative">
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="absolute top-4 right-4 text-sm text-gray-500 hover:text-red-500 font-semibold transition-colors flex items-center gap-1"
        >
          <span>🚪</span> Salir
        </button>

        <div className="text-6xl mb-2 mt-4">🐾</div>
        <h1 className="text-2xl font-bold text-[#2D3436] mb-2">
          Servicios Adopción
        </h1>
        <p className="text-gray-500 text-sm mb-4">¿Qué deseas hacer hoy?</p>

        <Link 
          to="/create-shelter" 
          className="p-3 bg-orange-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
        >
          Registrar Shelter
        </Link>

        <Link 
          to="/create-pet" 
          className="p-3 bg-pink-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
        >
          Registrar Mascota
        </Link>

        <Link 
          to="/listar-mascotas" 
          className="p-3 bg-teal-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
        >
          Listar Mascotas
        </Link>

        <Link 
          to="/solicitar-adopcion" 
          className="p-3 bg-green-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
        >
          Solicitar Adopción
        </Link>

        <Link
          to="/solicitudes-adopcion"
          className="p-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
        >
          Gestionar Solicitudes de Adopción
        </Link>

        <Link 
          to="/crear-resena" 
          className="p-3 bg-[#6C5CE7] text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm border-2 border-purple-300"
        >
          Crear Reseña de Adopción
        </Link>

        <Link 
          to="/ver-resenas" 
          className="p-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
        >
          Ver Reseñas de Mascotas
        </Link>
      </div>
    </div>
  );
};

export default ServiceScreen;
