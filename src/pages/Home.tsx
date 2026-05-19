import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore: TypeScript no reconoce módulos de imágenes por defecto sin un tsconfig.json
import imagenMascotas from '../assets/mascotas.png';

// --- Interfaces ---
interface CardProps {
    icon: string;
    title: string;
    description: string;
    onClick?: () => void;
}

// --- Componente de Tarjeta ---
const FeatureCard: React.FC<CardProps> = ({ icon, title, description, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-[#faf8ff] p-[10px] rounded-[12px] transition-all duration-300 border border-[#eee] hover:-translate-y-[2px] hover:shadow-sm flex flex-col justify-center ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="w-[30px] h-[30px] rounded-[8px] bg-gradient-to-br from-[#7b2ff7] to-[#ff7b00] flex justify-center items-center text-[14px] text-white mb-[5px]">
                {icon}
            </div>
            <h3 className="text-[13px] mb-[2px] text-[#222] font-semibold leading-tight">
                {title}
            </h3>
            <p className="text-[#666] text-[10px] leading-tight">
                {description}
            </p>
        </div>
    );
};

// --- Componente Principal ---
export default function AdoptaLanding() {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const menus: Record<string, { title: string, options: { label: string, path: string }[] }> = {
        shelters: {
            title: "Shelters",
            options: [
                { label: "Registrar", path: "/create-shelter" },
                { label: "Listar", path: "/shelters" },
                { label: "Detalles", path: "#" }
            ]
        },
        pets: {
            title: "Pets",
            options: [
                { label: "Crear mascota", path: "/create-pet" },
                { label: "Listar mascotas", path: "/listar-mascotas" },
                { label: "Ver detalle de mascota", path: "/listar-mascotas" }
            ]
        },
        adopciones: {
            title: "Adopciones",
            options: [
                { label: "Solicitar", path: "/solicitar-adopcion" },
                { label: "Aprobar/Rechazar", path: "/solicitudes-adopcion" },
                { label: "Ver estado", path: "#" }
            ]
        },
        extras: {
            title: "Extras",
            options: [
                { label: "Crear review", path: "/crear-resena" },
                { label: "Ver reviews", path: "/ver-resenas" },
                { label: "Historia éxito", path: "#" }
            ]
        }
    };

    return (
        // Contenedor estricto a 100vh
        <div className="h-screen w-full flex justify-center items-center bg-[#f7f4ff] overflow-hidden relative p-[10px] font-['Poppins',sans-serif]">

            {/* Fondo de huellitas minimizado */}
            <div className="absolute top-[10px] -left-[10px] text-[30px] text-[#7b2ff7]/[0.05] tracking-[15px] -rotate-[10deg] whitespace-nowrap pointer-events-none select-none z-0">
                🐾 🐾 🐾 🐾 🐾
            </div>
            <div className="absolute bottom-[10px] -right-[5px] text-[40px] text-[#ff7b00]/[0.05] tracking-[15px] rotate-[15deg] whitespace-nowrap pointer-events-none select-none z-0">
                🐾 🐾 🐾 🐾
            </div>

            {/* Contenedor Principal Ultra-Compacto */}
            <div className="w-full max-w-[850px] h-full max-h-[500px] bg-white rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col lg:flex-row relative z-10">

                {/* Lado Izquierdo */}
                <div className="flex-1 p-[15px] lg:p-[25px] flex flex-col justify-center h-full overflow-y-auto lg:overflow-visible">

                    <div className="text-[16px] lg:text-[18px] font-bold mb-[6px] bg-gradient-to-r from-[#7b2ff7] to-[#ff7b00] bg-clip-text text-transparent w-max">
                        🐾 Adopta+
                    </div>

                    <h1 className="text-[18px] sm:text-[22px] lg:text-[26px] leading-[1.1] mb-[8px] text-[#1e1e2f] font-bold">
                        Encuentra un hogar lleno de <br className="hidden lg:block" />
                        <span className="bg-gradient-to-r from-[#7b2ff7] to-[#ff7b00] bg-clip-text text-transparent">amor</span>
                    </h1>

                    <p className="text-[11px] lg:text-[12px] text-[#6b6b80] leading-[1.4] mb-[12px] max-w-[95%]">
                        Conecta mascotas con familias increíbles. Adopta, registra y ayuda a
                        cambiar vidas de una manera rápida y sencilla.
                    </p>

                    {/* Botones */}
                    <div className="flex flex-row flex-wrap gap-[8px]">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-1.5 border-none rounded-[8px] text-[11px] font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-r from-[#7b2ff7] to-[#ff7b00] text-white shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => navigate('/registro')}
                            className="px-4 py-1.5 rounded-[8px] text-[11px] font-semibold cursor-pointer transition-all duration-300 bg-white border-2 border-[#7b2ff7] text-[#7b2ff7] hover:bg-[#7b2ff7] hover:text-white w-full sm:w-auto"
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* Tarjetas / Menú */}
                    <div className="mt-[15px] flex-1 flex flex-col justify-center">
                        {!activeMenu ? (
                            <div className="grid grid-cols-2 gap-[8px]">
                                <FeatureCard
                                    icon="🏠"
                                    title="Shelters"
                                    description="Opciones: Registrar..."
                                    onClick={() => setActiveMenu('shelters')}
                                />
                                <FeatureCard
                                    icon="🐶"
                                    title="Pets"
                                    description="Opciones: Crear, Listar..."
                                    onClick={() => setActiveMenu('pets')}
                                />
                                <FeatureCard
                                    icon="❤️"
                                    title="Adopciones"
                                    description="Opciones: Solicitar..."
                                    onClick={() => setActiveMenu('adopciones')}
                                />
                                <FeatureCard
                                    icon="⭐"
                                    title="Extras"
                                    description="Opciones: Crear review..."
                                    onClick={() => setActiveMenu('extras')}
                                />
                            </div>
                        ) : (
                            <div className="bg-[#faf8ff] p-[12px] rounded-[12px] border border-[#eee] animate-[fadeIn_0.2s_ease-in-out]">
                                <div className="flex items-center gap-2 mb-2">
                                    <button
                                        onClick={() => setActiveMenu(null)}
                                        className="w-[24px] h-[24px] rounded-full bg-white border border-[#ddd] flex justify-center items-center text-[#555] text-[10px] hover:bg-[#eee] transition-colors"
                                    >
                                        ←
                                    </button>
                                    <h3 className="text-[14px] text-[#222] font-semibold m-0">
                                        Menú {menus[activeMenu].title}
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {menus[activeMenu].options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (opt.path !== '#') {
                                                    navigate(opt.path);
                                                }
                                            }}
                                            className="text-left px-3 py-1.5 rounded-[6px] bg-white border border-[#eee] text-[#444] text-[11px] font-medium hover:border-[#7b2ff7] hover:text-[#7b2ff7] transition-all"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lado Derecho */}
                <div className="flex-1 bg-gradient-to-br from-[#7b2ff7] to-[#ff7b00] relative flex justify-center items-center overflow-hidden min-h-[150px] lg:min-h-full">

                    {/* Círculo decorativo */}
                    <div className="w-[250px] h-[250px] bg-white/12 rounded-full absolute"></div>

                    {/* Huellas decorativas internas (Efecto relieve/textura) */}
                    <div className="absolute text-[100px] text-white/10 top-[20px] left-[15px] -rotate-12 select-none pointer-events-none">🐾</div>
                    <div className="absolute text-[100px] text-white/15 bottom-[40px] right-[20px] rotate-12 select-none pointer-events-none">🐾</div>
                    <div className="absolute text-[80px] text-white/20 top-[80px] right-[40px] rotate-45 select-none pointer-events-none">🐾</div>
                    <div className="absolute text-[120px] text-white/5 top-[40px] right-[200px] -rotate-12 select-none pointer-events-none">🐾</div>
                    <div className="absolute text-[100px] text-white/20 bottom-[80px] left-[40px] rotate-12 select-none pointer-events-none">🐾</div>
                    <div className="absolute text-[60px] text-white/10 top-[150px] left-[30px] -rotate-45 select-none pointer-events-none">🐾</div>
                    <div className="absolute text-[90px] text-white/15 bottom-[120px] right-[80px] -rotate-12 select-none pointer-events-none">🐾</div>
                    <div className="absolute text-[50px] text-white/10 top-[180px] right-[10px] rotate-12 select-none pointer-events-none">🐾</div>
                    <div className="absolute text-[70px] text-white/5 bottom-[10px] left-[150px] rotate-45 select-none pointer-events-none">🐾</div>
                    <div className="absolute text-[60px] text-white/15 top-[10px] left-[120px] rotate-12 select-none pointer-events-none">🐾</div>

                    {/* Imagen de la mascota */}
                    <div className="w-[80%] lg:w-[75%] relative z-10 flex justify-center items-center h-full">
                        <img
                            src={imagenMascotas}
                            alt="Mascota"
                            className="w-full object-contain max-h-[400px] drop-shadow-xl"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}