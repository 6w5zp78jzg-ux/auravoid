'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. COMPONENTE: OBJETIVOS TÁCTICOS (Puntos con vida) ---
function TacticalTargets({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    const targets = useMemo(() => [
        { pos: [3.5, 2, 0.2], label: "TRGT_ALPHA", id: "0xAF2" },
        { pos: [-4.2, 1.8, 0.2], label: "SEG_USER_B", id: "0xBD9" },
        { pos: [5.1, -1.5, 0.2], label: "ROI_NODE", id: "0xCE1" },
        { pos: [-3.8, -2.2, 0.2], label: "CONV_GATE", id: "0x992" },
        { pos: [2.2, -3.1, 0.2], label: "MKT_FLUX", id: "0x11B" },
    ], []);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.children.forEach((child, i) => {
            // Pulso rítmico de los objetivos
            const s = 1 + Math.sin(t * 5 + i) * 0.2;
            child.scale.set(s, s, 1);
        });
    });

    return (
        <group ref={groupRef}>
            {targets.map((t, i) => (
                <group key={i} position={t.pos as any}>
                    {/* Retícula de apuntado */}
                    <mesh rotation={[0, 0, Math.PI / 4]}>
                        <planeGeometry args={[0.25, 0.25]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
                    </mesh>
                    <Text 
                        position={[0.4, 0, 0]} 
                        fontSize={0.12} 
                        color="#00ffff" 
                        anchorX="left"
                        font="/fonts/GeistMono-Bold.woff"
                    >
                        {`${t.label}\n${t.id}`}
                    </Text>
                </group>
            ))}
        </group>
    );
}

// --- 2. COMPONENTE: BARRAS DE PULSO (Infografías dinámicas) ---
function PulseCharts({ isActive }: { isActive: boolean }) {
    const barsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!barsRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        barsRef.current.children.forEach((bar, i) => {
            const val = 1 + Math.sin(t * 6 + i * 0.8) * 0.9;
            bar.scale.y = val;
        });
    });

    return (
        <group ref={barsRef} position={[-7.5, -3.5, 0.2]}>
            {Array.from({ length: 16 }).map((_, i) => (
                <mesh key={i} position={[i * 0.22, 0, 0]}>
                    <planeGeometry args={[0.08, 1]} />
                    <meshBasicMaterial color={i % 2 === 0 ? "#00ffff" : "#ffffff"} transparent opacity={0.6} />
                </mesh>
            ))}
            <Text position={[0, 1.2, 0]} fontSize={0.14} color="#00ffff" anchorX="left" fillOpacity={0.5}>
                NEURAL_PULSE_MARKET_FLUX
            </Text>
        </group>
    );
}

// --- 3. WIDGET PRINCIPAL ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const sweepRef = useRef<THREE.Mesh>(null);
    const contentRef = useRef<THREE.Group>(null);
    const [hex, setHex] = useState('0x000000');

    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setHex('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
        }, 100);
        return () => clearInterval(interval);
    }, [isActive]);

    useFrame((state, delta) => {
        if (!isActive) return;
        
        // Movimiento de barrido del radar
        if (sweepRef.current) sweepRef.current.rotation.z -= delta * 3;

        // Parallax suave del HUD completo
        if (contentRef.current) {
            contentRef.current.position.x = THREE.MathUtils.lerp(contentRef.current.position.x, state.mouse.x * 0.4, 0.1);
            contentRef.current.position.y = THREE.MathUtils.lerp(contentRef.current.position.y, state.mouse.y * 0.2, 0.1);
        }
    });

    return (
        <group>
            <Environment preset="city" />

            {/* FONDO OPACO */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshStandardMaterial color="#01060b" emissive="#001a2c" emissiveIntensity={0.5} />
            </mesh>

            {/* TODO EL CONTENIDO DINÁMICO */}
            <group ref={contentRef}>
                
                {/* RADAR CENTRAL (Círculos decorativos) */}
                {[2.5, 3.8, 4.8].map((r, i) => (
                    <Line
                        key={i}
                        points={new THREE.EllipseCurve(0, 0, r, r, 0, 2 * Math.PI, false, 0).getPoints(64).map(p => [p.x, p.y, 0]) as any}
                        color="#00ffff"
                        lineWidth={0.5}
                        transparent
                        opacity={0.15}
                    />
                ))}

                {/* LÍNEA DE BARRIDO */}
                <mesh ref={sweepRef} position={[0, 0, 0.05]}>
                    <planeGeometry args={[4.8, 0.04]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
                    <primitive object={new THREE.Object3D()} position={[-2.4, 0, 0]} />
                </mesh>

                {/* INFOGRAFÍAS Y OBJETIVOS */}
                <TacticalTargets isActive={isActive} />
                <PulseCharts isActive={isActive} />

                {/* TEXTOS HUD (Sin error de TS) */}
                <group position={[-7.8, 4.2, 0.3]}>
                    <Text fontSize={0.5} color="#00ffff" anchorX="left" font="/fonts/GeistMono-Bold.woff">
                        MARKETING_TARGETING.OS
                    </Text>
                    <Text position={[0, -0.6, 0]} fontSize={0.18} color="#ffffff" anchorX="left" fillOpacity={0.6}>
                        {`MODE: LIVE_ACQUISITION\nUPLINK_HASH: ${hex}`}
                    </Text>
                </group>

                {/* DATOS DE PRECISIÓN */}
                <group position={[7.8, -3.8, 0.3]}>
                    <Text fontSize={1} color="#ffffff" anchorX="right" font="/fonts/GeistMono-Bold.woff">
                        99.4%
                    </Text>
                    <Text position={[0, -0.6, 0]} fontSize={0.15} color="#00ffff" anchorX="right" fillOpacity={0.5}>
                        PSYCHOLOGICAL_ACCURACY
                    </Text>
                </group>

            </group>

            <pointLight position={[0, 0, 4]} intensity={isActive ? 15 : 0} color="#00ffff" />
        </group>
    );
}
