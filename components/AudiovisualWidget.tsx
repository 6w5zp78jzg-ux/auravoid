'use client';
import React from 'react';
import { Html } from '@react-three/drei';

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
    // 💡 ASEGÚRATE DE QUE ESTA RUTA ES CORRECTA. Prueba con un color sólido primero.
    const videoPath = "/video/alpha.mp4";

    return (
        <group>
            <Html 
                transform 
                center 
                occlude={false} 
                // 🚀 distanceFactor: un número más bajo lo hace más GRANDE.
                distanceFactor={5} 
                // 🚀 Z-index: Forzamos a que esté por delante de la malla de metal
                position={[0, 0, 1.5]} 
                style={{
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: 'opacity 0.5s ease-in-out',
                    width: '800px',
                    height: '500px',
                }}
            >
                {/* 🔴 FONDO ROJO PARA PRUEBA: Si ves esto, el HTML funciona */}
                <div className="relative w-[800px] h-[500px] bg-red-600 border-[10px] border-white rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,0,0,0.5)]">
                    
                    {/* UI DE CAPA SUPERIOR */}
                    <div className="absolute inset-0 z-30 flex flex-col justify-between p-10 pointer-events-none">
                        <div className="flex justify-between items-start">
                            <div className="bg-white text-black px-4 py-2 font-black text-4xl rounded">
                                DEBUG: AV UNIT
                            </div>
                            <div className="text-white font-mono text-xl bg-black/50 p-2">
                                STATUS: {isActive ? 'ACTIVE' : 'STANDBY'}
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <div className="bg-red-500 text-white text-6xl font-bold animate-pulse px-6 py-2">
                                REC
                            </div>
                        </div>
                    </div>

                    {/* VIDEO: Prueba si carga quitando el condicional de brillo */}
                    <video 
                        src={videoPath}
                        autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        style={{ opacity: 0.8 }} 
                    />

                    {/* Si el video falla, verás el fondo rojo */}
                </div>
            </Html>
        </group>
    );
}
