'use client';
import React from 'react';
import { Html } from '@react-three/drei';

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
    const videoPath = "/video/alpha.mp4";

    // --- ELIMINADO EL return null ---
    // Ahora el componente vive siempre, solo lo ocultamos visualmente.

    return (
        <group>
            <Html 
                transform 
                center 
                distanceFactor={8} // 🚀 Bajado de 12 a 8 para que el widget se vea MUCHO MÁS GRANDE (Hero)
                position={[0, 0, 0.1]}
                style={{
                    // Usamos opacidad para que el vídeo ya esté cargado y listo al llegar al frente
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: 'opacity 0.6s ease-in-out',
                    width: '800px', // Forzamos ancho para que el diseño no colapse
                    height: '500px',
                }}
            >
                {/* Aumentamos las dimensiones del div para que encaje en el marco Hero de 16.5x9.5 */}
                <div className="relative w-[800px] h-[500px] bg-black border border-white/10 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                    
                    {/* UI DE CÁMARA */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-white/40" />
                        <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-white/40" />
                        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-white/40" />
                        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-white/40" />
                        
                        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between px-10">
                            <span className="text-[12px] text-white/50 tracking-[4px] font-mono uppercase">128GB // RAW // REC-709</span>
                            <span className="text-[12px] text-white/50 tracking-[4px] font-mono">24 FPS // 800 ISO // 5600K</span>
                        </div>
                    </div>

                    <div className="absolute top-10 left-10 z-30 flex items-center gap-3 font-mono text-[14px] text-red-500 font-bold bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md border border-red-500/30">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]" />
                        <span>REC 00:12:45:22</span>
                    </div>

                    <div className="absolute top-10 right-10 z-30 text-white/20 font-mono text-xs">
                        AURA_VOID_STUDIOS // 2026
                    </div>

                    {/* VIDEO: Siempre cargado pero pausado si no está activo para salvar CPU */}
                    <video 
                        src={videoPath}
                        autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        style={{ filter: isActive ? 'brightness(1)' : 'brightness(0.2)' }}
                    />
                </div>
            </Html>
        </group>
    );
}
