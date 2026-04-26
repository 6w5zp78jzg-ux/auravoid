'use client';
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// --- ELEMENTOS SEGUROS ---
function SafeTargets({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const targets = [
        { pos: [3.5, 2.2, 0.1], id: "0xAF2" },
        { pos: [-4.5, 1.5, 0.1], id: "0xBD9" },
        { pos: [5.2, -1.8, 0.1], id: "0xCE1" },
    ];

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.children.forEach((child, i) => {
            const s = 1 + Math.sin(t * 4 + i) * 0.2;
            child.scale.set(s, s, 1);
        });
    });

    return (
        <group ref={groupRef} visible={isActive}>
            {targets.map((t, i) => (
                <group key={i} position={t.pos as any}>
                    <mesh rotation={[0, 0, Math.PI / 4]}>
                        <planeGeometry args={[0.3, 0.3]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
                    </mesh>
                    {/* Texto SIN fuente personalizada para evitar crashes de red */}
                    <Text position={[0.4, 0, 0]} fontSize={0.15} color="#00ffff" anchorX="left">
                        {`NODE_${t.id}`}
                    </Text>
                </group>
            ))}
        </group>
    );
}

function SafeBars({ isActive }: { isActive: boolean }) {
    const barsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!barsRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        barsRef.current.children.forEach((bar, i) => {
            bar.scale.y = Math.max(0.1, 1 + Math.sin(t * 5 + i * 0.5) * 1.2);
        });
    });

    return (
        <group ref={barsRef} position={[-7.5, -3.8, 0.1]} visible={isActive}>
            {Array.from({ length: 10 }).map((_, i) => (
                <mesh key={i} position={[i * 0.25, 0, 0]}>
                    <planeGeometry args={[0.1, 1]} />
                    <meshBasicMaterial color={i % 2 === 0 ? "#00ffff" : "#ffffff"} transparent opacity={0.5} />
                </mesh>
            ))}
        </group>
    );
}

// --- CONTENIDO PRINCIPAL ENVUELTO ---
function WidgetContent({ isActive }: { isActive: boolean }) {
    const sweepRef = useRef<THREE.Mesh>(null);
    const [hex, setHex] = useState('0x000000');

    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setHex('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
        }, 150);
        return () => clearInterval(interval);
    }, [isActive]);

    useFrame((_, delta) => {
        if (!isActive) return;
        if (sweepRef.current) sweepRef.current.rotation.z -= delta * 2.5;
    });

    return (
        <group>
            {/* FONDO SÓLIDO BÁSICO */}
            <mesh position={[0, 0, -0.05]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#01060b" />
            </mesh>

            <group visible={isActive}>
                {/* RADAR BÁSICO (Usando Torus en lugar de Line para evitar errores de Drei) */}
                <mesh>
                    <torusGeometry args={[2, 0.02, 16, 64]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
                </mesh>
                <mesh>
                    <torusGeometry args={[3.5, 0.02, 16, 64]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
                </mesh>

                {/* BARRIDO */}
                <mesh ref={sweepRef} position={[0, 0, 0.02]}>
                    <planeGeometry args={[4, 0.05]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
                    <primitive object={new THREE.Object3D()} position={[-2, 0, 0]} />
                </mesh>

                <SafeTargets isActive={isActive} />
                <SafeBars isActive={isActive} />

                {/* TEXTOS SEGUROS */}
                <group position={[-7.8, 4.1, 0.2]}>
                    <Text fontSize={0.5} color="#00ffff" anchorX="left">
                        MARKETING_OS
                    </Text>
                    <Text position={[0, -0.6, 0]} fontSize={0.2} color="#ffffff" anchorX="left">
                        {`STATUS: ACTIVE\nHASH: ${hex}`}
                    </Text>
                </group>
            </group>
        </group>
    );
}

// --- COMPONENTE EXPORTADO CON ESCUDO ANTI-CRASH ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    return (
        // El Suspense atrapa cualquier carga asíncrona.
        // Si algo falla, muestra un cubo rojo en lugar de borrar toda tu rueda.
        <Suspense fallback={
            <mesh>
                <boxGeometry args={[2, 2, 2]} />
                <meshBasicMaterial color="red" />
            </mesh>
        }>
            <WidgetContent isActive={isActive} />
        </Suspense>
    );
}
