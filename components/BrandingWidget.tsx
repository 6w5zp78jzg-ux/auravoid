'use client';
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers'; 

// --- 1. LUCES MÓVILES ---
function MovingSpotlights({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.z = t * 0.5;
        groupRef.current.rotation.y = t * 0.2;
    });

    return (
        <group ref={groupRef}>
            <pointLight position={[6, 4, 2]} intensity={isActive ? 35 : 0} color="#ffffff" distance={15} />
            <pointLight position={[-6, -4, 2]} intensity={isActive ? 35 : 0} color="#ffffff" distance={15} />
            <pointLight position={[0, 0, 3]} intensity={isActive ? 20 : 0} color="#aaccff" distance={12} />
        </group>
    );
}

// --- 2. LINTERNA INTERACTIVA ---
function InteractiveFlashlight({ isActive }: { isActive: boolean }) {
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame((state) => {
        if (!lightRef.current || !isActive) return;
        const x = state.mouse.x * 8;
        const y = state.mouse.y * 4;
        lightRef.current.position.set(x, y, 3.5);
    });

    return (
        <pointLight 
            ref={lightRef} 
            intensity={isActive ? 95 : 0} 
            color="#ffffff" 
            distance={20} 
            decay={1.5}
        />
    );
}

// --- 3. TEXTO DE OBSIDIANA ---
function ObsidianText({ language, isActive }: { language: string; isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const fontUrl = "https://unpkg.com/three/examples/fonts/helvetiker_bold.typeface.json";

    const content = language === 'es' 
        ? { main: "BRANDING\n& PR", sub: "INGENIERIA DE PERCEPCION" }
        : { main: "BRANDING\n& PR", sub: "PERCEPTION ENGINEERING" };

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05;
    });

    return (
        <group ref={groupRef}>
            <Center top position={[0, 1.2, 0]}>
                <Text3D font={fontUrl} size={0.9} height={0.2} bevelEnabled bevelSize={0.03} bevelThickness={0.03}>
                    {content.main}
                    <meshPhysicalMaterial 
                        color="#000000"
                        metalness={0.2}
                        roughness={0.05}
                        clearcoat={1.0}
                        clearcoatRoughness={0.05}
                        reflectivity={1}
                    />
                </Text3D>
            </Center>
            <Center top position={[0, -1.5, 0]}>
                <Text3D font={fontUrl} size={0.3} height={0.1}>
                    {content.sub}
                    <meshPhysicalMaterial color="#000000" roughness={0.3} metalness={0.1} />
                </Text3D>
            </Center>
        </group>
    );
}

// --- 4. PANEL PRINCIPAL ---
export default function BrandingWidget({ isActive }: { isActive: boolean }) {
    const { language } = useLanguage();

    const backgroundTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;
        const grad = ctx.createRadialGradient(512, 512, 0, 512, 512, 700);
        grad.addColorStop(0, '#820620');   
        grad.addColorStop(0.6, '#3d020e'); 
        grad.addColorStop(1, '#000000');   
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            {/* 1. Fondo Burdeos */}
            <mesh position={[0, 0, -0.2]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial map={backgroundTexture} transparent opacity={isActive ? 1 : 0.3} />
            </mesh>

            <MovingSpotlights isActive={isActive} />
            <InteractiveFlashlight isActive={isActive} />

            <Suspense fallback={null}>
                <group position={[0, 0, 0.5]}>
                    <ObsidianText language={language} isActive={isActive} />
                </group>
            </Suspense>

            {/* 🚀 SOLUCIÓN AL ERROR: preset="city" es el valor válido que mejor queda */}
            <Environment preset="city" />
        </group>
    );
}
