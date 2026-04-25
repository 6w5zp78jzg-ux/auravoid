'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const [dataStream, setDataStream] = useState<string>('0x000000');
    const [metrics, setMetrics] = useState({ a: 84, b: 92, c: 99 });

    // 1. Generador de datos (Tu lógica original)
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

    return (
        <group>
            {/* 💡 LUZ LOCAL POTENCIADA: Para que el panel no sea un agujero negro */}
            <pointLight position={[0, 0, 5]} intensity={isActive ? 30 : 0} color="#00ffff" />
            <ambientLight intensity={isActive ? 0.5 : 0} />

            {/* CAPA 1: FONDO TÉCNICO (Material con luz propia) */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshStandardMaterial 
                    color="#000810" 
                    emissive="#001a2c" // Luz azul muy sutil de fondo
                    emissiveIntensity={isActive ? 1 : 0}
                    roughness={0.3}
                    metalness={0.8}
                />
            </mesh>

            {/* CAPA 2: INTERFAZ HUD (Adelantada a Z=0.5 para Safari) */}
            <Html
                transform
                center
                distanceFactor={8.2}
                occlude={false}
                position={[0, 0, 0.5]} // 🚀 Adelantado para evitar el panel negro
                style={{
                    width: '800px',
                    height: '500px',
                    pointerEvents: 'none',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.6s ease-in-out',
                }}
            >
                <div 
                    className="relative w-full h-full font-mono text-cyan-400 select-none flex flex-col justify-between p-10 border-2 border-cyan-500/30 rounded-xl"
                    style={{ 
                        background: 'rgba(2, 10, 20, 0.9)', // Fondo casi opaco para forzar visibilidad
                        boxShadow: 'inset 0 0 100px rgba(0, 255, 255, 0.1)'
                    }}
                >
                    {/* Radar Central Mejorado */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                        <div className="absolute w-[350px] h-[350px] border-2 border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                        <div className="absolute w-[250px] h-[250px] border border-cyan-500/40 rounded-full" />
                        <div 
                            className="absolute w-[250px] h-[250px] rounded-full animate-[spin_5s_linear_infinite]" 
                            style={{ background: 'conic-gradient(from 0deg, transparent 60%, rgba(0, 255, 255, 0.4) 100%)' }} 
                        />
                    </div>

                    {/* SECCIÓN SUPERIOR: SYSTEM STATUS */}
                    <div className="z-10 flex justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-cyan-400 animate-ping" />
                                <h2 className="text-3xl font-bold tracking-[6px]">MARKETING_AI</h2>
                            </div>
                            <div className="text-[11px] opacity-70 flex flex-col tracking-widest">
                                <span>STATUS: ACTIVE_TARGETING</span>
                                <span>STREAM: {dataStream}</span>
                                <span className="text-white/40">NODE: V.O.I.D_SERVER_01</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="px-3 py-1 border border-cyan-500 text-[10px] bg-cyan-500/10">
                                ENLACE COGNITIVO_ON
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN INFERIOR: MÉTRICAS DATA */}
                    <div className="z-10 flex justify-between items-end border-t border-cyan-500/20 pt-8">
                        <div className="flex gap-12">
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40 uppercase tracking-[4px]">CTR_RT</span>
                                <span className="text-4xl font-light text-white">{metrics.a}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40 uppercase tracking-[4px]">CONV_OPT</span>
                                <span className="text-4xl font-light text-white">{metrics.b}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40 uppercase tracking-[4px]">RET_SCORE</span>
                                <span className="text-4xl font-bold text-cyan-400 shadow-cyan-500">{metrics.c}%</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-green-400 text-[10px] font-bold">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                LIVE_FEED
                            </div>
                            <span className="text-[8px] opacity-30">© AURAVOID_MARKETING_UNIT</span>
                        </div>
                    </div>

                    {/* Esquinas tácticas clásicas */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/40" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/40" />
                </div>
            </Html>
        </group>
    );
}
