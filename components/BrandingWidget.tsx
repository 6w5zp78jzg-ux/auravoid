'use client';
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers'; 

// --- 1. LUCES MÓVILES (Potenciadas y con Color) ---
function MovingSpotlights({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        // Rotación amplia para que los focos recorran todo el panel
        groupRef.current.rotation.z = t * 0.8;
        groupRef.current.rotation.y = t * 0.4;
    });

    return (
        <group ref={groupRef}>
            {/* Multiplicamos los focos: 9 luces en total orbitando */}
            <pointLight position={[7, 0, 3]} intensity={isActive ? 150 : 0} color="#ffffff" distance={20} />
            <pointLight position={[-7, 0, 3]} intensity={isActive ? 150 : 0} color="#ff0000" distance={20} />
            <pointLight position={[0, 5, 3]} intensity={isActive ? 120 : 0} color="#ffffff" distance={20} />
            <pointLight position={[0, -5, 3]} intensity={isActive ? 120 : 0} color="#ff3333" distance={20} />
            
            <pointLight position={[4, 4, 4]} intensity={isActive ? 100 : 0} color="#ffffff" distance={15} />
            <pointLight position={[-4, -4, 4]} intensity={isActive ? 100 : 0} color="#ff0000" distance={15} />
            
            <pointLight position={[5, -5, 2]} intensity={isActive ? 80 : 0} color="#ffffff" distance={12} />
            <pointLight position={[-5, 5, 2]} intensity={isActive ? 80 : 0} color="#ff4444" distance={12} />
        </group>
    );
}

// --- 2. LINTERNA INTERACTIVA ---
function InteractiveFlashlight({ isActive }: { isActive: boolean }) {
    const lightRef = useRef<THREE.PointLight>(null);
    useFrame((state) => {
        if (!lightRef.current || !isActive) return;
        lightRef.current.position.set(state.mouse.x * 8, state.mouse.y * 4, 4);
    });
    return <pointLight ref={lightRef} intensity={isActive ? 250 : 0} color="#ffffff" distance={25} decay={1.5} />;
}

// --- 3. TEXTO DE OBSIDIANA (Centrado y Reactivo) ---
function ObsidianText({ language, isActive }: { language: string; isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const fontUrl = "https://unpkg.com/three/examples/fonts/helvetiker_bold.typeface.json";

    const TEXTOS = {
        es: { main: "BRANDING & PR", sub: "INGENIERIA DE PERCEPCION" },
        en: { main: "BRANDING & PR", sub: "PERCEPTION ENGINEERING" }
    };
    const content = language === 'es' ? TEXTOS.es : TEXTOS.en;

    return (
        <group ref={groupRef} position={[0, 0, 1]}>
            <Center top position={[0, 0.4, 0]}>
                <Text3D font={fontUrl} size={1.2} height={0.25} bevelEnabled bevelSize={0.04} bevelThickness={0.04}>
                    {content.main}
                    <meshPhysicalMaterial 
                        color="#080808" // Un toque de gris para que reciba algo de luz
                        metalness={0.9}
                        roughness={0.05}
                        clearcoat={1.0}
                        reflectivity={1}
                    />
                </Text3D>
            </Center>
            
            <Center top position={[0, -1.2, 0]}>
                <Text3D font={fontUrl} size={0.3} height={0.05}>
                    {content.sub}
                    <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
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
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 350);
        grad.addColorStop(0, '#cc0a32'); // Rojo más vivo
        grad.addColorStop(0.6, '#4d0312'); 
        grad.addColorStop(1, '#050001');   
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            <Environment preset="city" />

            {/* 🚀 FONDO REACTIVO: Cambiado a meshStandardMaterial para ver las luces moviéndose */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshStandardMaterial 
                    map={backgroundTexture} 
                    roughness={0.3}
                    metalness={0.2}
                    emissive="#4d0312"
                    emissiveIntensity={0.1}
                />
            </mesh>

            <MovingSpotlights isActive={isActive} />
            <InteractiveFlashlight isActive={isActive} />
            
            <Suspense fallback={null}>
                <ObsidianText language={language} isActive={isActive} />
            </Suspense>
        </group>
    );
}
