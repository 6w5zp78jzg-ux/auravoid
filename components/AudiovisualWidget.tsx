'use client';
import React from 'react';
import { Html } from '@react-three/drei';

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
    const videoPath = "/video/alpha.mp4";

    return (
        <group>
            <Html 
                transform 
                center 
                // 1. OCULTACIÓN DESACTIVADA: Forzamos a Safari a renderizarlo sí o sí
                occlude={false} 
                distanceFactor={6} // 🚀 Más pequeño el factor = Más grande el widget
                // 2. DISTANCIA DE SEGURIDAD: Lo alejamos un poco más (Z=0.5)
                position={[0, 0, 0.5]} 
                style={{
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: 'opacity 0.6s ease-in-out',
                    // 3. BACKFACE VISIBILITY: Vital para que al girar no desaparezca por error
                    backfaceVisibility: 'hidden', 
                    width: '800px',
                    height: '500px',
                }}
            >
                <div className="relative w-[800px] h-[500px] bg-[#050505] border-2 border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)]">
                    
                    {/* UI DE CÁMARA (Escalada para impacto) */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute top-10 left-10 w-16 h-16 border-t-4 border-l-4 border-white/30" />
                        <div className="absolute top-10 right-10 w-16 h-16 border-t-4 border-r-4 border-white/30" />
                        <div className="absolute bottom-10 left-10 w-16 h-16 border-b-4 border-l-4 border-white/30" />
                        <div className="absolute bottom-10 right-10 w-16 h-16 border-b-4 border-r-4 border-white/30" />
                        
                        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between px-12">
                            <div className="flex flex-col">
                                <span className="text-[14px] text-white/60 tracking-[5px] font-mono font-bold">4K // PRORES 4444</span>
                                <span className="text-[10px] text-white/30 font-mono">DYNAMIC RANGE: HIGH</span>
                            </div>
                            <span className="text-[14px] text-white/60 tracking-[5px] font-mono">24 FPS // ISO 800</span>
                        </div>
                    </div>

                    {/* INDICADOR REC */}
                    <div className="absolute top-12 left-12 z-30 flex items-center gap-4 bg-black/60 px-6 py-3 rounded-2xl backdrop-blur-xl border border-red-500/20">
                        <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_20px_#ef4444]" />
                        <span className="font-mono text-xl text-red-500 font-black tracking-tighter">REC 00:42:15:08</span>
                    </div>

                    <div className="absolute top-12 right-12 z-30 text-white/10 font-mono text-sm tracking-[8px]">
                        AV_UNIT_V.01
                    </div>

                    {/* VIDEO: Con filtro de contraste para que resalte */}
                    <video 
                        src={videoPath}
                        autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        style={{ 
                            filter: isActive ? 'brightness(1.1) contrast(1.1)' : 'brightness(0)' 
                        }}
                    />
                </div>
            </Html>
        </group>
    );
}
