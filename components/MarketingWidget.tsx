'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. COMPONENTE: OBJETIVOS TÁCTICOS (Puntos con vida) ---
function TacticalTargets({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    const targets = useMemo(() => [
        { pos: [3.5, 2.2, 0.1], id: "0xAF2" },
        { pos: [-4.5, 1.5, 0.1], id: "0xBD9" },
        { pos: [5.2, -1.8, 0.1], id: "0xCE1" },
        { pos: [-3.2, -2.8, 0.1], id: "0x992" },
        { pos: [1.5, -3.5, 0.1], id: "0x11B" },
    ], []);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.children.forEach((child, i) => {
            // Pulso físico de los objetivos
            const s = 1 + Math.sin(t * 4 + i) * 0.25;
            child.scale.set(s, s, 1);
        });
    });

    return (
        <group ref={groupRef}>
            {targets.map((t, i) => (
                <group key={i} position={t.pos as any}>
                    {/* Rombo de objetivo */}
                    <mesh rotation={[0, 0, Math.PI / 4]}>
                        <planeGeometry args={[0.25, 0.25]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
                    </mesh>
                    <Text position={[0.4, 0, 0]} fontSize={0.14} color="#00ffff" anchorX="left">
                        {`NODE_${t.id}`}
                    </Text>
                </group>
            ))}
        </group>
    );
}

// --- 2. COMPONENTE: BARRAS DE PULSO (Infografía 3D) ---
function PulseBars({ isActive }: { isActive: boolean }) {
    const barsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!barsRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        barsRef.current.children.forEach((bar, i) => {
            const val = 1 + Math.sin(t * 5 + i * 0.5) * 1.2;
            bar.scale.y = Math.max(0.1, val);
        });
    });

    return (
        <group ref={barsRef} position={[-7.5, -3.8, 0.1]}>
            {Array.from({ length: 18 }).map((_, i) => (
                <mesh key={i} position={[i * 0.22, 0, 0]}>
                    <planeGeometry args={[0.08, 1]} />
                    <meshBasicMaterial color={i % 2 === 0 ? "#00ffff" : "#ffffff"} transparent opacity={0.5} />
                </mesh>
            ))}
        </group>
    );
}

// --- 3. WIDGET PRINCIPAL ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const sweepRef = useRef<THREE.Mesh>(null);
    const [hex, setHex] = useState('0x000000');

    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setHex('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
        }, 100);
        return () => clearInterval(interval);
    }, [isActive]);

    useFrame((_, delta) => {
        if (sweepRef.current && isActive) sweepRef.current.rotation.z -= delta * 2.5;
    });

    // Construcción de la rejilla de fondo (Geometría pura)
    const gridPoints = useMemo(() => {
        const lines = [];
        for (let x = -8; x <= 8; x += 1) lines.push([[x, -4.7, 0], [x, 4.7, 0]]);
        for (let y = -4.7; y <= 4.7; y += 1) lines.push([[-8, y, 0], [8, y, 0]]);
        return lines;
    }, []);

    return (
        <group>
            {/* FONDO SÓLIDO */}
            <mesh position={[0, 0, -0.05]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#01060b" />
            </mesh>

            {/* REJILLA TÁCTICA */}
            {gridPoints.map((p, i) => (
                <Line key={i} points={p as any} color="#00ffff" lineWidth={0.5} transparent opacity={0.1} />
            ))}

            {/* RADAR: Círculos concéntricos */}
            {[2, 3.5, 5].map((r, i) => (
                <Line
                    key={i}
                    points={new THREE.EllipseCurve(0, 0, r, r, 0, 2 * Math.PI, false, 0).getPoints(64).map(p => [p.x, p.y, 0]) as any}
                    color="#00ffff"
                    lineWidth={1}
                    transparent
                    opacity={0.15}
                />
            ))}

            {/* BARRIDO DEL RADAR */}
            <mesh ref={sweepRef} position={[0, 0, 0.02]}>
                <planeGeometry args={[5, 0.04]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
                <primitive object={new THREE.Object3D()} position={[-2.5, 0, 0]} />
            </mesh>

            {/* OBJETIVOS Y BARRAS */}
            <TacticalTargets isActive={isActive} />
            <PulseBars isActive={isActive} />

            {/* TEXTOS (WebGL SDF: No colapsan nunca) */}
            <group position={[-7.8, 4.1, 0.2]}>
                <Text fontSize={0.45} color="#00ffff" anchorX="left" font="/fonts/GeistMono-Bold.woff">
                    NEURAL_MARKETING_OS
                </Text>
                <Text position={[0, -0.5, 0]} fontSize={0.18} color="#ffffff" anchorX="left" fillOpacity={0.6}>
                    {`SYS_ACQUISITION: ACTIVE\nHASH_LINK: ${hex}`}
                </Text>
            </group>

            <group position={[7.8, -3.8, 0.2]}>
                <Text fontSize={0.9} color="#ffffff" anchorX="right">
                    99.6%
                </Text>
                <Text position={[0, -0.6, 0]} fontSize={0.15} color="#00ffff" anchorX="right" fillOpacity={0.5}>
                    CONVERSION_ACCURACY
                </Text>
            </group>

            <pointLight position={[0, 0, 5]} intensity={isActive ? 15 : 0} color="#00ffff" />
        </group>
    );
}
