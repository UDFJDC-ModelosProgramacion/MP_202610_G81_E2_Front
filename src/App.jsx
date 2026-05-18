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
import ShelterScreen from './pages/ShelterListScreen'; // Pantalla de lista de shelters
import AdoptaLanding from './pages/Home'; // Importamos el nuevo Home interactivo
import { EditProfileScreen } from './pages/EditProfileScreen'; // Editar perfil de adoptante
import { MyAdoptionsScreen } from './pages/MyAdoptionsScreen'; // Mis Adopciones
import { Navbar } from './components/Navbar'; // Componente de Navegación

import './App.css'; // Mantenemos esta línea para tus estilos globales

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Ruta principal (Home.tsx refactorizado) */}
        <Route
          path="/"
          element={<AdoptaLanding />}
        />

        {/* Ruta de la pantalla de registro */}
        <Route path="/registro" element={<RegisterScreen />} />
        
        {/* Ruta para editar el perfil del adoptante */}
        <Route path="/editar-perfil" element={<EditProfileScreen />} />
        
        {/* Ruta de mis adopciones */}
        <Route path="/mis-adopciones" element={<MyAdoptionsScreen />} />
        
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

        {/* Ruta de listar shelters */}
        <Route path="/shelters" element={<ShelterScreen />} />
        
      </Routes>
    </Router>
  );
}

export default App;

