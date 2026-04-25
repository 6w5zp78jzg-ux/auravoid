'use client';
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Html, Edges } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. GEOMETRÍA DE LUJO (Aumentada a escala Hero) ---
function LuxuryGeometry({ visible }: { visible: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    // Física manual para rotar la joya con el dedo
    const isDragging = useRef(false);
    const previousMouse = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const rotation = useRef({ x: 0, y: 0 });

    const onPointerDown = (e: any) => {
        isDragging.current = true;
        previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => { isDragging.current = false; };

    const onPointerMove = (e: any) => {
        if (!isDragging.current || !visible) return;
        const deltaX = e.clientX - previousMouse.current.x;
        const deltaY = e.clientY - previousMouse.current.y;
        velocity.current.y = deltaX * 0.005;
        velocity.current.x = deltaY * 0.005;
        previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointermove', onPointerMove);
        return () => {
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointermove', onPointerMove);
        };
    }, [visible]);

    useFrame((state) => {
        if (!groupRef.current || !visible) return;

        rotation.current.y += velocity.current.y;
        rotation.current.x += velocity.current.x;
        velocity.current.y *= 0.95;
        velocity.current.x *= 0.95;

        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.y = rotation.current.y + Math.sin(t * 0.2) * 0.1;
        groupRef.current.rotation.x = THREE.MathUtils.clamp(rotation.current.x, -Math.PI / 3, Math.PI / 3);
    });

    return (
        <group ref={groupRef} onPointerDown={onPointerDown} visible={visible}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                {/* NÚCLEO: Oro (Más grande) */}
                <mesh scale={1.2}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.1} />
                </mesh>
                
                {/* CORAZA: Cristal Refractor */}
                <mesh scale={1.8}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshPhysicalMaterial 
                        transmission={1}
                        roughness={0.01}
                        thickness={2}
                        ior={1.5}
                        color="#ffffff"
                        attenuationColor="#ffffff"
                        attenuationDistance={0.5}
                    />
                </mesh>

                {/* ESTRUCTURA: Oro Wireframe */}
                <mesh scale={1.81}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.1} wireframe />
                </mesh>
            </Float>
        </group>
    );
}

// --- 2. PANEL PRINCIPAL ---
export default function EventsWidget({ isActive }: { isActive: boolean }) {
    
    // --- REGLA DE ORO: NUNCA DEVOLVER NULL ---

    return (
        <group>
            {/* CAPA 1: FONDO HTML (Elegancia Perla) */}
            <Html 
                transform 
                center 
                distanceFactor={8} // 🚀 Escala Hero
                position={[0, 0, -0.2]}
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
                    
                    {/* Detalles de diseño Luxury */}
                    <div className="absolute top-10 left-10 z-20">
                        <h2 className="text-5xl font-light tracking-[15px] text-stone-800 uppercase">Events</h2>
                        <div className="h-[1px] w-40 bg-stone-400 mt-4" />
                    </div>

                    <div className="absolute bottom-10 w-full text-center text-[10px] tracking-[6px] text-stone-500 uppercase font-mono z-20">
                        Physical & Luxury Experiences // Gold Standard
                    </div>
                </div>
            </Html>

            {/* CAPA 2: ELEMENTOS 3D */}
            <pointLight position={[5, 5, 5]} intensity={isActive ? 2 : 0} color="#ffffff" />
            
            <LuxuryGeometry visible={isActive} />
            
            <ContactShadows 
                position={[0, -4, 0]} 
                opacity={isActive ? 0.4 : 0} 
                scale={15} 
                blur={2.5} 
                color="#c5a059" 
            />
        </group>
    );
}
