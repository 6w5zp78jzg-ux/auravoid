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
            <pointLight position={[6, 4, 2]} intensity={isActive ? 40 : 0} color="#ff0000" distance={15} />
            <pointLight position={[-6, -4, 2]} intensity={isActive ? 40 : 0} color="#ffffff" distance={15} />
            <pointLight position={[0, 0, 4]} intensity={isActive ? 25 : 0} color="#ffffff" distance={10} />
        </group>
    );
}

// --- 2. LINTERNA INTERACTIVA ---
function InteractiveFlashlight({ isActive }: { isActive: boolean }) {
    const lightRef = useRef<THREE.PointLight>(null);
    useFrame((state) => {
        if (!lightRef.current || !isActive) return;
        lightRef.current.position.set(state.mouse.x * 8, state.mouse.y * 4, 3.5);
    });

    return (
        <pointLight 
            ref={lightRef} 
            intensity={isActive ? 110 : 0} 
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
                        metalness={0.4}
                        roughness={0.02}
                        clearcoat={1.0}
                        clearcoatRoughness={0.02}
                        reflectivity={1}
                    />
                </Text3D>
            </Center>
            <Center top position={[0, -1.5, 0]}>
                <Text3D font={fontUrl} size={0.28} height={0.1}>
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

    // 🎨 Creación de la textura con colores más vivos para evitar que parezca negro
    const backgroundTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        
        // Degradado Burdeos -> Rojo Pasión -> Negro
        const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 350);
        grad.addColorStop(0, '#b3092c');   // Rojo más brillante en el centro
        grad.addColorStop(0.5, '#4d0312'); // Burdeos profundo
        grad.addColorStop(1, '#000000');   // Negro absoluto
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }, []);

    return (
        <group>
            <Environment preset="city" />

            {/* 🛑 EL FONDO: Posicionado en Z=0 para que no sea tapado por el chasis */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial 
                    map={backgroundTexture} 
                    transparent={false} // 👈 Lo hacemos opaco para que no se vea el Voronoi
                    opacity={isActive ? 1 : 0.4} 
                />
            </mesh>

            {/* Luces y Texto adelantados para que floten sobre el rojo */}
            <group position={[0, 0, 0.8]}>
                <MovingSpotlights isActive={isActive} />
                <InteractiveFlashlight isActive={isActive} />
                
                <Suspense fallback={null}>
                    <ObsidianText language={language} isActive={isActive} />
                </Suspense>
            </group>
        </group>
    );
}
