'use client';
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. GEOMETRÍA DE LUJO (Con tu física de inercia intacta) ---
function LuxuryGeometry({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    
    const isDragging = useRef(false);
    const previousMouse = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const rotation = useRef({ x: 0, y: 0 });

    const onPointerDown = (e: any) => {
        if (!isActive) return;
        e.stopPropagation(); // Evitamos que la rueda gire mientras tocamos la joya
        isDragging.current = true;
        previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => { isDragging.current = false; };

    const onPointerMove = (e: any) => {
        if (!isDragging.current || !isActive) return;
        const deltaX = e.clientX - previousMouse.current.x;
        const deltaY = e.clientY - previousMouse.current.y;

        const sensitivity = 0.005;
        velocity.current.y = deltaX * sensitivity;
        velocity.current.x = deltaY * sensitivity;
        previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointermove', onPointerMove);
        return () => {
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointermove', onPointerMove);
        };
    }, [isActive]);

    useFrame((state) => {
        if (!groupRef.current) return;

        rotation.current.y += velocity.current.y;
        rotation.current.x += velocity.current.x;
        velocity.current.y *= 0.95;
        velocity.current.x *= 0.95;

        const t = state.clock.getElapsedTime();
        const autoRotate = Math.sin(t * 0.2) * 0.001;

        groupRef.current.rotation.y = rotation.current.y + autoRotate;
        groupRef.current.rotation.x = THREE.MathUtils.clamp(rotation.current.x, -Math.PI / 3, Math.PI / 3);
    });

    return (
        <group ref={groupRef} onPointerDown={onPointerDown}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
                {/* NÚCLEO: Oro (Escalado para el marco 16.5x9.5) */}
                <mesh scale={1.4}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.1} />
                </mesh>
                
                {/* CORAZA: Cristal Refractor */}
                <mesh scale={2.3}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshPhysicalMaterial 
                        transmission={1}
                        roughness={0.05}
                        thickness={2.5}
                        ior={1.5}
                        color="#ffffff"
                    />
                </mesh>

                {/* ESTRUCTURA: Oro Wireframe */}
                <mesh scale={2.31}>
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
            {/* CAPA 1: FONDO PERLA (HTML) */}
            <Html 
                transform 
                center 
                distanceFactor={8.2} 
                occlude={false}
                position={[0, 0, -0.05]} // Ligeramente adelantado al chasis
                style={{
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: 'opacity 0.6s ease-in-out',
                }}
            >
                <div className="relative w-[800px] h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                    {/* El degradado Luxury que tenías */}
                    <div 
                        className="absolute inset-0 z-0" 
                        style={{ background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #FAF9F6 50%, #d1cfc8 100%)' }} 
                    />
                    
                    {/* UI Textual */}
                    <div className="absolute top-12 left-12 z-20">
                        <h2 className="text-6xl font-light tracking-[20px] text-stone-800 uppercase m-0">Events</h2>
                        <div className="h-[2px] w-48 bg-stone-400 mt-4" />
                    </div>

                    <div className="absolute bottom-12 w-full text-center text-[12px] tracking-[8px] text-stone-500 uppercase font-mono z-20">
                        Physical & Luxury Experiences // 2026
                    </div>
                </div>
            </Html>

            {/* CAPA 2: JOYERA 3D (Adelantada para flotar) */}
            <group position={[0, 0, 0.6]}>
                <pointLight position={[5, 5, 5]} intensity={isActive ? 15 : 0} color="#ffffff" />
                <LuxuryGeometry isActive={isActive} />
                
                <ContactShadows 
                    position={[0, -4.5, 0]} 
                    opacity={isActive ? 0.3 : 0} 
                    scale={15} 
                    blur={3} 
                    color="#c5a059" 
                />
            </group>
        </group>
    );
}
