'use client';
import React from 'react';

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
    const videoPath = "/video/alpha.mp4";

    if (!isActive) return null;

    return (
        <div className="relative w-full h-[350px] mb-12 bg-black border border-white/10 rounded-lg overflow-hidden group shadow-2xl">
            
            {/* --- TU CAPA DE INTERFAZ INTACTA (Encima del video) --- */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {/* Esquineras de cámara */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/40" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/40" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/40" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/40" />
                
                {/* Barra de estado inferior */}
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-8">
                    <span className="text-[7px] text-white/50 tracking-[3px] font-mono uppercase">Internal Storage: 128GB // RAW</span>
                    <span className="text-[7px] text-white/50 tracking-[3px] font-mono">24 FPS // 800 ISO</span>
                </div>
            </div>

            {/* --- TU UI: REC Y CÓDIGO DE TIEMPO INTACTO --- */}
            <div className="absolute top-8 left-8 z-30 flex items-center gap-3 font-mono text-[9px] text-red-500 font-bold bg-black/40 px-3 py-1 rounded-sm backdrop-blur-md">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span>REC 00:12:45:22</span>
            </div>

            {/* 🚀 LA SOLUCIÓN DE RENDIMIENTO: 
                Reemplazamos el <Canvas> anidado por un video HTML puro.
                Al incrustarse en el Pentágono con <Html transform>, este vídeo 
                se inclinará y girará en el espacio 3D de forma natural.
            */}
            <video 
                src={videoPath}
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-10 scale-105"
            />

            {/* --- Efecto de viñeta para dar profundidad (INTACTO) --- */}
            <div className="absolute inset-0 z-15 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
        </div>
    );
}
