'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
// 🚀 CORRECCIÓN: Añadidos Environment y useGLTF al import
import { Html, Float, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. COMPONENTE DE ESCÁNER 3D (Movimiento indestructible) ---
function VolumetricScanner({ isActive }: { isActive: boolean }) {
    const vortexRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);

    const sweepTexture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d')!;
        const grad = ctx.createConicGradient(0, 256, 256);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.85, 'rgba(0, 255, 255, 0.5)');
        grad.addColorStop(1, 'rgba(0, 255, 255, 0.9)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(c);
    }, []);

    useFrame((state, delta) => {
        if (!vortexRef.current || !coreRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        vortexRef.current.rotation.z -= delta * 1.5;
        const pulse = 1 + Math.sin(t * 2) * 0.05;
        coreRef.current.scale.set(pulse, pulse, pulse);
    });

    return (
        <group ref={vortexRef} position={[0, 0, 0.1]}>
            <mesh ref={coreRef} rotation={[Math.PI/4, Math.PI/4, 0]}>
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial color="#fcd34d" metalness={1} roughness={0.1} emissive="#ffaa00" emissiveIntensity={0.5} />
            </mesh>
            
            <mesh>
                <circleGeometry args={[4.5, 128]} />
                <meshBasicMaterial 
                    map={sweepTexture} 
                    transparent 
                    blending={THREE.AdditiveBlending} 
                    opacity={isActive ? 0.6 : 0} 
                />
            </mesh>
        </group>
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
        }, 120);
        return () => clearInterval(interval);
    }, [isActive]);

    const neuralGrid = useMemo(() => {
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
            <Environment preset="city" />

            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial map={neuralGrid} transparent={false} opacity={isActive ? 1 : 0.3} />
            </mesh>

            <VolumetricScanner isActive={isActive} />

            <Html
                transform center distanceFactor={8.5} occlude={false}
                position={[0, 0, 0.6]}
                style={{
                    width: '850px',
                    height: '500px',
                    pointerEvents: 'none',
                    opacity: isActive ? 1 : 0
                }}
            >
                <div className="w-full h-full font-mono text-cyan-400 p-12 flex flex-col justify-between select-none border-2 border-cyan-500/20 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-cyan-400 animate-ping" />
                                <h2 className="text-4xl font-black tracking-widest">MARKETING_NODE.OS</h2>
                            </div>
                            <div className="text-[11px] opacity-70 tracking-[2px] flex flex-col">
                                <span>STATUS: TARGET_ACQUISITION_ACTIVE</span>
                                <span>NODE: V.O.I.D_SERVER_NODE_01</span>
                            </div>
                        </div>
                        <div className="text-xs border border-cyan-500 p-2 uppercase bg-cyan-500/10">Neural_Aura_v3.2</div>
                    </div>

                    <div className="flex justify-between items-end border-t border-cyan-500/30 pt-10">
                        <div className="flex gap-16">
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40 uppercase">CTR_RT</span>
                                <span className="text-6xl font-black text-white">{metrics.a}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40 uppercase">CONV_OPT</span>
                                <span className="text-6xl font-black text-white">{metrics.b}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-40 uppercase">LOYALTY_CORE</span>
                                <span className="text-6xl font-black text-cyan-400">{metrics.c}%</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 text-white/50 text-[10px] font-bold">
                            Influence Hash:
                            <div className="text-xs text-white">{dataStream}</div>
                            <div className="flex gap-1.5 opacity-50">
                                {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-4 bg-cyan-500 animate-pulse" style={{animationDelay: `${i*0.1}s`}} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </Html>
        </group>
    );
}

// 🚀 Preload para que el sistema esté listo
useGLTF.preload('/robot_optimus.glb');
