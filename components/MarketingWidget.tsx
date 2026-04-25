'use client';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. COMPONENTE: OBJETIVOS TÁCTICOS (Puntos con Vida) ---
function TacticalTargets({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    const targets = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
        pos: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 7, 0.2],
        id: `TRGT_0${i}`,
        phase: Math.random() * Math.PI * 2
    })), []);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.children.forEach((child, i) => {
            // Animación de parpadeo y escala
            const s = 1 + Math.sin(t * 3 + targets[i].phase) * 0.3;
            child.scale.set(s, s, s);
        });
    });

    return (
        <group ref={groupRef}>
            {targets.map((t, i) => (
                <group key={i} position={t.pos as any}>
                    {/* Rombo táctico */}
                    <mesh rotation={[0, 0, Math.PI / 4]}>
                        <planeGeometry args={[0.25, 0.25]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
                    </mesh>
                    <Text position={[0.4, 0, 0]} fontSize={0.15} color="#00ffff" anchorX="left">
                        {t.id}
                    </Text>
                </group>
            ))}
        </group>
    );
}

// --- 2. COMPONENTE: INFOGRAFÍA DE BARRAS (Vida de Datos) ---
function DataBars({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.children.forEach((bar, i) => {
            const h = 1 + Math.sin(t * 5 + i * 0.5) * 0.8;
            bar.scale.y = h;
        });
    });

    return (
        <group ref={groupRef} position={[-7, -3.5, 0.2]}>
            {Array.from({ length: 14 }).map((_, i) => (
                <mesh key={i} position={[i * 0.25, 0, 0]}>
                    <planeGeometry args={[0.1, 1]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    );
}

// --- 3. WIDGET PRINCIPAL ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    const sweepRef = useRef<THREE.Group>(null);
    const [hex, setHex] = useState('0x000000');

    // Datos dinámicos
    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setHex('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
        }, 100);
        return () => clearInterval(interval);
    }, [isActive]);

    useFrame((state, delta) => {
        if (sweepRef.current && isActive) {
            sweepRef.current.rotation.z -= delta * 2.5;
        }
    });

    // Rejilla de fondo
    const gridPoints = useMemo(() => {
        const pts = [];
        for (let i = -8; i <= 8; i += 1) {
            pts.push([i, -4.75, 0], [i, 4.75, 0], [i, -4.75, 0]);
        }
        for (let i = -4.75; i <= 4.75; i += 1) {
            pts.push([-8, i, 0], [8, i, 0], [-8, i, 0]);
        }
        return pts;
    }, []);

    return (
        <group>
            {/* PANEL BASE */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#01060b" />
            </mesh>

            {/* REJILLA MILIMÉTRICA */}
            <Line 
                points={gridPoints as any} 
                color="#00ffff" 
                lineWidth={0.5} 
                transparent 
                opacity={isActive ? 0.15 : 0.05} 
            />

            {/* RADAR CENTRAL (Círculos) */}
            {[2, 3.5, 4.5].map((r, i) => (
                <Line
                    key={i}
                    points={new THREE.EllipseCurve(0, 0, r, r, 0, 2 * Math.PI, false, 0).getPoints(64).map(p => [p.x, p.y, 0.05]) as any}
                    color="#00ffff"
                    lineWidth={1}
                    transparent
                    opacity={0.2}
                />
            ))}

            {/* BARRIDO DE RADAR */}
            <group ref={sweepRef} position={[0, 0, 0.1]}>
                <Line 
                    points={[[0, 0, 0], [4.5, 0, 0]]} 
                    color="#00ffff" 
                    lineWidth={2} 
                    transparent 
                    opacity={isActive ? 0.8 : 0} 
                />
            </group>

            {/* ELEMENTOS DINÁMICOS 3D */}
            <TacticalTargets isActive={isActive} />
            <DataBars isActive={isActive} />

            {/* TEXTOS HUD (SDF - Siempre visibles en iPad) */}
            <group position={[-7.8, 4, 0.3]}>
                <Text fontSize={0.5} color="#00ffff" anchorX="left" font="/fonts/GeistMono-Bold.woff">
                    MARKETING_TARGETING.OS
                </Text>
                <Text position={[0, -0.6, 0]} fontSize={0.2} color="#ffffff" anchorX="left">
                    {`ACQUISITION_MODE: ACTIVE\nUPLINK_ID: ${hex}`}
                </Text>
            </group>

            <group position={[7.8, -4, 0.3]}>
                <Text fontSize={0.8} color="#00ffff" anchorX="right">
                    99.2%
                </Text>
                <Text position={[0, -0.5, 0]} fontSize={0.15} color="#ffffff" anchorX="right">
                    CONVERSION_ACCURACY
                </Text>
            </group>

            {/* ILUMINACIÓN LOCAL */}
            <pointLight position={[0, 0, 4]} intensity={isActive ? 12 : 0} color="#00ffff" />
        </group>
    );
}
