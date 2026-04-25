'use client';
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers'; 

// --- 1. LUCES MÓVILES (Multiplicadas por 3 y con movimiento complejo) ---
function MovingSpotlights({ isActive }: { isActive: boolean }) {
    // Tres grupos de luces independientes con rotaciones únicas
    const groupRef1 = useRef<THREE.Group>(null);
    const groupRef2 = useRef<THREE.Group>(null);
    const groupRef3 = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef1.current || !groupRef2.current || !groupRef3.current || !isActive) return;
        const t = state.clock.getElapsedTime();
        
        // Grupo 1: Rotación estándar
        groupRef1.current.rotation.z = t * 0.5;
        groupRef1.current.rotation.y = t * 0.2;
        
        // Grupo 2: Rotación más rápida e inversa (Multiplicado por 2)
        groupRef2.current.rotation.z = t * -0.7;
        groupRef2.current.rotation.y = t * 0.4;
        
        // Grupo 3: Rotación lenta y profunda (Multiplicado por 3)
        groupRef3.current.rotation.z = t * 0.3;
        groupRef3.current.rotation.y = t * -0.6;
    });

    return (
        <group>
            {/* Grupo 1: Focos principales blancos y rojos (del original) */}
            <group ref={groupRef1}>
                <pointLight position={[6, 4, 2]} intensity={isActive ? 35 : 0} color="#ff0000" distance={15} />
                <pointLight position={[-6, -4, 2]} intensity={isActive ? 35 : 0} color="#ffffff" distance={15} />
                <pointLight position={[0, 0, 4]} intensity={isActive ? 25 : 0} color="#ffffff" distance={10} />
            </group>

            {/* Grupo 2: Multiplicado por 3, focos más alejados y profundos */}
            <group ref={groupRef2}>
                <pointLight position={[4, 6, 1]} intensity={isActive ? 30 : 0} color="#ff0000" distance={12} />
                <pointLight position={[-4, -6, 1]} intensity={isActive ? 30 : 0} color="#ffffff" distance={12} />
                <pointLight position={[1, 1, 3]} intensity={isActive ? 20 : 0} color="#aaccff" distance={8} />
            </group>

            {/* Grupo 3: Multiplicado por 3, focos cercanos y con coloración */}
            <group ref={groupRef3}>
                <pointLight position={[3, 3, 3]} intensity={isActive ? 25 : 0} color="#ff0000" distance={10} />
                <pointLight position={[-3, -3, 3]} intensity={isActive ? 25 : 0} color="#ffffff" distance={10} />
                <pointLight position={[-1, -1, 2]} intensity={isActive ? 15 : 0} color="#ffaa00" distance={6} />
            </group>
        </group>
    );
}

// --- 2. LINTERNA INTERACTIVA (Misma lógica, mayor intensidad) ---
function InteractiveFlashlight({ isActive }: { isActive: boolean }) {
    const lightRef = useRef<THREE.PointLight>(null);
    useFrame((state) => {
        if (!lightRef.current || !isActive) return;
        lightRef.current.position.set(state.mouse.x * 8, state.mouse.y * 4, 3.5);
    });

    return (
        <pointLight 
            ref={lightRef} 
            intensity={isActive ? 115 : 0} 
            color="#ffffff" 
            distance={20} 
            decay={1.5}
        />
    );
}

// --- 3. TEXTO DE OBSIDIANA (En una sola línea y centrado) ---
function ObsidianText({ language, isActive }: { language: string; isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const fontUrl = "https://unpkg.com/three/examples/fonts/helvetiker_bold.typeface.json";

    // 🚀 ACTUALIZACIÓN: El texto principal ahora está en una sola línea
    const TEXTOS = {
        es: { main: "BRANDING & PR", sub: "INGENIERIA DE PERCEPCION" },
        en: { main: "BRANDING & PR", sub: "PERCEPTION ENGINEERING" }
    };
    const content = language === 'es' ? TEXTOS.es : TEXTOS.en;

    const obsidianMaterial = (
        <meshPhysicalMaterial 
            color="#000000"
            metalness={0.4}
            roughness={0.02}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            reflectivity={1}
        />
    );

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05;
    });

    return (
        <group ref={groupRef} position={[0, 0, 0.8]}>
            {/* 🚀 CENTRADO ABSOLUTO: Usamos un solo Center para todo el bloque */}
            <Center top>
                <group>
                    {/* Texto principal en una sola línea (Escala mayor) */}
                    <Text3D font={fontUrl} size={1.2} height={0.25} bevelEnabled bevelSize={0.04} bevelThickness={0.04}>
                        {content.main}
                        {obsidianMaterial}
                    </Text3D>
                    
                    {/* Texto secundario centrado debajo */}
                    <Center position={[0, -2.0, 0]}>
                        <Text3D font={fontUrl} size={0.3} height={0.1}>
                            {content.sub}
                            <meshPhysicalMaterial color="#000000" roughness={0.3} metalness={0.1} />
                        </Text3D>
                    </Center>
                </group>
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
        grad.addColorStop(0, '#b3092c');   // Rojo vibrante
        grad.addColorStop(0.5, '#4d0312'); // Burdeos profundo
        grad.addColorStop(1, '#000000');   // Negro
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            <Environment preset="city" />

            {/* 🛑 EL FONDO OPACO EN Z=0 */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial map={backgroundTexture} transparent={false} opacity={isActive ? 1 : 0.4} />
            </mesh>

            {/* 🛑 EL CONTENIDO ADELANTADO (Luces x3, Linterna, Texto centrado x1 línea) */}
            <MovingSpotlights isActive={isActive} />
            <InteractiveFlashlight isActive={isActive} />
            
            <Suspense fallback={null}>
                <ObsidianText language={language} isActive={isActive} />
            </Suspense>
        </group>
    );
}
