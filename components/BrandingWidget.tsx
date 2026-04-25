'use client';
import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers'; 

// --- 1. LINTERNA (Optimizado) ---
function Flashlight({ isActive }: { isActive: boolean }) {
    const lightRef = useRef<THREE.PointLight>(null);
    const { mouse } = useThree();

    useFrame(() => {
        if (!lightRef.current || !isActive) return;
        // Mapeo suave del ratón/toque sobre el panel
        lightRef.current.position.set(mouse.x * 6, mouse.y * 4, 3.5); 
    });

    return (
        <pointLight 
            ref={lightRef} 
            intensity={isActive ? 100 : 0} 
            color="#ffffff" 
            distance={25} 
            decay={2}
        />
    );
}

// --- 2. FOCOS MÓVILES (Solo activos si se ven) ---
function MovingSpotlights({ visible }: { visible: boolean }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !visible) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.z = t * 0.5;
        groupRef.current.rotation.y = t * 0.2;
    });

    return (
        <group ref={groupRef} visible={visible}>
            <pointLight position={[4, 4, 2]} intensity={15} color="#ffffff" distance={12} />
            <pointLight position={[-4, -4, 2]} intensity={15} color="#ffffff" distance={12} />
            <pointLight position={[5, 0, 1]} intensity={10} color="#aaccff" distance={10} />
        </group>
    );
}

// --- 3. OBSIDIANA PURA (Aumentada a tamaño Hero) ---
function ObsidianText({ language, visible }: { language: string, visible: boolean }) {
    const textRef = useRef<THREE.Group>(null);
    const TEXTOS = {
        es: { mainL1: "BRANDING", mainL2: "& PR", sub: "INGENIERIA DE PERCEPCION" },
        en: { mainL1: "BRANDING", mainL2: "& PR", sub: "PERCEPTION ENGINEERING" }
    };
    const currentText = language === 'es' ? TEXTOS.es : TEXTOS.en;

    const obsidianProps = {
        color: "#000000",
        metalness: 1.0,
        roughness: 0.02, // Más pulido para que brille más
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
    };

    useFrame((state) => {
        if(!textRef.current || !visible) return;
        const t = state.clock.getElapsedTime();
        textRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
    });

    const fontUrl = "https://unpkg.com/three/examples/fonts/helvetiker_bold.typeface.json";

    return (
        <group ref={textRef} position={[0, 0, 0.2]} visible={visible}>
            <Center top position={[0, 1.2, 0]}>
                <Text3D font={fontUrl} size={1.2} height={0.3} curveSegments={12}>
                    {currentText.mainL1}
                    <meshPhysicalMaterial {...obsidianProps} />
                </Text3D>
            </Center>
            <Center top position={[0, -0.2, 0]}>
                <Text3D font={fontUrl} size={1.2} height={0.3} curveSegments={12}>
                    {currentText.mainL2}
                    <meshPhysicalMaterial {...obsidianProps} />
                </Text3D>
            </Center>
            <Center top position={[0, -1.8, 0]}>
                <Text3D font={fontUrl} size={0.35} height={0.1}>
                    {currentText.sub}
                    <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
                </Text3D>
            </Center>
        </group>
    );
}

// --- 4. PANEL PRINCIPAL ---
export default function BrandingWidget({ isActive }: { isActive: boolean }) {
    const { language } = useLanguage();
    const [isInteracting, setIsInteracting] = useState(false);

    // --- REGLA DE ORO: NUNCA DEVOLVER NULL ---

    return (
        <group 
            onPointerOver={() => setIsInteracting(true)}
            onPointerOut={() => setIsInteracting(false)}
        >
            {/* CAPA 1: EL FONDO HTML */}
            <Html 
                transform 
                center 
                distanceFactor={8} // 🚀 Tamaño Hero
                position={[0, 0, -0.1]}
                style={{
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: 'opacity 0.6s ease-in-out',
                }}
            >
                <div className="relative w-[800px] h-[500px] border border-white/5 rounded-xl overflow-hidden pointer-events-none">
                    <div 
                        className="absolute inset-0 z-0" 
                        style={{ background: 'radial-gradient(circle at 50% 50%, #820620 40%, #000000 100%)' }} 
                    />
                    <div className="absolute top-10 left-10 text-[14px] tracking-[4px] text-white/40 uppercase font-mono z-20">
                        PR_LEGACY_CORE // V.O.I.D.
                    </div>
                </div>
            </Html>

            {/* CAPA 2: ELEMENTOS 3D (Solo visibles y activos si isActive es true) */}
            <ObsidianText language={language} visible={isActive} />
            <Flashlight isActive={isActive && isInteracting} />
            <MovingSpotlights visible={isActive} />
        </group>
    );
}
