'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const [dataStream, setDataStream] = useState<string>('0x000000');
    const [metrics, setMetrics] = useState({ a: 84, b: 92, c: 99 });

    // 1. Generador de datos (Mismo de siempre)
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

    // 2. Fondo Técnico (Material Simple, NO baked texture compleja)
    const gridTexture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#010810';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        // Dibujar rejilla
        for (let i = 0; i <= 256; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
        }
        return new THREE.CanvasTexture(c);
    }, []);

    return (
        <group>
            {/* LUZ DE APOYO */}
            <ambientLight intensity={isActive ? 0.3 : 0} />
            <pointLight position={[0, 0, 4]} intensity={isActive ? 20 : 0} color="#00ffff" />

            {/* Capa 1: El panel base (Con textura de rejilla) */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshStandardMaterial 
                    map={gridTexture}
                    emissive="#001a2c" // Un brillo sutil azul profundo
                    emissiveIntensity={isActive ? 1 : 0}
                />
            </mesh>

            {/* Capa 2: Interfaz HUD (HTML Súper-Simplificado) */}
            <Html
                transform
                center
                distanceFactor={8.5} // Ajuste para que encaje
                occlude={false}
                position={[0, 0, 0.4]} // Adelantado a Z=0.4
                style={{
                    width: '800px',
                    height: '500px',
                    pointerEvents: 'none',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.6s ease',
                }}
            >
                <div className="w-full h-full font-mono text-cyan-400 p-10 flex flex-col justify-between border border-cyan-500/30">
                    {/* Cabecera */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-2xl font-black">
                                <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
                                MARKETING.OS
                            </div>
                            <div className="text-[10px] opacity-70 tracking-[2px]">Algorithm: Aura_vNeural_Aura</div>
                            <div className="text-[10px] text-white/50">{dataStream}</div>
                        </div>
                        <div className="text-[9px] border border-cyan-500 p-1 uppercase">Acquiring_Data</div>
                    </div>

                    {/* MÉTRICAS (Lo más importante, centrado) */}
                    <div className="flex justify-between items-end">
                        <div className="flex gap-10">
                            <div className="flex flex-col">
                                <span className="text-[9px] opacity-40 uppercase">CTR_CORE</span>
                                <span className="text-5xl font-bold text-white">{metrics.a}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] opacity-40 uppercase">CONV_OPT</span>
                                <span className="text-5xl font-bold text-white">{metrics.b}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] opacity-40 uppercase">RET_CORE</span>
                                <span className="text-5xl font-bold text-cyan-400">{metrics.c}%</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end text-[8px] gap-1 opacity-50">
                            Enlace_Cognitivo_Node
                            <div className="flex gap-1">
                                <div className="w-1 h-3 bg-cyan-500/40 animate-pulse" />
                                <div className="w-1 h-3 bg-cyan-500/40 animate-pulse" />
                                <div className="w-1 h-3 bg-cyan-500/40 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </Html>
        </group>
    );
}
