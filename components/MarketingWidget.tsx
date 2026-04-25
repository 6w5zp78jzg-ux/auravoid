'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. LOS OBJETIVOS (Vida del Radar) ---
function RadarTargets({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    // Nodos de datos que aparecen en el radar
    const nodes = useMemo(() => [
        { pos: [3, 2, 0.1], id: 'TRGT_01', color: '#00ffff' },
        { pos: [-4, -2, 0.1], id: 'TRGT_02', color: '#ff00ff' },
        { pos: [5, -1, 0.1], id: 'TRGT_03', color: '#00ffff' },
        { pos: [-2, 3, 0.1], id: 'TRGT_04', color: '#ffffff' },
    ], []);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.children.forEach((obj, i) => {
            // Cada objetivo "pulsa" con vida
            const s = 1 + Math.sin(t * 5 + i) * 0.2;
            obj.scale.set(s, s, 1);
        });
    });

    return (
        <group ref={groupRef}>
            {nodes.map((n, i) => (
                <group key={i} position={n.pos as any}>
                    {/* El punto en el radar */}
                    <mesh>
                        <planeGeometry args={[0.3, 0.3]} />
                        <meshBasicMaterial color={n.color} transparent opacity={0.8} />
                    </mesh>
                    {/* Etiqueta de ID del objetivo */}
                    <Text position={[0.5, 0, 0]} fontSize={0.12} color={n.color} anchorX="left" font="/fonts/GeistMono-Bold.woff">
                        {n.id}
                    </Text>
                </group>
            ))}
        </group>
    );
}

// --- 2. INFOGRAFÍAS DINÁMICAS (Barras de "Vida" del mercado) ---
function MarketHealthBars({ isActive }: { isActive: boolean }) {
    const barsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!barsRef.current || !isActive) return;
        barsRef.current.children.forEach((bar, i) => {
            const t = state.clock.getElapsedTime();
            const val = Math.abs(Math.sin(t * 3 + i * 0.5)) * 2 + 0.2;
            bar.scale.y = val;
        });
    });

    return (
        <group ref={barsRef} position={[-7, -3.5, 0.2]}>
            {Array.from({ length: 15 }).map((_, i) => (
                <mesh key={i} position={[i * 0.2, 0, 0]}>
                    <planeGeometry args={[0.1, 1]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
                </mesh>
            ))}
            <Text position={[0, 1.8, 0]} fontSize={0.15} color="#00ffff" anchorX="left">
                MARKET_PULSE_ANALYSIS
            </Text>
        </group>
    );
}

// --- 3. WIDGET PRINCIPAL ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const sweepRef = useRef<THREE.Mesh>(null);
    const [hexCode, setHexCode] = useState('0x000000');

    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setHexCode('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
        }, 100);
        return () => clearInterval(interval);
    }, [isActive]);

    useFrame((_, delta) => {
        if (sweepRef.current && isActive) {
            sweepRef.current.rotation.z -= delta * 3; // Barrido rápido
        }
    });

    return (
        <group>
            <Environment preset="city" />

            {/* FONDO: Rejilla técnica */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshStandardMaterial color="#01050a" emissive="#001a2c" emissiveIntensity={0.5} />
            </mesh>

            {/* ELEMENTOS 3D ACTIVOS */}
            <RadarTargets isActive={isActive} />
            <MarketHealthBars isActive={isActive} />

            {/* ESCÁNER DE RADAR */}
            <mesh ref={sweepRef} position={[0, 0, 0.05]}>
                <circleGeometry args={[4.5, 64]} />
                <meshBasicMaterial 
                    color="#00ffff" 
                    transparent 
                    opacity={isActive ? 0.1 : 0} 
                />
                {/* La línea de escaneo es un plano físico */}
                <mesh position={[2.25, 0, 0.01]}>
                    <planeGeometry args={[4.5, 0.05]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>
            </mesh>

            {/* HUD PRINCIPAL (Textos nativos que no fallan) */}
            <group position={[-7.5, 4, 0.5]}>
                <Text fontSize={0.5} color="#00ffff" anchorX="left" font="/fonts/GeistMono-Bold.woff">
                    MARKETING_TARGETING_OS
                </Text>
                <Text position={[0, -0.6, 0]} fontSize={0.2} color="#ffffff" anchorX="left">
                    {`SYS_STATUS: ACTIVE\nSTREAM_ID: ${hexCode}`}
                </Text>
            </group>

            {/* LOG DE EVENTOS (Html muy pequeño y seguro para el iPad) */}
            <Html position={[4, 3, 0.5]} transform distanceFactor={10}>
                <div className="font-mono text-[10px] text-cyan-400 bg-black/60 p-4 border border-cyan-500/30 w-48">
                    <div className="animate-pulse mb-2 text-[8px] opacity-50">LOG_ACTIVITY:</div>
                    <div className="flex flex-col gap-1 text-[7px]">
                        <span>{'>'} ANALYZING_USER_SEG_A</span>
                        <span>{'>'} CONVERSION_PEAK: 92%</span>
                        <span>{'>'} ROI_PREDICTION: +14%</span>
                        <div className="mt-2 w-full h-1 bg-cyan-900">
                            <div className="h-full bg-cyan-400 animate-pulse" style={{width: '65%'}} />
                        </div>
                    </div>
                </div>
            </Html>

            <pointLight position={[0, 0, 5]} intensity={isActive ? 15 : 0} color="#00ffff" />
        </group>
    );
}
