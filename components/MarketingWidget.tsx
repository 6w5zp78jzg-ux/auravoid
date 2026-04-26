'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const [dataStream, setDataStream] = useState<string>('0x000000');
    const [metrics, setMetrics] = useState({ a: 84, b: 92, c: 99 });
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    // 1. Lógica original de generación de datos
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

    // 2. Mapeo del ratón 3D a coordenadas del HUD (Parallax)
    useFrame((state) => {
        if (!isActive) return;
        // Convertimos el rango [-1, 1] de Three.js a [0, 100] para el CSS
        const targetX = (state.mouse.x + 1) * 50;
        const targetY = (-state.mouse.y + 1) * 50;
        
        // Suavizado (Lerp sutil)
        setMousePos(prev => ({
            x: prev.x + (targetX - prev.x) * 0.1,
            y: prev.y + (targetY - prev.y) * 0.1
        }));
    });

    return (
        <group>
            {/* FONDO OPACO: Evita que se vea lo que hay detrás de la rueda */}
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#020202" />
            </mesh>

            {/* INTEGRACIÓN DEL HUD ORIGINAL */}
            <Html
                transform
                center
                distanceFactor={8.2}
                position={[0, 0, 0.05]} // Ligeramente adelantado
                style={{
                    width: '800px', // Ancho fijo para mantener proporciones
                    height: '450px',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                    pointerEvents: 'none' // Para que no interfiera con el scroll de la rueda
                }}
            >
                <div className="relative w-full h-full bg-[#020202] rounded-xl overflow-hidden font-mono border border-white/10 select-none">
                    
                    {/* 1. FONDO DE CUADRÍCULA (Parallax original) */}
                    <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                            backgroundSize: '25px 25px',
                            transform: `translate(${(mousePos.x - 50) * -0.3}px, ${(mousePos.y - 50) * -0.3}px)`
                        }}
                    />

                    {/* 2. ANILLOS DE RADAR Y ESCÁNER (Animaciones originales) */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
                        style={{ transform: `translate(${(mousePos.x - 50) * 0.4}px, ${(mousePos.y - 50) * 0.4}px)` }}
                    >
                        {/* Anillo exterior punteado */}
                        <div className="absolute w-[280px] h-[280px] border border-white/20 rounded-full border-dashed animate-[spin_12s_linear_infinite]" />
                        
                        {/* Anillo intermedio */}
                        <div className="absolute w-[200px] h-[200px] border border-cyan-500/30 rounded-full" />
                        
                        {/* Barrido de Radar (Conic Gradient) */}
                        <div className="absolute w-[200px] h-[200px] rounded-full animate-[spin_4s_linear_infinite]" 
                             style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(0, 255, 255, 0.4) 100%)' }} 
                        />

                        {/* Retícula central */}
                        <div className="absolute w-8 h-8 border border-white/40" />
                        <div className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_#00ffff]" />
                    </div>

                    {/* 3. PUNTERO TÁCTICO (Sigue al ratón) */}
                    <div 
                        className="absolute w-[50px] h-[50px] z-20"
                        style={{ 
                            left: `${mousePos.x}%`, top: `${mousePos.y}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                        
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 text-[9px] text-cyan-400 whitespace-nowrap tracking-[2px]">
                            POS_{mousePos.x.toFixed(0)}:{mousePos.y.toFixed(0)}
                        </div>
                    </div>

                    {/* 4. OVERLAYS DE DATOS (HUD) */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between text-[11px] text-white/70 tracking-[2px] z-10">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-cyan-500 font-bold text-xs">AURA.SYS_TARGETING</span>
                                <span>ALG: NEURAL_VOID_V2</span>
                                <span className="text-white/40">HASH: {dataStream}</span>
                            </div>
                            <div className="text-right flex flex-col gap-1 font-bold">
                                <span className="animate-pulse text-white">LIVE_TRACKING</span>
                                <span className="text-[10px] text-cyan-400">{isActive ? 'ACQUIRING...' : 'STANDBY'}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex gap-8">
                                <div className="flex flex-col">
                                    <span className="text-white/30 text-[9px]">CTR_RT</span>
                                    <span className="text-white text-lg font-light">{metrics.a}%</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/30 text-[9px]">CONV_OPT</span>
                                    <span className="text-white text-lg font-light">{metrics.b}%</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white/30 text-[9px]">RET_CORE</span>
                                    <span className="text-cyan-400 text-lg font-bold">{metrics.c}%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] opacity-40">UPLINK_STABLE</span>
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                            </div>
                        </div>
                    </div>

                    {/* Viñeteo interior para profundidad */}
                    <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] pointer-events-none" />
                </div>
            </Html>
        </group>
    );
}
