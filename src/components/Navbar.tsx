import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Al montar el componente, revisamos si hay un email en sesión
    const checkSession = () => {
      const email = localStorage.getItem('userEmail');
      setUserEmail(email);
    };

    checkSession();

    // Event listener por si se actualiza el localStorage en otra pestaña o componente
    window.addEventListener('storage', checkSession);
    
    // Un polling sencillo para detectar login sin refrescar si no hay Redux/Context
    const interval = setInterval(checkSession, 1000);

    return () => {
      window.removeEventListener('storage', checkSession);
      clearInterval(interval);
    };
  }, []);

  if (!userEmail) return null; // Solo se renderiza si hay usuario en sesión

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setUserEmail(null);
    setIsOpen(false);
    navigate('/');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="fixed top-4 right-6 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center font-bold text-lg border-2 border-[#DCDDE1] shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2"
        >
          {getInitials(userEmail)}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-white border border-[#DCDDE1] rounded-xl shadow-xl overflow-hidden py-2 animate-fade-in">
            <div className="px-4 py-3 border-b border-[#DCDDE1] bg-gray-50">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Sesión iniciada</p>
              <p className="text-sm font-bold text-[#2D3436] truncate">{userEmail}</p>
            </div>
            
            <Link
              to="/editar-perfil"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-[#2D3436] hover:bg-gray-50 transition-colors"
            >
              ✏️ Editar Perfil
            </Link>
            
            <Link
              to="/mis-adopciones"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-[#2D3436] hover:bg-gray-50 transition-colors"
            >
              🐾 Mis Adopciones
            </Link>
            
            <div className="border-t border-[#DCDDE1] mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
