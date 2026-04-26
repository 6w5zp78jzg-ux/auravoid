'use client';
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. OBJETIVOS TÁCTICOS ---
function TacticalTargets({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const targets = [
        { pos: [3.5, 2.2, 0.1], id: "0xAF2" },
        { pos: [-4.5, 1.5, 0.1], id: "0xBD9" },
        { pos: [5.2, -1.8, 0.1], id: "0xCE1" },
        { pos: [-3.2, -2.8, 0.1], id: "0x992" },
    ];

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.children.forEach((child, i) => {
            const s = 1 + Math.sin(t * 4 + i) * 0.25;
            child.scale.set(s, s, 1);
        });
    });

    return (
        <group ref={groupRef} visible={isActive}>
            {targets.map((t, i) => (
                <group key={i} position={t.pos as any}>
                    <mesh rotation={[0, 0, Math.PI / 4]}>
                        <planeGeometry args={[0.25, 0.25]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
                    </mesh>
                    {/* Quitamos la carga de fuente externa para asegurar visibilidad */}
                    <Text 
                        position={[0.4, 0, 0]} 
                        fontSize={0.14} 
                        color="#00ffff" 
                        anchorX="left"
                    >
                        {`NODE_${t.id}`}
                    </Text>
                </group>
            ))}
        </group>
    );
}

// --- 2. BARRAS DE DATOS ---
function PulseBars({ isActive }: { isActive: boolean }) {
    const barsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!barsRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        barsRef.current.children.forEach((bar, i) => {
            bar.scale.y = Math.max(0.1, 1 + Math.sin(t * 5 + i * 0.5) * 1.5);
        });
    });

    return (
        <group ref={barsRef} position={[-7.5, -3.8, 0.1]} visible={isActive}>
            {Array.from({ length: 16 }).map((_, i) => (
                <mesh key={i} position={[i * 0.22, 0, 0]}>
                    <planeGeometry args={[0.08, 1]} />
                    <meshBasicMaterial color={i % 2 === 0 ? "#00ffff" : "#ffffff"} transparent opacity={0.5} />
                </mesh>
            ))}
        </group>
    );
}

// --- 3. CONTENIDO PRINCIPAL ---
function WidgetContent({ isActive }: { isActive: boolean }) {
    const sweepRef = useRef<THREE.Mesh>(null);
    const contentRef = useRef<THREE.Group>(null);
    
    const [hex, setHex] = useState('0x000000');
    const [accuracy, setAccuracy] = useState(99.6);

    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setHex('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
            setAccuracy(98 + Math.random() * 1.9);
        }, 150);
        return () => clearInterval(interval);
    }, [isActive]);

    useFrame((state, delta) => {
        if (!isActive) return;
        if (sweepRef.current) sweepRef.current.rotation.z -= delta * 2.5;
        
        if (contentRef.current) {
            contentRef.current.position.x = THREE.MathUtils.lerp(contentRef.current.position.x, state.mouse.x * 0.4, 0.1);
            contentRef.current.position.y = THREE.MathUtils.lerp(contentRef.current.position.y, state.mouse.y * 0.2, 0.1);
        }
    });

    return (
        <group>
            {/* FONDO SÓLIDO */}
            <mesh position={[0, 0, -0.05]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#01060b" />
            </mesh>

            <group ref={contentRef} visible={isActive}>
                
                {/* REJILLA */}
                <group position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                    <gridHelper args={[20, 30, "#00ffff", "#00ffff"]} material-transparent material-opacity={0.08} />
                </group>

                {/* RADAR */}
                {[2, 3.5, 5].map((r, i) => (
                    <mesh key={i} position={[0, 0, 0.02]}>
                        <ringGeometry args={[r, r + 0.02, 64]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} side={THREE.DoubleSide} />
                    </mesh>
                ))}

                {/* BARRIDO */}
                <mesh ref={sweepRef} position={[0, 0, 0.03]}>
                    <planeGeometry args={[4.8, 0.06]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
                    <primitive object={new THREE.Object3D()} position={[-2.4, 0, 0]} />
                </mesh>

                <TacticalTargets isActive={isActive} />
                <PulseBars isActive={isActive} />

                {/* TEXTOS (Sin fuentes personalizadas que bloqueen el render) */}
                <group position={[-7.8, 4.1, 0.2]}>
                    <Text fontSize={0.45} color="#00ffff" anchorX="left">
                        NEURAL_MARKETING_OS
                    </Text>
                    <Text position={[0, -0.6, 0]} fontSize={0.18} color="#ffffff" anchorX="left" fillOpacity={0.6}>
                        {`SYS_ACQUISITION: ACTIVE\nHASH_LINK: ${hex}`}
                    </Text>
                </group>

                <group position={[7.8, -3.8, 0.2]}>
                    <Text fontSize={0.9} color="#ffffff" anchorX="right">
                        {`${accuracy.toFixed(1)}%`}
                    </Text>
                    <Text position={[0, -0.6, 0]} fontSize={0.15} color="#00ffff" anchorX="right" fillOpacity={0.5}>
                        CONVERSION_ACCURACY
                    </Text>
                </group>
            </group>
        </group>
    );
}

// --- 4. EXPORTACIÓN ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
    return (
        <Suspense fallback={
            <mesh>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#01060b" />
            </mesh>
        }>
            <WidgetContent isActive={isActive} />
        </Suspense>
    );
}
