'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. COMPONENTE: TARGETS (Los objetivos que "viven" en el radar) ---
function TacticalTargets({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    // Generamos posiciones tácticas fijas
    const targets = useMemo(() => [
        { pos: [3.2, 1.8, 0.2], id: "0xAF2" },
        { pos: [-4, 2.2, 0.2], id: "0xBD9" },
        { pos: [5, -1.2, 0.2], id: "0xCE1" },
        { pos: [-3.5, -2.5, 0.2], id: "0x992" },
        { pos: [1.8, -3.2, 0.2], id: "0x11B" },
    ], []);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.children.forEach((child, i) => {
            // Animación de pulso (escala) para que parezcan vivos
            const s = 1 + Math.sin(t * 5 + i) * 0.2;
            child.scale.set(s, s, 1);
        });
    });

    return (
        <group ref={groupRef}>
            {targets.map((t, i) => (
                <group key={i} position={t.pos as any}>
                    {/* El rombo del objetivo */}
                    <mesh rotation={[0, 0, Math.PI / 4]}>
                        <planeGeometry args={[0.25, 0.25]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
                    </mesh>
                    {/* ID del objetivo */}
                    <Text position={[0.4, 0, 0]} fontSize={0.12} color="#00ffff" anchorX="left" font="/fonts/GeistMono-Bold.woff">
                        {`TARGET\n${t.id}`}
                    </Text>
                </group>
            ))}
        </group>
    );
}

// --- 2. COMPONENTE: INFOGRAFÍAS (Barras de datos dinámicas) ---
function MarketPulse({ isActive }: { isActive: boolean }) {
    const barsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!barsRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        barsRef.current.children.forEach((bar, i) => {
            // Cada barra sube y baja a una velocidad distinta
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
            <Text position={[0, 1.3, 0]} fontSize={0.15} color="#00ffff" anchorX="left" fillOpacity={0.5}>
                NEURAL_DATA_PULSE
            </Text>
        </group>
    );
}

// --- 3. WIDGET PRINCIPAL ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const sweepRef = useRef<THREE.Mesh>(null);
    const contentRef = useRef<THREE.Group>(null);
    const [hex, setHex] = useState('0x000000');

    // Generador de hashes (Vida en los textos)
    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setHex('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
        }, 120);
        return () => clearInterval(interval);
    }, [isActive]);

    useFrame((state, delta) => {
        if (!isActive) return;
        // Barrido rápido del radar
        if (sweepRef.current) sweepRef.current.rotation.z -= delta * 3;

        // Parallax suave: el HUD se inclina con el ratón
        if (contentRef.current) {
            contentRef.current.position.x = THREE.MathUtils.lerp(contentRef.current.position.x, state.mouse.x * 0.4, 0.1);
            contentRef.current.position.y = THREE.MathUtils.lerp(contentRef.current.position.y, state.mouse.y * 0.2, 0.1);
        }
    });

    return (
        <group>
            <Environment preset="city" />

            {/* FONDO SÓLIDO (La pantalla) */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshStandardMaterial color="#01060b" emissive="#001a2c" emissiveIntensity={0.5} />
            </mesh>

            <group ref={contentRef}>
                {/* LÍNEAS DE RADAR (Círculos decorativos) */}
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

                {/* EL ESCÁNER (Línea de barrido) */}
                <mesh ref={sweepRef} position={[0, 0, 0.05]}>
                    <planeGeometry args={[4.8, 0.04]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
                    <primitive object={new THREE.Object3D()} position={[-2.4, 0, 0]} />
                </mesh>

                {/* INFOGRAFÍAS Y OBJETIVOS */}
                <TacticalTargets isActive={isActive} />
                <MarketPulse isActive={isActive} />

                {/* TEXTOS (SDF nativos, no fallan en iPad) */}
                <group position={[-7.8, 4.2, 0.3]}>
                    <Text fontSize={0.5} color="#00ffff" anchorX="left" font="/fonts/GeistMono-Bold.woff">
                        MARKETING_NEURAL_INTERFACE
                    </Text>
                    <Text position={[0, -0.6, 0]} fontSize={0.18} color="#ffffff" anchorX="left" fillOpacity={0.6}>
                        {`STATUS: ACQUIRING_DATA\nUPLINK: ${hex}`}
                    </Text>
                </group>

                {/* MÉTRICA DE PRECISIÓN (Esquina derecha) */}
                <group position={[7.8, -3.8, 0.3]}>
                    <Text fontSize={1} color="#ffffff" anchorX="right" font="/fonts/GeistMono-Bold.woff">
                        99.4%
                    </Text>
                    <Text position={[0, -0.6, 0]} fontSize={0.15} color="#00ffff" anchorX="right" fillOpacity={0.5}>
                        ACQUISITION_ACCURACY
                    </Text>
                </group>
            </group>

            <pointLight position={[0, 0, 4]} intensity={isActive ? 15 : 0} color="#00ffff" />
        </group>
    );
}
