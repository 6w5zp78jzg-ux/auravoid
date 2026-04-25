'use client';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. NODOS DINÁMICOS (Los objetivos con "vida") ---
function TacticalNodes({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    // Generamos 8 objetivos tácticos con IDs reales
    const nodes = useMemo(() => [
        { pos: [-5, 2, 0.5], id: "0xAD-22", label: "USER_CLUST" },
        { pos: [4, 3, 0.5], id: "0xBC-99", label: "MARKET_A" },
        { pos: [6, -1, 0.5], id: "0xFE-11", label: "CONV_NODE" },
        { pos: [-3, -3, 0.5], id: "0x99-XX", label: "LEAD_SRC" },
        { pos: [2, -2.5, 0.5], id: "0x00-RT", label: "ROI_SYNC" },
        { pos: [-6, 0.5, 0.5], id: "0xKY-01", label: "FLUX_ID" },
    ], []);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.children.forEach((child, i) => {
            // El nodo parpadea y flota
            const s = 0.8 + Math.sin(t * 3 + i) * 0.2;
            child.scale.set(s, s, s);
        });
    });

    return (
        <group ref={groupRef}>
            {nodes.map((n, i) => (
                <group key={i} position={n.pos as any}>
                    {/* El punto de mira */}
                    <mesh>
                        <ringGeometry args={[0.2, 0.25, 4]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
                    </mesh>
                    {/* El ID del objetivo */}
                    <Text 
                        position={[0.4, 0, 0]} 
                        fontSize={0.15} 
                        color="#00ffff" 
                        anchorX="left"
                    >
                        {`${n.label}\n${n.id}`}
                    </Text>
                </group>
            ))}
        </group>
    );
}

// --- 2. GRÁFICOS DE FLUJO (Infografías animadas) ---
function MarketInfographics({ isActive }: { isActive: boolean }) {
    const barsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!barsRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        barsRef.current.children.forEach((bar, i) => {
            const val = 1 + Math.sin(t * 4 + i * 0.5) * 0.8;
            bar.scale.y = val;
        });
    });

    return (
        <group ref={barsRef} position={[-7, -3.5, 0.5]}>
            {Array.from({ length: 12 }).map((_, i) => (
                <mesh key={i} position={[i * 0.25, 0, 0]}>
                    <boxGeometry args={[0.1, 1, 0.05]} />
                    <meshBasicMaterial color={i % 2 === 0 ? "#00ffff" : "#ffffff"} />
                </mesh>
            ))}
            <Text position={[0, 1.2, 0]} fontSize={0.18} color="#00ffff" anchorX="left">
                REAL_TIME_MARKET_FLUX
            </Text>
        </group>
    );
}

// --- 3. WIDGET PRINCIPAL ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const radarLineRef = useRef<THREE.Mesh>(null);
    const [hex, setHex] = useState("0x000000");

    useEffect(() => {
        if (!isActive) return;
        const timer = setInterval(() => {
            setHex("0x" + Math.random().toString(16).slice(2, 8).toUpperCase());
        }, 150);
        return () => clearInterval(timer);
    }, [isActive]);

    useFrame((_, delta) => {
        if (radarLineRef.current && isActive) {
            radarLineRef.current.rotation.z -= delta * 3;
        }
    });

    return (
        <group>
            <Environment preset="city" />

            {/* FONDO TÉCNICO CON LUZ */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshStandardMaterial 
                    color="#010a12" 
                    emissive="#002233" 
                    emissiveIntensity={isActive ? 0.6 : 0.1} 
                />
            </mesh>

            {/* RED DE OBJETIVOS Y GRÁFICOS */}
            <TacticalNodes isActive={isActive} />
            <MarketInfographics isActive={isActive} />

            {/* RADAR DE ESCANEO (Línea de barrido) */}
            <group position={[0, 0, 0.1]}>
                <mesh ref={radarLineRef}>
                    <planeGeometry args={[4.5, 0.04]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
                </mesh>
                <mesh>
                    <ringGeometry args={[4.45, 4.5, 64]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
                </mesh>
            </group>

            {/* TEXTOS DE CABECERA (Sin error de opacity) */}
            <group position={[-7.5, 3.8, 0.6]}>
                <Text fontSize={0.45} color="#00ffff" anchorX="left" font="/fonts/GeistMono-Bold.woff">
                    NEURAL_MARKETING_INTERFACE
                </Text>
                <Text position={[0, -0.5, 0]} fontSize={0.18} color="#ffffff" anchorX="left">
                    {`SYSTEM_STATUS: ACTIVE\nACQUIRING_HASH: ${hex}`}
                </Text>
            </group>

            {/* MÉTRICAS DE VIDA (En la derecha) */}
            <group position={[5, -3.5, 0.6]}>
                <Text position={[0, 0.8, 0]} fontSize={0.5} color="#ffffff" anchorX="right">
                    98.4%
                </Text>
                <Text position={[0, 0.3, 0]} fontSize={0.12} color="#00ffff" anchorX="right">
                    EFFICIENCY_CORE
                </Text>
            </group>

            <pointLight position={[0, 0, 5]} intensity={isActive ? 20 : 0} color="#00ffff" />
        </group>
    );
}
