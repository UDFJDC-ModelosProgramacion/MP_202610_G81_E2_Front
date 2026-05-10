import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Importamos todas tus pantallas
import { RegisterScreen } from './pages/RegisterScreen';
import { CreatePetScreen } from './pages/CreatePetScreen';
import { CreateShelterScreen } from './pages/CreateShelterScreen';
import AdoptionRequestScreen from './pages/AdoptionRequestScreen'; // <-- Nueva importación
import CreateReviewScreen from './pages/CreateReviewScreen'; // Pantalla de reseñas
import PetReviewsPage from './pages/PetReviewScreen'; // Pantalla de visualización de reseñas (HU14)
import { LoginScreen } from './pages/LoginScreen'; // Pantalla de login
import ManageAdoptionRequestsScreen from './pages/ManageAdoptionRequestsScreen'; //Aprobación o rechazo de solicitudes de adopción
import PetListScreen from './pages/PetListScreen'; // Listar mascotas

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
                  to="/login"
                  className="p-3 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
                >
                  Iniciar Sesión
                </Link>

                <Link
                  to="/registro"
                  className="p-3 bg-[#6C5CE7] text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
                >
                  Registro de Cliente
                </Link>
                
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

                {/* Nuevo enlace para Listar Mascotas */}
                <Link 
                  to="/listar-mascotas" 
                  className="p-3 bg-teal-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
                >
                  Listar Mascotas
                </Link>

                {/* Nuevo enlace para Solicitar Adopción */}
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

                {/* Enlace para Crear Reseña */}
                <Link 
                  to="/crear-resena" 
                  className="p-3 bg-[#6C5CE7] text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm border-2 border-purple-300"
                >
                  Crear Reseña de Adopción
                </Link>

                {/* Enlace para Ver Reseñas (HU14) */}
                <Link 
                  to="/ver-resenas" 
                  className="p-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
                >
                  Ver Reseñas de Mascotas
                </Link>
              </div>
            </div>
          }
        />

        {/* Ruta de la pantalla de registro */}
        <Route path="/registro" element={<RegisterScreen />} />
        
        {/* Ruta de login */}
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Ruta de crear mascota */}
        <Route path="/create-pet" element={<CreatePetScreen />} />

        {/* Ruta de crear shelter */}
        <Route path="/create-shelter" element={<CreateShelterScreen />} />

        {/* Ruta de solicitar adopción */}
        <Route path="/solicitar-adopcion" element={<AdoptionRequestScreen />} />

        {/* Ruta para aceptar o rechazar solicitudes */}  
        <Route path="/solicitudes-adopcion" element={<ManageAdoptionRequestsScreen />} />  

        {/* Ruta de crear reseña de adopción */}
        <Route path="/crear-resena" element={<CreateReviewScreen />} />

        {/* Ruta de listar mascotas */}
        <Route path="/listar-mascotas" element={<PetListScreen />} />

        {/* Ruta de ver reseñas de mascotas (HU14) */}
        <Route path="/ver-resenas" element={<PetReviewsPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;

