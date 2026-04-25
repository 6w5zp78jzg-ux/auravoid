'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. NODOS DE OBJETIVO (Los "Targets" del Radar) ---
function TacticalTargets({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    // Generamos 6 objetivos fijos con datos aleatorios
    const targets = useMemo(() => [
        { pos: [3, 2, 0.2], id: "0xAB4F", label: "NODE_ALPHA" },
        { pos: [-4, 1.5, 0.2], id: "0x2D1E", label: "USER_SEG_A" },
        { pos: [2, -2.5, 0.2], id: "0x9F22", label: "CONV_GATE" },
        { pos: [-3, -2, 0.2], id: "0x11B0", label: "LEAD_GEN" },
        { pos: [5, 0, 0.2], id: "0xCC88", label: "MKT_FLUX" },
        { pos: [-5, -3, 0.2], id: "0xEE44", label: "CORE_SYNC" },
    ], []);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        // Sutil flotación de los objetivos
        groupRef.current.children.forEach((child, i) => {
            child.position.y += Math.sin(t + i) * 0.002;
        });
    });

    return (
        <group ref={groupRef}>
            {targets.map((target, i) => (
                <group key={i} position={target.pos as any}>
                    {/* Punto de mira */}
                    <mesh>
                        <ringGeometry args={[0.15, 0.18, 4]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
                    </mesh>
                    {/* Etiqueta flotante */}
                    <Html distanceFactor={10} position={[0.3, 0.3, 0]}>
                        <div className="flex flex-col font-mono text-[8px] text-cyan-400 bg-black/40 p-1 border-l border-cyan-500 whitespace-nowrap">
                            <span className="font-bold">{target.label}</span>
                            <span className="opacity-70">{target.id}</span>
                            <span className="text-[6px] text-green-400">ACQUIRING...</span>
                        </div>
                    </Html>
                </group>
            ))}
        </group>
    );
}

// --- 2. BARRIDO DE RADAR (Sin esfera, solo luz) ---
function RadarScanner({ isActive }: { isActive: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d')!;
        const grad = ctx.createConicGradient(0, 256, 256);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.9, 'rgba(0, 255, 255, 0.3)');
        grad.addColorStop(1, 'rgba(0, 255, 255, 0.8)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(c);
    }, []);

    useFrame((_, delta) => {
        if (meshRef.current && isActive) meshRef.current.rotation.z -= delta * 2.5;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0.1]}>
            <circleGeometry args={[4.5, 64]} />
            <meshBasicMaterial map={texture} transparent blending={THREE.AdditiveBlending} opacity={isActive ? 0.3 : 0} />
        </mesh>
    );
}

// --- 3. COMPONENTE PRINCIPAL ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const [dataStream, setDataStream] = useState('0x000000');
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

    return (
        <group>
            <Environment preset="city" />

            {/* Fondo de Rejilla */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#01060b" />
            </mesh>

            {/* Elementos Tácticos 3D */}
            <RadarScanner isActive={isActive} />
            <TacticalTargets isActive={isActive} />

            {/* INFOGRAFÍA HUD (HTML Adelantado) */}
            <Html
                transform center distanceFactor={8.5}
                position={[0, 0, 0.5]}
                style={{ width: '850px', height: '500px', pointerEvents: 'none', opacity: isActive ? 1 : 0 }}
            >
                <div className="w-full h-full font-mono text-cyan-400 p-10 flex flex-col justify-between border-2 border-cyan-500/20">
                    
                    {/* Header: Status Log */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-black tracking-tighter">AURA_VOID: NEURAL NETWORK SYNC</h2>
                            <div className="text-[9px] text-white/50 space-y-1">
                                <div>STATUS: Acquiring Node...</div>
                                <div className="text-cyan-500 underline">Influence Hash: {dataStream}</div>
                            </div>
                        </div>
                        <div className="text-right text-[8px] opacity-60">
                            COORD_X: 52.11 / COORD_Y: 09.42<br/>
                            V.O.I.D. SYSTEM ACTIVE
                        </div>
                    </div>

                    {/* Infografía Inferior: Gráficos de vida/métricas */}
                    <div className="flex justify-between items-end border-t border-cyan-500/30 pt-6">
                        <div className="flex gap-12">
                            {/* Métrica A con mini-gráfico */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] opacity-40 uppercase">CTR/A: {metrics.a}</span>
                                <div className="flex items-end gap-[2px] h-8">
                                    {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                                        <div key={i} className="w-2 bg-cyan-500" style={{ height: `${h * 100}%` }} />
                                    ))}
                                </div>
                            </div>
                            {/* Métrica B */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] opacity-40 uppercase">CONV/B: {metrics.b}</span>
                                <div className="flex items-end gap-[2px] h-8">
                                    {[0.8, 0.3, 0.6, 0.5, 0.8].map((h, i) => (
                                        <div key={i} className="w-2 bg-white" style={{ height: `${h * 100}%` }} />
                                    ))}
                                </div>
                            </div>
                            {/* Métrica C */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] opacity-40 uppercase">RET/C: {metrics.c}</span>
                                <div className="w-24 h-1 bg-cyan-900 mt-4 overflow-hidden">
                                    <div className="h-full bg-cyan-400 animate-pulse" style={{ width: `${metrics.c}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* Indicador de Sincronización */}
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-bold animate-pulse">DATA_V.I.D.A SYNCING</span>
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </Html>
        </group>
    );
}
