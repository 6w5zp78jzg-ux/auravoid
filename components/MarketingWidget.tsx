'use client';
import React, { useRef, useState, useEffect } from 'react';

export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [dataStream, setDataStream] = useState<string>('0x000000');
    const [metrics, setMetrics] = useState({ a: 84, b: 92, c: 99 });

    // Generador de datos algorítmicos en tiempo real (Efecto Matrix/Hacker)
    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            // Genera un código Hex aleatorio
            setDataStream('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
            // Fluctúa métricas ligeramente
            setMetrics({
                a: Math.floor(80 + Math.random() * 19),
                b: Math.floor(85 + Math.random() * 14),
                c: Math.floor(95 + Math.random() * 5),
            });
        }, 80); // Se actualiza cada 80ms (muy rápido)
        return () => clearInterval(interval);
    }, [isActive]);

    // Rastreador del ratón para el Parallax Vectorial
    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isActive || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        // Porcentaje X e Y (0 a 100)
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-[300px] mb-12 border border-white/10 bg-[#020202] rounded-xl overflow-hidden cursor-crosshair font-mono"
            onMouseMove={handleMove}
            onTouchMove={handleMove}
            onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
        >
            {/* 1. FONDO DE CUADRÍCULA MILIMÉTRICA */}
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    transform: `translate(${(mousePos.x - 50) * -0.2}px, ${(mousePos.y - 50) * -0.2}px)`
                }}
            />

            {/* 2. ANILLOS DE RADAR Y ESCÁNER CON PARALLAX */}
            <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-100 ease-out"
                style={{ transform: `translate(${(mousePos.x - 50) * 0.5}px, ${(mousePos.y - 50) * 0.5}px)` }}
            >
                {/* Anillo exterior punteado giratorio */}
                <div className="absolute w-[240px] h-[240px] border border-white/20 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
                
                {/* Anillo intermedio sólido */}
                <div className="absolute w-[180px] h-[180px] border border-cyan-500/30 rounded-full" />
                
                {/* Barrido de Radar (Conic Gradient) */}
                <div className="absolute w-[180px] h-[180px] rounded-full animate-[spin_3s_linear_infinite]" 
                     style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(0, 255, 255, 0.4) 100%)' }} 
                />

                {/* Retícula central (El objetivo) */}
                <div className="absolute w-8 h-8 border border-white/50" />
                <div className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#00ffff]" />
            </div>

            {/* 3. PUNTERO TÁCTICO (Sigue al ratón exactamente) */}
            <div 
                className="absolute w-[40px] h-[40px] pointer-events-none transition-all duration-75 ease-out z-20"
                style={{ 
                    left: `${mousePos.x}%`, top: `${mousePos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: isActive ? 1 : 0
                }}
            >
                {/* Esquinas de apuntado [ ] */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/80" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/80" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/80" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/80" />
                
                {/* Coordenadas flotantes atadas al puntero */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[9px] text-cyan-400 whitespace-nowrap tracking-widest">
                    X:{mousePos.x.toFixed(1)} Y:{mousePos.y.toFixed(1)}
                </div>
            </div>

            {/* 4. OVERLAYS DE DATOS LATERALES (HUD) */}
            <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between text-[10px] text-white/60 tracking-widest z-10">
                {/* Fila Superior */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <span className="text-cyan-500 font-bold">SYS.TARGETING</span>
                        <span>ALG: AURA_V2</span>
                        <span>HASH: {dataStream}</span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                        <span className="animate-pulse text-white">LIVE TRACKING</span>
                        <span>{isActive ? 'ACQUIRING...' : 'STANDBY'}</span>
                    </div>
                </div>

                {/* Fila Inferior (Métricas) */}
                <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-white/40">CTR</span>
                            <span className="text-white text-sm">{metrics.a}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white/40">CONV</span>
                            <span className="text-white text-sm">{metrics.b}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white/40">RET</span>
                            <span className="text-cyan-400 text-sm">{metrics.c}%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] opacity-50">SYNCED</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                    </div>
                </div>
            </div>

            {/* Viñeteo interior para dar profundidad de pantalla de radar */}
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] pointer-events-none z-30" />
        </div>
    );
}
