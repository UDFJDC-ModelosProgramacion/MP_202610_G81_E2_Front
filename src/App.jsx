import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Importamos todas tus pantallas
import { RegisterScreen } from './pages/RegisterScreen';
import { CreatePetScreen } from './pages/CreatePetScreen';
import { CreateShelterScreen } from './pages/CreateShelterScreen';
import AdoptionRequestScreen from './pages/AdoptionRequestScreen'; // <-- Nueva importación
import CreateReviewScreen from './pages/CreateReviewScreen'; // Pantalla de reseñas

import './App.css'; // Mantenemos esta línea para tus estilos globales

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal (Login y Panel temporal) */}
        <Route
          path="/"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4 p-6 text-center">
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 max-w-sm w-full">
                <div className="text-6xl mb-2">🐾</div>
                <h1 className="text-2xl font-bold text-[#2D3436] mb-4">
                  Panel Temporal
                </h1>

                <Link
                  to="/registro"
                  className="p-3 bg-[#6C5CE7] text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
                >
                  Registro de Cliente
                </Link>
                
                <Link 
                  to="/create-pet" 
                  className="p-3 bg-pink-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
                >
                  Registrar Mascota
                </Link>

                <Link 
                  to="/create-shelter" 
                  className="p-3 bg-orange-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
                >
                  Registrar Shelter
                </Link>

                {/* Nuevo enlace para Solicitar Adopción */}
                <Link 
                  to="/solicitar-adopcion" 
                  className="p-3 bg-green-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
                >
                  Solicitar Adopción
                </Link>

                {/* Enlace para Crear Reseña */}
                <Link 
                  to="/crear-resena" 
                  className="p-3 bg-[#6C5CE7] text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm border-2 border-purple-300"
                >
                  Crear Reseña de Adopción
                </Link>
              </div>
            </div>
          }
        />

        {/* Ruta de la pantalla de registro */}
        <Route path="/registro" element={<RegisterScreen />} />
        
        {/* Ruta de crear mascota */}
        <Route path="/create-pet" element={<CreatePetScreen />} />

        {/* Ruta de crear shelter */}
        <Route path="/create-shelter" element={<CreateShelterScreen />} />

        {/* Ruta de solicitar adopción */}
        <Route path="/solicitar-adopcion" element={<AdoptionRequestScreen />} />

        {/* Ruta de crear reseña de adopción */}
        <Route path="/crear-resena" element={<CreateReviewScreen />} />
        
      </Routes>
    </Router>
  );
}

export default App;