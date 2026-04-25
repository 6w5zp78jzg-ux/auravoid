'use client';
import React from 'react';
import { Html } from '@react-three/drei';

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
    const videoPath = "/video/alpha.mp4";

    if (!isActive) return null;

    return (
        // 1. EL WIDGET DEBE DEVOLVER UN <group> NATIVO DE THREE.JS
        <group>
            {/* 2. ENVOLVEMOS EL HTML EN LA ETIQUETA MÁGICA */}
            <Html transform center distanceFactor={12}>
                <div className="relative w-[500px] h-[350px] bg-black border border-white/10 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                    
                    {/* TU UI INTACTA */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/40" />
                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/40" />
                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/40" />
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/40" />
                        
                        <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between px-6">
                            <span className="text-[7px] text-white/50 tracking-[2px] font-mono uppercase">128GB // RAW</span>
                            <span className="text-[7px] text-white/50 tracking-[2px] font-mono">24 FPS // 800 ISO</span>
                        </div>
                    </div>

                    <div className="absolute top-6 left-6 z-30 flex items-center gap-2 font-mono text-[8px] text-red-500 font-bold bg-black/40 px-2 py-1 rounded backdrop-blur-md">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                        <span>REC 00:12:45:22</span>
                    </div>

                    {/* VIDEO EN LUGAR DE CANVAS */}
                    <video 
                        src={videoPath}
                        autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover z-10"
                    />
                </div>
            </Html>
        </group>
    );
}
