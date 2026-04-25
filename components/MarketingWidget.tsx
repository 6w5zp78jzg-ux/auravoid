'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. COMPONENTE DE ESCÁNER (Movimiento 3D nativo) ---
function RadarSweep({ isActive }: { isActive: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Creamos la textura del barrido (un abanico de luz)
    const sweepTexture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d')!;
        const grad = ctx.createConicGradient(0, 256, 256);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.9, 'rgba(0, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(0, 255, 255, 0.8)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(c);
    }, []);

    useFrame((_, delta) => {
        if (!meshRef.current || !isActive) return;
        // Rotación física en el motor 3D, no en CSS
        meshRef.current.rotation.z -= delta * 2;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0.1]}>
            <circleGeometry args={[4, 64]} />
            <meshBasicMaterial 
                map={sweepTexture} 
                transparent 
                blending={THREE.AdditiveBlending} 
                opacity={isActive ? 0.4 : 0} 
            />
        </mesh>
    );
}

// --- 2. PANEL PRINCIPAL ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const [dataStream, setDataStream] = useState<string>('0x000000');
    const [metrics, setMetrics] = useState({ a: 84, b: 92, c: 99 });

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

    const gridTexture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#010810';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 512; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
        }
        return new THREE.CanvasTexture(c);
    }, []);

    return (
        <group>
            {/* FONDO TÉCNICO */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial map={gridTexture} />
            </mesh>

            {/* ESCÁNER ANIMADO (Esto es lo que da vida al panel) */}
            <RadarSweep isActive={isActive} />

            {/* DATOS DINÁMICOS (Html Ultraligero para evitar fallos de Safari) */}
            <Html
                transform
                center
                distanceFactor={8.5}
                position={[0, 0, 0.5]}
                style={{
                    width: '850px',
                    height: '500px',
                    pointerEvents: 'none',
                    opacity: isActive ? 1 : 0
                }}
            >
                <div className="w-full h-full font-mono text-cyan-400 p-12 flex flex-col justify-between border-2 border-cyan-500/20">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-4xl font-black tracking-widest">MARKETING.AI</h2>
                            <div className="text-xs opacity-60">TARGET_ID: {dataStream}</div>
                        </div>
                        <div className="text-xs border border-cyan-500 p-2 animate-pulse bg-cyan-500/10">
                            LIVE_TRACKING_MODE
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-cyan-500/30 pt-10">
                        <div className="flex gap-14">
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40">CTR_CORE</span>
                                <span className="text-6xl font-black text-white">{metrics.a}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40">CONV_RT</span>
                                <span className="text-6xl font-black text-white">{metrics.b}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40">RET_OPT</span>
                                <span className="text-6xl font-black text-cyan-300">{metrics.c}%</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 border-2 border-cyan-500/40 rounded-full border-t-cyan-400 animate-spin" />
                    </div>
                </div>
            </Html>
        </group>
    );
}
