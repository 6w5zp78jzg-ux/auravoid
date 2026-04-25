'use client';
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';

function LuxuryGeometry({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const rotation = useRef({ x: 0, y: 0 });

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        // Rotación elegante constante
        groupRef.current.rotation.y = t * 0.2;
        groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    });

    return (
        <group ref={groupRef}>
            {/* 🚀 EL SECRETO: Cada widget necesita su propio mapa de reflejos */}
            <Environment preset="city" />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
                {/* NÚCLEO: Oro */}
                <mesh scale={1.4}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial 
                        color="#c5a059" 
                        metalness={1} 
                        roughness={0.1} 
                        emissive="#c5a059"
                        emissiveIntensity={0.2} // Un poco de luz propia para que no sea negro
                    />
                </mesh>
                
                {/* CORAZA: Cristal */}
                <mesh scale={2.3}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshPhysicalMaterial 
                        transmission={1}
                        thickness={2}
                        roughness={0}
                        ior={1.5}
                        color="#ffffff"
                        transparent
                        opacity={isActive ? 1 : 0.2}
                    />
                </mesh>

                {/* ESTRUCTURA: Wireframe Oro */}
                <mesh scale={2.31}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} wireframe />
                </mesh>
            </Float>
        </group>
    );
}

export default function EventsWidget({ isActive }: { isActive: boolean }) {
    return (
        <group>
            {/* 🚀 LUZ PROPIA DEL PANEL: Intensidad alta para iPad */}
            <pointLight position={[2, 2, 5]} intensity={isActive ? 50 : 0} color="#ffffff" />
            <pointLight position={[-2, -2, 2]} intensity={isActive ? 20 : 0} color="#c5a059" />
            <ambientLight intensity={isActive ? 0.5 : 0} />

            <Html 
                transform 
                center 
                distanceFactor={8.2} 
                occlude={false}
                position={[0, 0, -0.1]} 
                style={{
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out',
                }}
            >
                <div className="relative w-[800px] h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {/* Fondo Perla con degradado forzado */}
                    <div 
                        className="absolute inset-0" 
                        style={{ 
                            background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #FAF9F6 50%, #d1cfc8 100%)',
                            zIndex: -1 
                        }} 
                    />
                    
                    <div className="absolute top-12 left-12">
                        <h2 className="text-6xl font-light tracking-[20px] text-stone-800 uppercase">Events</h2>
                        <div className="h-[2px] w-48 bg-stone-400 mt-4" />
                    </div>
                </div>
            </Html>

            <group position={[0, 0, 1]}>
                <LuxuryGeometry isActive={isActive} />
            </group>
            
            <ContactShadows position={[0, -4.5, 0]} opacity={isActive ? 0.5 : 0} scale={15} blur={3} color="#c5a059" />
        </group>
    );
}