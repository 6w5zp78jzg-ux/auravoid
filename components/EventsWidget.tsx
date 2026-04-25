'use client';
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. GEOMETRÍA DE LUJO (Escalada para la Rueda) ---
function LuxuryGeometry({ visible }: { visible: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    const velocity = useRef({ x: 0, y: 0 });
    const rotation = useRef({ x: 0, y: 0 });

    useFrame((state) => {
        if (!groupRef.current || !visible) return;

        // Rotación automática suave
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.y = rotation.current.y + Math.sin(t * 0.2) * 0.1;
        groupRef.current.rotation.x = Math.cos(t * 0.1) * 0.05;
    });

    return (
        <group ref={groupRef} visible={visible}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                {/* NÚCLEO: Oro */}
                <mesh scale={1.4}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.1} />
                </mesh>
                
                {/* CORAZA: Cristal Refractor (Aumentado para llenar el marco) */}
                <mesh scale={2.2}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshPhysicalMaterial 
                        transmission={1}
                        roughness={0.05}
                        thickness={2}
                        ior={1.5}
                        color="#ffffff"
                    />
                </mesh>

                {/* ESTRUCTURA: Oro Wireframe */}
                <mesh scale={2.21}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.1} wireframe />
                </mesh>
            </Float>
        </group>
    );
}

// --- 2. PANEL PRINCIPAL ---
export default function EventsWidget({ isActive }: { isActive: boolean }) {
    return (
        <group>
            {/* CAPA 1: FONDO HTML (Elegancia Perla) */}
            <Html 
                transform 
                center 
                // 🚀 distanceFactor corregido para que el fondo llene el marco 16.5x9.5
                distanceFactor={8.2} 
                occlude={false} // 👈 Vital para iPad
                position={[0, 0, -0.05]} // Pegado al chasis pero un pelín por delante
                style={{
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: 'opacity 0.6s ease-in-out',
                }}
            >
                <div className="relative w-[800px] h-[500px] border border-black/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div 
                        className="absolute inset-0 z-0" 
                        style={{ background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #FAF9F6 50%, #d1cfc8 100%)' }} 
                    />
                    
                    {/* Diseño Luxury */}
                    <div className="absolute top-12 left-12 z-20">
                        <h2 className="text-6xl font-light tracking-[20px] text-stone-800 uppercase m-0">Events</h2>
                        <div className="h-[2px] w-48 bg-stone-400 mt-4" />
                    </div>

                    <div className="absolute bottom-12 w-full text-center text-[12px] tracking-[8px] text-stone-500 uppercase font-mono z-20">
                        Physical & Luxury Experiences // Gold Standard
                    </div>
                </div>
            </Html>

            {/* CAPA 2: ELEMENTOS 3D (Adelantados para evitar que el fondo los coma) */}
            <group position={[0, 0, 0.5]}>
                <pointLight position={[5, 5, 5]} intensity={isActive ? 15 : 0} color="#ffffff" />
                <LuxuryGeometry visible={isActive} />
            </group>
            
            {/* Sombra proyectada en el fondo perla */}
            <ContactShadows 
                position={[0, -4.5, 0]} 
                opacity={isActive ? 0.4 : 0} 
                scale={15} 
                blur={2.5} 
                color="#c5a059" 
            />
        </group>
    );
}
