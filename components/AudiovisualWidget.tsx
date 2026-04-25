'use client';
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useVideoTexture, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function CinemaScreen({ videoUrl }: { videoUrl: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useVideoTexture(videoUrl, {
        muted: true,
        loop: true,
        start: true
    });

    // 🚀 AJUSTE DE ESCALA: Forzamos a la textura a comportarse como "cover"
    // Esto evita que se vean bordes negros o que el vídeo no llegue a las esquinas
    texture.matrixAutoUpdate = false;
    const aspect = 16 / 9; // El aspecto de tu vídeo
    const screenAspect = 3.5 / 2; // El aspecto de nuestro marco visual
    texture.matrix.setUvTransform(0, 0, 1, 1, 0, 0.5, 0.5);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Inclinación suave para dar profundidad
        const x = (state.mouse.x * Math.PI) / 20;
        const y = (state.mouse.y * Math.PI) / 20;
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x, 0.1);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y, 0.1);
    });

    return (
        <mesh ref={meshRef}>
            {/* 🚀 PLANO A MEDIDA: Ajustado para llenar el widget */}
            <planeGeometry args={[4.2, 2.4]} /> 
            <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
    );
}

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
    const videoPath = "/video/alpha.mp4";

    if (!isActive) return null;

    return (
        <div className="relative w-full h-[350px] mb-12 bg-black border border-white/10 rounded-lg overflow-hidden group shadow-2xl">
            
            {/* CAPA DE INTERFAZ (Encima del video) */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {/* Esquineras de cámara */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/40" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/40" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/40" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/40" />
                
                {/* Barra de estado inferior */}
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-8">
                    <span className="text-[7px] text-white/50 tracking-[3px] font-mono uppercase">Internal Storage: 128GB // RAW</span>
                    <span className="text-[7px] text-white/50 tracking-[3px] font-mono">24 FPS // 800 ISO</span>
                </div>
            </div>

            {/* UI: REC Y CÓDIGO DE TIEMPO */}
            <div className="absolute top-8 left-8 z-30 flex items-center gap-3 font-mono text-[9px] text-red-500 font-bold bg-black/40 px-3 py-1 rounded-sm backdrop-blur-md">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span>REC 00:12:45:22</span>
            </div>

            <Canvas dpr={[1, 2]} className="z-10">
                <PerspectiveCamera makeDefault position={[0, 0, 3]} />
                <Suspense fallback={null}>
                    <CinemaScreen videoUrl={videoPath} />
                </Suspense>
            </Canvas>

            {/* Efecto de viñeta para dar profundidad */}
            <div className="absolute inset-0 z-15 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
        </div>
    );
}
