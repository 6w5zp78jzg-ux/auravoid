'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [dataStream, setDataStream] = useState<string>('0x000000');
    const [metrics, setMetrics] = useState({ a: 84, b: 92, c: 99 });

    // 1. Lógica original de datos
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

    // 2. Parallax adaptado al motor 3D para iPad
    useFrame((state) => {
        if (!isActive) return;
        // Mapeamos el movimiento del ratón de Three.js (-1 a 1) al rango del HUD (0 a 100)
        const targetX = (state.mouse.x + 1) * 50;
        const targetY = (-state.mouse.y + 1) * 50;
        
        setMousePos(prev => ({
            x: prev.x + (targetX - prev.x) * 0.1,
            y: prev.y + (targetY - prev.y) * 0.1
        }));
    });

    return (
        <group>
            {/* Usamos Html con 'transform' para que se integre en la rueda.
               'occlude={false}' es vital para que Safari no lo esconda.
            */}
            <Html
                transform
                center
                distanceFactor={8.2}
                position={[0, 0, 0.5]} // 🚀 Lo adelantamos para que no lo tape nada
                occlude={false}
                zIndexRange={[100, 0]} // 🚀 Forzamos prioridad visual
                style={{
                    width: '800px',
                    height: '450px',
                    display: isActive ? 'block' : 'none',
                    pointerEvents: 'none',
                }}
            >
                {/* --- AQUÍ EMPIEZA TU CÓDIGO ORIGINAL SIN TOCAR --- */}
                <div 
                    className="relative w-full h-full border border-white/10 bg-[#020202] rounded-xl overflow-hidden font-mono select-none"
                    style={{ WebkitTransform: 'translate3d(0,0,0)' }} // Fix para Safari
                >
                    {/* 1. CUADRÍCULA */}
                    <div 
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            transform: `translate(${(mousePos.x - 50) * -0.2}px, ${(mousePos.y - 50) * -0.2}px)`
                        }}
                    />

                    {/* 2. ANILLOS DE RADAR */}
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
                        }}
                    >
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/80" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/80" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/80" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/80" />
                        
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[9px] text-cyan-400 whitespace-nowrap tracking-widest">
                            X:{mousePos.x.toFixed(1)} Y:{mousePos.y.toFixed(1)}
                        </div>
                    </div>

                    {/* 4. HUD DE DATOS */}
                    <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between text-[10px] text-white/60 tracking-widest z-10">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-cyan-500 font-bold">SYS.TARGETING</span>
                                <span>ALG: AURA_V2</span>
                                <span>HASH: {dataStream}</span>
                            </div>
                            <div className="text-right flex flex-col gap-1">
                                <span className="animate-pulse text-white font-bold">LIVE TRACKING</span>
                                <span>{isActive ? 'ACQUIRING...' : 'STANDBY'}</span>
                            </div>
                        </div>

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
                                    <span className="text-cyan-400 text-sm font-bold">{metrics.c}%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] opacity-50">SYNCED</span>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                            </div>
                        </div>
                    </div>

                    {/* VIÑETEO */}
                    <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] pointer-events-none z-30" />
                </div>
            </Html>
        </group>
    );
}
