'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [dataStream, setDataStream] = useState<string>('0x000000');
    const [metrics, setMetrics] = useState({ a: 84, b: 92, c: 99 });

    // 1. Generador de datos (Tu lógica original mantenida)
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

    // 2. Fondo de cuadrícula táctica (Generado como textura para rendimiento)
    const gridTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        // Dibujar rejilla
        for (let i = 0; i <= 512; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            {/* CAPA 1: FONDO DE PANTALLA (Negro absoluto con rejilla) */}
            <mesh position={[0, 0, -0.05]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial 
                    color="#020202"
                    map={gridTexture}
                    transparent
                    opacity={isActive ? 1 : 0.3}
                />
            </mesh>

            {/* CAPA 2: INTERFAZ HUD (HTML Transformado) */}
            <Html
                transform
                center
                distanceFactor={8.2}
                occlude={false}
                position={[0, 0, 0.1]} // Un poco adelantado para efecto cristal
                style={{
                    width: '800px',
                    height: '500px',
                    pointerEvents: 'none',
                    opacity: isActive ? 1 : 0,
                    transition: 'all 0.6s ease',
                }}
            >
                <div 
                    className="relative w-full h-full font-mono text-cyan-400 select-none overflow-hidden border border-cyan-500/20 rounded-lg"
                    style={{ background: 'rgba(0, 10, 20, 0.4)' }}
                >
                    {/* Radar Central (Tu CSS original adaptado) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                        <div className="absolute w-[300px] h-[300px] border border-cyan-500/30 rounded-full border-dashed animate-[spin_15s_linear_infinite]" />
                        <div className="absolute w-[200px] h-[200px] border border-cyan-500/50 rounded-full" />
                        <div 
                            className="absolute w-[200px] h-[200px] rounded-full animate-[spin_4s_linear_infinite]" 
                            style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(0, 255, 255, 0.3) 100%)' }} 
                        />
                        <div className="w-10 h-10 border border-cyan-400/50 flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                        </div>
                    </div>

                    {/* HUD: DATOS SUPERIORES */}
                    <div className="absolute top-0 w-full p-8 flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-cyan-500 animate-pulse" />
                                <span className="text-xl font-bold tracking-[4px]">MARKETING.OS</span>
                            </div>
                            <span className="text-[10px] opacity-60 uppercase tracking-[2px]">Algorithm: Neural_Aura_v2.4</span>
                            <span className="text-[10px] opacity-60">HASH: {dataStream}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs block mb-1">SCANNING_MARKET...</span>
                            <div className="w-32 h-1 bg-cyan-900 overflow-hidden">
                                <div className="h-full bg-cyan-400 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
                            </div>
                        </div>
                    </div>

                    {/* HUD: MÉTRICAS INFERIORES */}
                    <div className="absolute bottom-0 w-full p-8 flex justify-between items-end bg-gradient-to-t from-cyan-950/40 to-transparent">
                        <div className="flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-[9px] opacity-50 tracking-[3px]">CTR_OPTIMIZATION</span>
                                <span className="text-2xl font-light">{metrics.a}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] opacity-50 tracking-[3px]">CONVERSION_RT</span>
                                <span className="text-2xl font-light">{metrics.b}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] opacity-50 tracking-[3px]">RETENTION_CORE</span>
                                <span className="text-2xl font-light text-white">{metrics.c}%</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px]">SYNC_STATUS</span>
                                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                            </div>
                            <span className="text-[8px] opacity-40 uppercase">Global_V.O.I.D_Network</span>
                        </div>
                    </div>

                    {/* Esquinas tácticas */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-cyan-500/50" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-cyan-500/50" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-cyan-500/50" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-cyan-500/50" />
                </div>
            </Html>

            {/* Efecto de resplandor cian ambiental en la rueda */}
            <pointLight position={[0, 0, 2]} intensity={isActive ? 8 : 0} color="#00ffff" distance={10} />
        </group>
    );
}
