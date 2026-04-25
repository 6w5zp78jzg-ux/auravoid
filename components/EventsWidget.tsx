'use client';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

function LuxuryGeometry({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.y = t * 0.3;
        groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    });

    return (
        <group ref={groupRef}>
            <Environment preset="city" />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                {/* NÚCLEO: Oro */}
                <mesh scale={1.4}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial 
                        color="#c5a059" 
                        metalness={1} 
                        roughness={0.1} 
                        emissive="#c5a059"
                        emissiveIntensity={0.2}
                    />
                </mesh>
                
                {/* CORAZA: Cristal */}
                <mesh scale={2.4}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshPhysicalMaterial 
                        transmission={1}
                        thickness={2.5}
                        roughness={0.02}
                        ior={1.5}
                        color="#ffffff"
                        transparent
                        opacity={isActive ? 1 : 0.3}
                    />
                </mesh>

                {/* ESTRUCTURA: Wireframe Oro */}
                <mesh scale={2.41}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} wireframe />
                </mesh>
            </Float>
        </group>
    );
}

export default function EventsWidget({ isActive }: { isActive: boolean }) {
    
    // 🎨 GENERAMOS EL FONDO PERLA (En lugar de HTML)
    const pearlTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Recreamos tu radial-gradient original: #ffffff 0%, #FAF9F6 50%, #d1cfc8 100%
            const grad = ctx.createRadialGradient(512, 0, 0, 512, 0, 1024);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.5, '#FAF9F6');
            grad.addColorStop(1, '#d1cfc8');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1024, 1024);

            // Dibujamos el texto de "Events" directamente para que sea nítido
            ctx.fillStyle = '#44403c'; // stone-800
            ctx.font = '300 80px sans-serif';
            ctx.textAlign = 'left';
            ctx.letterSpacing = "25px";
            ctx.fillText('EVENTS', 100, 200);

            // Línea decorativa
            ctx.fillStyle = '#a8a29e'; // stone-400
            ctx.fillRect(100, 240, 300, 4);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, []);

    return (
        <group>
            {/* 💡 ILUMINACIÓN PROPIA (Fuerte para resaltar el blanco) */}
            <pointLight position={[5, 5, 5]} intensity={isActive ? 60 : 0} color="#ffffff" />
            <ambientLight intensity={isActive ? 0.8 : 0} />

            {/* CAPA 1: EL FONDO CLARO (Malla nativa, no más negro) */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial 
                    map={pearlTexture} 
                    transparent 
                    opacity={isActive ? 1 : 0.4} 
                />
            </mesh>

            {/* CAPA 2: LA JOYA 3D (Flotando por delante) */}
            <group position={[0, 0, 1.2]}>
                <LuxuryGeometry isActive={isActive} />
            </group>
            
            {/* Sombra proyectada sobre el fondo claro */}
            <ContactShadows 
                position={[0, -4.5, 0]} 
                opacity={isActive ? 0.6 : 0} 
                scale={15} 
                blur={2.5} 
                color="#c5a059" 
            />
        </group>
    );
}
