'use client';
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. GEOMETRÍA DE LUJO CON ARRASTRE ---
function LuxuryGeometry({ isActive }: { isActive: boolean }) {
    const meshRef = useRef<THREE.Group>(null);
    const { size } = useThree();
    
    // Estado interno de la física de la bola
    const isDraggingBall = useRef(false);
    const mousePos = useRef({ x: 0, y: 0 });
    const rotation = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: any) => {
        if (!isActive) return;
        // 🚀 CRÍTICO: Detiene el evento para que la RUEDA no se mueva
        e.stopPropagation(); 
        e.target.setPointerCapture(e.pointerId);
        
        isDraggingBall.current = true;
        mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: any) => {
        if (!isDraggingBall.current || !isActive) return;

        const deltaX = e.clientX - mousePos.current.x;
        const deltaY = e.clientY - mousePos.current.y;

        // Sensibilidad del arrastre de la bola
        const sensitivity = 0.005;
        velocity.current.y = deltaX * sensitivity;
        velocity.current.x = deltaY * sensitivity;

        mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: any) => {
        isDraggingBall.current = false;
        if(e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
    };

    useFrame((state) => {
        if (!meshRef.current) return;

        // Aplicamos inercia
        rotation.current.y += velocity.current.y;
        rotation.current.x += velocity.current.x;
        velocity.current.y *= 0.95; // Fricción
        velocity.current.x *= 0.95;

        // Movimiento automático muy leve
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.y = rotation.current.y + Math.sin(t * 0.1) * 0.05;
        meshRef.current.rotation.x = THREE.MathUtils.clamp(rotation.current.x, -0.5, 0.5);
    });

    return (
        <group 
            ref={meshRef} 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <Environment preset="city" />
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                {/* NÚCLEO ORO */}
                <mesh scale={1.5}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.1} emissive="#c5a059" emissiveIntensity={0.1} />
                </mesh>
                
                {/* CORAZA CRISTAL */}
                <mesh scale={2.4}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshPhysicalMaterial 
                        transmission={1} 
                        thickness={2} 
                        roughness={0.02} 
                        ior={1.5} 
                        color="#ffffff" 
                        transparent 
                        opacity={isActive ? 1 : 0.3} 
                    />
                </mesh>

                {/* ESTRUCTURA WIREFRAME */}
                <mesh scale={2.42}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} wireframe />
                </mesh>
            </Float>
        </group>
    );
}

// --- 2. PANEL PRINCIPAL ---
export default function EventsWidget({ isActive }: { isActive: boolean }) {
    
    const pearlTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const grad = ctx.createRadialGradient(512, 0, 0, 512, 0, 1024);
            grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, '#FAF9F6'); grad.addColorStop(1, '#d1cfc8');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 1024);
            ctx.fillStyle = '#44403c'; ctx.font = '300 80px sans-serif'; ctx.textAlign = 'left';
            ctx.fillText('EVENTS', 100, 200);
            ctx.fillStyle = '#a8a29e'; ctx.fillRect(100, 240, 300, 4);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, []);

    return (
        <group>
            {/* ILUMINACIÓN */}
            <pointLight position={[5, 5, 5]} intensity={isActive ? 50 : 0} />
            <ambientLight intensity={isActive ? 0.6 : 0} />

            {/* FONDO CLARO 
                🚀 NO detener propagación aquí para que la RUEDA pueda girar */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial map={pearlTexture} transparent opacity={isActive ? 1 : 0.4} />
            </mesh>

            {/* LA BOLA INTERACTIVA (Z adelantado) */}
            <group position={[0, 0, 1.3]}>
                <LuxuryGeometry isActive={isActive} />
            </group>
            
            <ContactShadows position={[0, -4.5, 0]} opacity={isActive ? 0.6 : 0} scale={15} blur={2.5} color="#c5a059" />
        </group>
    );
}
