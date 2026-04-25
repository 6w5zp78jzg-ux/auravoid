
'use client';
import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers'; 

// --- 1. LINTERNA (Intacta, adaptada al espacio global) ---
function Flashlight({ isActive }: { isActive: boolean }) {
    const lightRef = useRef<THREE.PointLight>(null);
    const { mouse } = useThree();

    useFrame(() => {
        if (!lightRef.current || !isActive) return;
        
        // Multiplicamos por un factor para que cubra bien el widget
        const x = mouse.x * 4;
        const y = mouse.y * 3;
        
        lightRef.current.position.set(x, y, 3.5); 
    });

    return (
        <pointLight 
            ref={lightRef} 
            intensity={isActive ? 85 : 0} 
            color="#ffffff" 
            distance={25} 
            decay={2}
        />
    );
}

// --- 2. FOCOS MÓVILES (Intactos) ---
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

// --- 3. OBSIDIANA PURA (Intacta) ---
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
        <group ref={textRef} position={[0, 0, 0]}>
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

// --- 4. PANEL PRINCIPAL (El Híbrido WebGL + HTML) ---
export default function BrandingWidget({ isActive }: { isActive: boolean }) {
    const { language } = useLanguage();
    const [isInteracting, setIsInteracting] = useState(false);

    if (!isActive) return null;

    return (
        // El widget ahora devuelve un <group> nativo de Three.js
        <group 
            onPointerOver={() => setIsInteracting(true)}
            onPointerOut={() => setIsInteracting(false)}
        >
            {/* CAPA 1: EL FONDO HTML (Renderizado en el espacio 3D detrás del texto) */}
            {/* position Z negativa lo empuja hacia el fondo para que el 3D flote delante */}
            <Html transform center distanceFactor={12} position={[0, 0, -0.5]}>
                <div className="relative w-[500px] h-[350px] border border-white/5 rounded-xl overflow-hidden pointer-events-none">
                    <div 
                        className="absolute inset-0 z-0" 
                        style={{ background: 'radial-gradient(circle at 50% 50%, #820620 0%, #3d020e 65%, #000000 100%)' }} 
                    />
                    <div className="absolute top-4 left-4 text-[10px] tracking-[2px] text-white/40 uppercase font-mono z-20">
                        PR Legacy Core V.O.I.D.
                    </div>
                </div>
            </Html>

            {/* CAPA 2: LOS ELEMENTOS 3D NATIVOS (Flotan sobre el HTML) */}
            <ObsidianText language={language} />
            <Flashlight isActive={isActive && isInteracting} />
            <MovingSpotlights />
        </group>
    );
}
