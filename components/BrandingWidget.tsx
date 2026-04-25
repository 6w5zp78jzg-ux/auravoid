'use client';
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers'; 

// --- 1. LUCES MÓVILES (Multiplicadas por 3) ---
function MovingSpotlights({ isActive }: { isActive: boolean }) {
    const groupRef1 = useRef<THREE.Group>(null);
    const groupRef2 = useRef<THREE.Group>(null);
    const groupRef3 = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef1.current || !groupRef2.current || !groupRef3.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        groupRef1.current.rotation.z = t * 0.5;
        groupRef2.current.rotation.z = t * -0.8;
        groupRef3.current.rotation.y = t * 0.6;
    });

    return (
        <group>
            <group ref={groupRef1}>
                <pointLight position={[6, 4, 2]} intensity={isActive ? 40 : 0} color="#ff0000" distance={15} />
                <pointLight position={[-6, -4, 2]} intensity={isActive ? 40 : 0} color="#ffffff" distance={15} />
            </group>
            <group ref={groupRef2}>
                <pointLight position={[4, -6, 2]} intensity={isActive ? 35 : 0} color="#ff3333" distance={12} />
                <pointLight position={[-4, 6, 2]} intensity={isActive ? 35 : 0} color="#ffffff" distance={12} />
            </group>
            <group ref={groupRef3}>
                <pointLight position={[0, 5, 3]} intensity={isActive ? 30 : 0} color="#ffffff" distance={10} />
                <pointLight position={[0, -5, 3]} intensity={isActive ? 25 : 0} color="#ffaaaa" distance={10} />
            </group>
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
    return <pointLight ref={lightRef} intensity={isActive ? 120 : 0} color="#ffffff" distance={20} decay={1.5} />;
}

// --- 3. TEXTO DE OBSIDIANA (Centrado Quirúrgico) ---
function ObsidianText({ language, isActive }: { language: string; isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const fontUrl = "https://unpkg.com/three/examples/fonts/helvetiker_bold.typeface.json";

    const TEXTOS = {
        es: { main: "BRANDING & PR", sub: "INGENIERIA DE PERCEPCION" },
        en: { main: "BRANDING & PR", sub: "PERCEPTION ENGINEERING" }
    };
    const content = language === 'es' ? TEXTOS.es : TEXTOS.en;

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05;
    });

    return (
        <group ref={groupRef} position={[0, 0, 0.8]}>
            {/* 🚀 CENTRADO DEL TÍTULO: Posición Y ligeramente arriba del centro */}
            <Center top left={false} right={false} position={[0, 0.3, 0]}>
                <Text3D font={fontUrl} size={1.1} height={0.2} bevelEnabled bevelSize={0.03} bevelThickness={0.03}>
                    {content.main}
                    <meshPhysicalMaterial 
                        color="#000000"
                        metalness={0.5}
                        roughness={0.01}
                        clearcoat={1.0}
                        clearcoatRoughness={0.01}
                        reflectivity={1}
                    />
                </Text3D>
            </Center>
            
            {/* 🚀 CENTRADO DEL SUBTÍTULO: Posición Y debajo del título */}
            <Center top left={false} right={false} position={[0, -0.8, 0]}>
                <Text3D font={fontUrl} size={0.25} height={0.05}>
                    {content.sub}
                    <meshPhysicalMaterial color="#000000" roughness={0.4} metalness={0.1} />
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
        grad.addColorStop(0, '#b3092c');
        grad.addColorStop(0.5, '#4d0312');
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            <Environment preset="city" />

            {/* Fondo Opaco */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial map={backgroundTexture} transparent={false} opacity={isActive ? 1 : 0.4} />
            </mesh>

            <MovingSpotlights isActive={isActive} />
            <InteractiveFlashlight isActive={isActive} />
            
            <Suspense fallback={null}>
                <ObsidianText language={language} isActive={isActive} />
            </Suspense>
        </group>
    );
}
