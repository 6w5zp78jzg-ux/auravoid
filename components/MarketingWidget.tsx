'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function MarketingWidget({ isActive }: { isActive: boolean }) {
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
        }, 120); // Un poco más lento para mejorar rendimiento
        return () => clearInterval(interval);
    }, [isActive]);

    // 2. Textura Técnica (Rejilla y Radar) - Mantenida para identidad visual
    const gridTexture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 256;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#010812';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        // Rejilla
        for (let i = 0; i <= 512; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
        }
        for (let i = 0; i <= 256; i += 32) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
        }
        // Radar Círculos
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.beginPath(); ctx.arc(256, 128, 100, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(256, 128, 60, 0, Math.PI*2); ctx.stroke();
        
        return new THREE.CanvasTexture(c);
    }, []);

    return (
        <group>
            {/* LUZ AMBIENTAL LOCAL (Sutil) */}
            <ambientLight intensity={isActive ? 0.3 : 0} />

            {/* CAPA 1: EL PANEL BASE (En Z=0, Material Básico sin luces para rendimiento) */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial 
                    map={gridTexture}
                    transparent={false}
                    opacity={isActive ? 1 : 0.2}
                />
            </mesh>

            {/* CAPA 2: DATOS DINÁMICOS (Adelantados agresivamente a Z=0.6) */}
            <Html
                transform
                center
                distanceFactor={8.5} // Ajuste de escala para el marco
                occlude={false} // 🚀 CRUCIAL: Desactivar oclusión
                position={[0, 0, 0.6]} // 🚀 Separación masiva para forzar renderizado
                style={{
                    width: '800px',
                    height: '500px',
                    pointerEvents: 'none',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.6s ease',
                }}
            >
                {/* HUD: Texto de alta visibilidad (Cian sobre fondo casi negro) */}
                <div className="w-full h-full font-mono text-cyan-400 p-12 flex flex-col justify-between select-none">
                    
                    {/* Sección Superior: System Info */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
                                <span className="text-3xl font-black tracking-tighter">MARKETING_NODE</span>
                            </div>
                            <span className="text-[11px] opacity-70 flex flex-col">
                                <span>STATUS: ACTIVE_SCANNING</span>
                                <span>STREAM: {dataStream}</span>
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] border border-cyan-500 p-2 uppercase">Neural_Aura_v3.1</div>
                        </div>
                    </div>

                    {/* Barrido de Radar (Sutil CSS) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <div 
                            className="w-[300px] h-[300px] rounded-full animate-[spin_5s_linear_infinite]" 
                            style={{ background: 'conic-gradient(from 0deg, transparent 70%, #00ffff 100%)' }} 
                        />
                    </div>

                    {/* Sección Inferior: Métricas Clave (Alta Visibilidad) */}
                    <div className="flex justify-between items-end border-t border-cyan-500/20 pt-8 z-10">
                        <div className="flex gap-12">
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40 uppercase tracking-[4px]">CTR_CORE</span>
                                <span className="text-5xl font-extrabold text-white">{metrics.a}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40 uppercase tracking-[4px]">CONV_OPT</span>
                                <span className="text-5xl font-extrabold text-white">{metrics.b}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40 uppercase tracking-[4px]">LOYALTY</span>
                                <span className="text-5xl font-extrabold text-cyan-400">{metrics.c}%</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end text-[9px] gap-1 opacity-50">
                            GLOBAL_NETWORK_SYNC
                            <div className="flex gap-1">
                                {[1,2,3].map(i => <div key={i} className="w-1.5 h-3 bg-cyan-500 animate-pulse" style={{animationDelay: `${i*0.1}s`}} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </Html>
        </group>
    );
}
