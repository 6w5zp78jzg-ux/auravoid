'use client';
import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers'; 

// --- 1. SUB-COMPONENTE: LA LINTERNA (Foco Perpendicular y Potenciado) ---
function Flashlight({ isActive }: { isActive: boolean }) {
    const lightRef = useRef<THREE.PointLight>(null);
    const { mouse, viewport } = useThree();

    useFrame(() => {
        if (!lightRef.current || !isActive) return;
        
        const x = (mouse.x * viewport.width) / 2;
        const y = (mouse.y * viewport.height) / 2;
        
        // 🚀 ENFOQUE PERPENDICULAR: Alejamos la luz a Z=3.5
        // Esto hace que la luz "bañe" el texto desde más atrás y con un radio mayor
        lightRef.current.position.set(x, y, 3.5); 
    });

    return (
        <pointLight 
            ref={lightRef} 
            // 🚀 POTENCIA +50%: Subimos a 85 para un brillo premium
            intensity={isActive ? 85 : 0} 
            color="#ffffff" 
            // 🚀 RADIO +50%: Ampliamos el rango de alcance
            distance={25} 
            decay={2}
        />
    );
}

// --- 2. SUB-COMPONENTE: FOCOS MÓVILES (Intensidad 15) ---
function MovingSpotlights() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.z = t * 0.5;
        groupRef.current.rotation.y = t * 0.2;
    });

    return (
        <group ref={groupRef}>
            <pointLight position={[4, 4, 2]} intensity={15} color="#ffffff" distance={12} />
            <pointLight position={[-4, -4, 2]} intensity={15} color="#ffffff" distance={12} />
            <pointLight position={[5, 0, 1]} intensity={10} color="#aaccff" distance={10} />
        </group>
    );
}

// --- 3. SUB-COMPONENTE: OBSIDIANA PURA ---
function ObsidianText({ language }: { language: string }) {
    const textRef = useRef<THREE.Group>(null);
    const TEXTOS = {
        es: { mainL1: "BRANDING", mainL2: "& PR", sub: "INGENIERIA DE PERCEPCION" },
        en: { mainL1: "BRANDING", mainL2: "& PR", sub: "PERCEPTION ENGINEERING" }
    };
    const currentText = language === 'es' ? TEXTOS.es : TEXTOS.en;

    const obsidianProps = {
        color: "#000000",
        metalness: 0.0,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
    };

    useFrame((state) => {
        if(!textRef.current) return;
        const t = state.clock.getElapsedTime();
        textRef.current.rotation.y = Math.sin(t * 0.1) * 0.03;
        textRef.current.rotation.x = Math.cos(t * 0.1) * 0.01;
    });

    const fontUrl = "https://unpkg.com/three/examples/fonts/helvetiker_bold.typeface.json";

    return (
        <group ref={textRef} position={[0, 0.4, 0]}>
            <Center top position={[0, 0.4, 0]}>
                <Text3D font={fontUrl} size={0.5} height={0.15} curveSegments={12} bevelEnabled bevelThickness={0.02} bevelSize={0.02} bevelOffset={0} bevelSegments={5}>
                    {currentText.mainL1}
                    <meshPhysicalMaterial {...obsidianProps} />
                </Text3D>
            </Center>
            <Center top position={[0, -0.3, 0]}>
                <Text3D font={fontUrl} size={0.5} height={0.15} curveSegments={12} bevelEnabled bevelThickness={0.02} bevelSize={0.02} bevelOffset={0} bevelSegments={5}>
                    {currentText.mainL2}
                    <meshPhysicalMaterial {...obsidianProps} />
                </Text3D>
            </Center>
            <Center top position={[0, -1.0, 0]}>
                <Text3D font={fontUrl} size={0.18} height={0.05} curveSegments={8} bevelEnabled bevelThickness={0.01} bevelSize={0.01}>
                    {currentText.sub}
                    <meshPhysicalMaterial {...obsidianProps} roughness={0.2} clearcoat={0.2} />
                </Text3D>
            </Center>
        </group>
    );
}

// --- 4. PANEL PRINCIPAL ---
export default function BrandingWidget({ isActive }: { isActive: boolean }) {
    const { language } = useLanguage();
    const [isInteracting, setIsInteracting] = useState(false);

    return (
        <div 
            className="relative w-full h-[350px] mb-12 border border-white/5 rounded-xl overflow-hidden cursor-none touch-none"
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
        >
            {/* FONDO BURDEOS POTENCIADO */}
            <div 
                className="absolute inset-0 z-0 pointer-events-none" 
                style={{ 
                    background: 'radial-gradient(circle at 50% 50%, #820620 0%, #3d020e 65%, #000000 100%)' 
                }} 
            />

            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }} className="z-10">
                <ambientLight intensity={0.02} />
                
                <Suspense fallback={null}>
                    <ObsidianText language={language} />
                    <Flashlight isActive={isActive && isInteracting} />
                    <MovingSpotlights />
                </Suspense>
            </Canvas>

            <div className="absolute top-2 left-2 text-[8px] tracking-[2px] text-white/40 uppercase font-mono pointer-events-none z-20">
                PR Legacy Core V.O.I.D.
            </div>
        </div>
    );
}
