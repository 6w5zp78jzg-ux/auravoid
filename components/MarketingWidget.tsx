'use client';
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. OBJETIVOS TÁCTICOS (Con animación de pulso) ---
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
                    {/* Rombo táctico */}
                    <mesh rotation={[0, 0, Math.PI / 4]}>
                        <planeGeometry args={[0.25, 0.25]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
                    </mesh>
                    <Text 
                        position={[0.4, 0, 0]} 
                        fontSize={0.14} 
                        color="#00ffff" 
                        anchorX="left"
                        font="/fonts/GeistMono-Bold.woff" // Tu fuente original
                    >
                        {`NODE_${t.id}`}
                    </Text>
                </group>
            ))}
        </group>
    );
}

// --- 2. BARRAS DE DATOS (Infografía fluida) ---
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

// --- 3. CONTENIDO PRINCIPAL DEL WIDGET ---
function WidgetContent({ isActive }: { isActive: boolean }) {
    const sweepRef = useRef<THREE.Mesh>(null);
    const contentRef = useRef<THREE.Group>(null);
    
    const [hex, setHex] = useState('0x000000');
    const [accuracy, setAccuracy] = useState(99.6);

    // Sistema de Siesta para los datos
    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setHex('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
            setAccuracy(98 + Math.random() * 1.9);
        }, 150);
        return () => clearInterval(interval);
    }, [isActive]);

    // Barrido del radar y Parallax
    useFrame((state, delta) => {
        if (!isActive) return;
        if (sweepRef.current) sweepRef.current.rotation.z -= delta * 2.5;
        
        // Movimiento sutil siguiendo el ratón (Parallax)
        if (contentRef.current) {
            contentRef.current.position.x = THREE.MathUtils.lerp(contentRef.current.position.x, state.mouse.x * 0.4, 0.1);
            contentRef.current.position.y = THREE.MathUtils.lerp(contentRef.current.position.y, state.mouse.y * 0.2, 0.1);
        }
    });

    return (
        <group>
            {/* FONDO SÓLIDO (Para tapar el cilindro) */}
            <mesh position={[0, 0, -0.05]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#01060b" />
            </mesh>

            {/* TODO LO DEMÁS SOLO SE RENDERIZA SI ESTÁ ACTIVO (Hibernación de GPU) */}
            <group ref={contentRef} visible={isActive}>
                
                {/* REJILLA MILIMÉTRICA NATIVA (Inmune a fallos, 0 costo) */}
                <group position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                    <gridHelper args={[20, 30, "#00ffff", "#00ffff"]} material-transparent material-opacity={0.08} />
                </group>

                {/* RADAR: Anillos planos cortantes (ringGeometry) */}
                {[2, 3.5, 5].map((r, i) => (
                    <mesh key={i} position={[0, 0, 0.02]}>
                        {/* Radio interno, radio externo, segmentos */}
                        <ringGeometry args={[r, r + 0.02, 64]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} side={THREE.DoubleSide} />
                    </mesh>
                ))}

                {/* BARRIDO DE LUZ DEL RADAR */}
                <mesh ref={sweepRef} position={[0, 0, 0.03]}>
                    <planeGeometry args={[4.8, 0.06]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
                    <primitive object={new THREE.Object3D()} position={[-2.4, 0, 0]} />
                </mesh>

                {/* ANIMACIONES */}
                <TacticalTargets isActive={isActive} />
                <PulseBars isActive={isActive} />

                {/* TEXTOS (SDF) */}
                <group position={[-7.8, 4.1, 0.2]}>
                    <Text fontSize={0.45} color="#00ffff" anchorX="left" font="/fonts/GeistMono-Bold.woff">
                        NEURAL_MARKETING_OS
                    </Text>
                    <Text position={[0, -0.6, 0]} fontSize={0.18} color="#ffffff" anchorX="left" fillOpacity={0.6} font="/fonts/GeistMono-Bold.woff">
                        {`SYS_ACQUISITION: ACTIVE\nHASH_LINK: ${hex}`}
                    </Text>
                </group>

                <group position={[7.8, -3.8, 0.2]}>
                    <Text fontSize={0.9} color="#ffffff" anchorX="right" font="/fonts/GeistMono-Bold.woff">
                        {`${accuracy.toFixed(1)}%`}
                    </Text>
                    <Text position={[0, -0.6, 0]} fontSize={0.15} color="#00ffff" anchorX="right" fillOpacity={0.5} font="/fonts/GeistMono-Bold.woff">
                        CONVERSION_ACCURACY
                    </Text>
                </group>
            </group>
        </group>
    );
}

// --- 4. EXPORTACIÓN CON ESCUDO ANTI-CRASH ---
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
