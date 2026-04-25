'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Html } from '@react-three/drei';

export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [dataStream, setDataStream] = useState<string>('0x000000');
    const [metrics, setMetrics] = useState({ a: 84, b: 92, c: 99 });

    // Generador de datos (Siempre activo en segundo plano para evitar parpadeos)
    useEffect(() => {
        const interval = setInterval(() => {
            setDataStream('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
            setMetrics({
                a: Math.floor(80 + Math.random() * 19),
                b: Math.floor(85 + Math.random() * 14),
                c: Math.floor(95 + Math.random() * 5),
            });
        }, 120); // Un poco más lento para no saturar el hilo principal del iPad
        return () => clearInterval(interval);
    }, []);

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

    // --- REGLA DE ORO: NUNCA DEVOLVER NULL ---

    return (
        <group>
            <Html 
                transform 
                center 
                distanceFactor={8} // 🚀 Tamaño Hero
                position={[0, 0, 0.1]}
                style={{
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: 'opacity 0.8s ease-in-out',
                    width: '850px',
                    height: '550px'
                }}
            >
                <div 
                    ref={containerRef}
                    className="relative w-[850px] h-[550px] border border-cyan-500/20 bg-[#020202]/95 backdrop-blur-md rounded-3xl overflow-hidden cursor-crosshair font-mono shadow-[0_0_50px_rgba(0,0,0,0.9)]"
                    onMouseMove={handleMove}
                    onTouchMove={handleMove}
                >
                    {/* 1. CUADRÍCULA DE PRECISIÓN */}
                    <div 
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                            transform: `translate(${(mousePos.x - 50) * -0.3}px, ${(mousePos.y - 50) * -0.3}px)`
                        }}
                    />

                    {/* 2. RADAR TÁCTICO CENTRAL */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ transform: `translate(${(mousePos.x - 50) * 0.4}px, ${(mousePos.y - 50) * 0.4}px)` }}
                    >
                        {/* Anillos */}
                        <div className="absolute w-[450px] h-[450px] border border-cyan-500/10 rounded-full border-dashed animate-[spin_20s_linear_infinite]" />
                        <div className="absolute w-[300px] h-[300px] border border-cyan-500/20 rounded-full" />
                        <div className="absolute w-[300px] h-[300px] rounded-full animate-[spin_4s_linear_infinite]" 
                             style={{ background: 'conic-gradient(from 0deg, transparent 60%, rgba(0, 255, 255, 0.2) 100%)' }} 
                        />
                        
                        {/* Centro */}
                        <div className="absolute w-12 h-12 border border-cyan-500/50 rotate-45" />
                        <div className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_20px_#00ffff]" />
                    </div>

                    {/* 3. OVERLAYS HUD (Datos imponentes) */}
                    <div className="absolute inset-0 p-12 flex flex-col justify-between z-20 pointer-events-none">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <h2 className="text-6xl font-black text-white tracking-tighter italic">
                                    PRECISION<br/>
                                    <span className="text-cyan-500">MARKETING</span>
                                </h2>
                                <div className="flex gap-4 text-[10px] text-cyan-500/60 font-bold uppercase">
                                    <span className="bg-cyan-500/10 px-2 py-1 border border-cyan-500/20">ALG: AURA_V3</span>
                                    <span className="bg-cyan-500/10 px-2 py-1 border border-cyan-500/20">TARGET: ACQUIRED</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-cyan-400 font-mono text-xl mb-1">{dataStream}</div>
                                <div className="text-[10px] text-white/30 uppercase tracking-[4px]">Data Stream Hook</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="grid grid-cols-3 gap-10 bg-black/60 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/30 mb-1 uppercase tracking-widest">Efficiency</span>
                                    <span className="text-3xl text-white font-bold">{metrics.a}%</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/30 mb-1 uppercase tracking-widest">Conversion</span>
                                    <span className="text-3xl text-white font-bold">{metrics.b}%</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/30 mb-1 uppercase tracking-widest">ROI Delta</span>
                                    <span className="text-3xl text-cyan-400 font-bold drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">{metrics.c}%</span>
                                </div>
                            </div>
                            <div className="font-mono text-[9px] text-white/20 text-right">
                                PSYCHOLOGICAL_ENGINEERING<br/>
                                ARCHITECTURE_OF_DESIRE // 2026
                            </div>
                        </div>
                    </div>

                    {/* Efecto Cristal y Escaneo */}
                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                </div>
            </Html>
        </group>
    );
}
