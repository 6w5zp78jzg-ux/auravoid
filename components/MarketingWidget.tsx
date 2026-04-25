'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Html } from '@react-three/drei';

export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [dataStream, setDataStream] = useState<string>('0x000000');
    const [metrics, setMetrics] = useState({ a: 84, b: 92, c: 99 });

    // Generador de datos algorítmicos en tiempo real (Intacto)
    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setDataStream('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
            setMetrics({
                a: Math.floor(80 + Math.random() * 19),
                b: Math.floor(85 + Math.random() * 14),
                c: Math.floor(95 + Math.random() * 5),
            });
        }, 80);
        return () => clearInterval(interval);
    }, [isActive]);

    // Rastreador del ratón para el Parallax Vectorial (Intacto)
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

        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
    };

    if (!isActive) return null;

    return (
        <group>
            {/* Convertimos todo tu radar HUD en una pantalla 3D interactiva */}
            <Html transform center distanceFactor={12}>
                <div 
                    ref={containerRef}
                    // Anchura y altura fijas para mantener el aspecto de radar dentro del 3D
                    className="relative w-[500px] h-[350px] border border-cyan-500/20 bg-[#020202]/90 backdrop-blur-sm rounded-xl overflow-hidden cursor-crosshair font-mono shadow-[0_0_30px_rgba(0,255,255,0.1)]"
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
                        <div className="absolute w-[240px] h-[240px] border border-white/20 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
                        <div className="absolute w-[180px] h-[180px] border border-cyan-500/30 rounded-full" />
                        <div className="absolute w-[180px] h-[180px] rounded-full animate-[spin_3s_linear_infinite]" 
                             style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(0, 255, 255, 0.4) 100%)' }} 
                        />
                        <div className="absolute w-8 h-8 border border-white/50" />
                        <div className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#00ffff]" />
                    </div>

                    {/* 3. PUNTERO TÁCTICO */}
                    <div 
                        className="absolute w-[40px] h-[40px] pointer-events-none transition-all duration-75 ease-out z-20"
                        style={{ 
                            left: `${mousePos.x}%`, top: `${mousePos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            opacity: isActive ? 1 : 0
                        }}
                    >
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/80" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/80" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/80" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/80" />
                        
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[9px] text-cyan-400 whitespace-nowrap tracking-widest bg-black/50 px-1">
                            X:{mousePos.x.toFixed(1)} Y:{mousePos.y.toFixed(1)}
                        </div>
                    </div>

                    {/* 4. OVERLAYS DE DATOS LATERALES (HUD) */}
                    <div className="absolute inset-0 p-6 pointer-events-none flex flex-col justify-between text-[10px] text-white/60 tracking-widest z-10">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-cyan-500 font-bold bg-black/50 px-1 w-max">SYS.TARGETING</span>
                                <span className="bg-black/50 px-1 w-max">ALG: AURA_V2</span>
                                <span className="bg-black/50 px-1 w-max">HASH: {dataStream}</span>
                            </div>
                            <div className="text-right flex flex-col gap-1">
                                <span className="animate-pulse text-white bg-black/50 px-1 w-max self-end">LIVE TRACKING</span>
                                <span className="bg-black/50 px-1 w-max self-end">{isActive ? 'ACQUIRING...' : 'STANDBY'}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex gap-6 bg-black/50 p-2 rounded border border-white/5">
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
                                    <span className="text-cyan-400 text-sm drop-shadow-[0_0_5px_#00ffff]">{metrics.c}%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-black/50 px-2 py-1">
                                <span className="text-[8px] opacity-50">SYNCED</span>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                            </div>
                        </div>
                    </div>

                    {/* Viñeteo interior para dar profundidad */}
                    <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] pointer-events-none z-30" />
                </div>
            </Html>
        </group>
    );
}
