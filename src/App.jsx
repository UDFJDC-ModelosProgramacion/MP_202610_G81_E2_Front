import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { RegisterScreen } from './pages/RegisterScreen';
import { CreatePetScreen } from './pages/CreatePetScreen';
import './App.css'; // Mantenemos esta línea para que tus estilos sigan funcionando

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal (Login temporal) */}
        <Route
          path="/"
          element={
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
              <h1 className="text-2xl font-bold text-[#2D3436] mb-4">
                Pantalla de Login (Próximamente)
              </h1>

              <Link
                to="/registro"
                className="text-[#6C5CE7] hover:underline font-semibold"
              >
                Ir a Crear Cuenta
              </Link>
              <Link 
                to="/create-pet" 
                className="text-[#5a32e1] hover:underline font-semibold mt-2"
              >
                Registrar Mascota
              </Link>
            </div>
          }
        />

        {/* Ruta de la pantalla de registro */}
        <Route path="/registro" element={<RegisterScreen />} />
        
        {/* Ruta de crear mascota */}
        <Route path="/create-pet" element={<CreatePetScreen />} />
      </Routes>
    </Router>
  );
}

export default App;