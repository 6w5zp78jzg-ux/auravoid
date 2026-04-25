'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const [dataStream, setDataStream] = useState<string>('0x000000');
    const [metrics, setMetrics] = useState({ a: 84, b: 92, c: 99 });

    // 1. Generador de datos
    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setDataStream('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
            setMetrics({
                a: Math.floor(80 + Math.random() * 19),
                b: Math.floor(85 + Math.random() * 14),
                c: Math.floor(95 + Math.random() * 5),
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isActive]);

    // 2. TEXTURA TÉCNICA (Fondo + Radar estático para evitar fallos de render)
    const techTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        
        // Fondo base
        ctx.fillStyle = '#01080f';
        ctx.fillRect(0, 0, 1024, 512);
        
        // Rejilla Cian
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 1024; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        }
        for (let i = 0; i <= 512; i += 40) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
        }

        // Radar Circular Estático (Decorativo)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.beginPath(); ctx.arc(512, 256, 180, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(512, 256, 120, 0, Math.PI * 2); ctx.stroke();
        
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            {/* LUZ DE APOYO */}
            <pointLight position={[0, 0, 4]} intensity={isActive ? 25 : 0} color="#00ffff" />

            {/* CAPA 1: EL PANEL (Ahora con la textura técnica incorporada) */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshStandardMaterial 
                    map={techTexture}
                    emissive="#00ffff"
                    emissiveIntensity={isActive ? 0.15 : 0}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* CAPA 2: DATOS DINÁMICOS (HTML Ultraligero) */}
            <Html
                transform
                center
                distanceFactor={8.5} // Ajustado para que encaje
                occlude={false}
                position={[0, 0, 0.2]} // Un poco por delante del panel
                style={{
                    width: '800px',
                    height: '500px',
                    pointerEvents: 'none',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                }}
            >
                <div className="w-full h-full font-mono text-cyan-400 p-10 flex flex-col justify-between border border-cyan-500/20">
                    
                    {/* CABECERA */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-cyan-400 animate-pulse" />
                                <span className="text-2xl font-black tracking-tighter">MARKETING_NODE</span>
                            </div>
                            <span className="text-[10px] opacity-60">ALGO_TARGET: AURA_V3</span>
                            <span className="text-[10px] text-white/40 font-bold uppercase">Hash_Stream: {dataStream}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] border border-cyan-500 px-2 py-1">ACQUIRING_LIVE_DATA</div>
                        </div>
                    </div>

                    {/* RADAR ANIMADO (Solo el barrido por CSS) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div 
                            className="w-[280px] h-[280px] rounded-full animate-[spin_4s_linear_infinite]" 
                            style={{ background: 'conic-gradient(from 0deg, transparent 70%, #00ffff 100%)' }} 
                        />
                    </div>

                    {/* MÉTRICAS (Lo más importante) */}
                    <div className="flex justify-between items-end z-10">
                        <div className="flex gap-10">
                            <div className="flex flex-col">
                                <span className="text-[9px] opacity-50 uppercase tracking-[3px]">CTR_CORE</span>
                                <span className="text-5xl font-bold text-white">{metrics.a}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] opacity-50 uppercase tracking-[3px]">CONV_OPT</span>
                                <span className="text-5xl font-bold text-white">{metrics.b}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] opacity-50 uppercase tracking-[3px]">LOYALTY</span>
                                <span className="text-5xl font-bold text-cyan-400">{metrics.c}%</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] opacity-40">ENLACE_COGNITIVO_SYNC</span>
                            <div className="flex gap-1">
                                {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-cyan-500/40 animate-pulse" style={{animationDelay: `${i*0.2}s`}} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </Html>
        </group>
    );
}
