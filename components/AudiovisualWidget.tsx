'use client';
import React, { useRef, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVideoTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

function CinemaScreen({ videoUrl, isActive }: { videoUrl: string; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // 🚀 Cargamos la textura del vídeo. 
  // Importante: muted y playsInline son obligatorios para que iPad no lo bloquee.
  const texture = useVideoTexture(videoUrl, {
    muted: true,
    loop: true,
    start: true,
  });

  useFrame((state) => {
    if (!meshRef.current || !isActive) return;
    // Efecto de inclinación suave que pedías
    const x = (state.mouse.x * Math.PI) / 25;
    const y = (state.mouse.y * Math.PI) / 25;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x, 0.1);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y, 0.1);
  });

  return (
    <mesh ref={meshRef}>
      {/* Ajustado al tamaño del marco de la rueda (16.5 x 9.5) */}
      <planeGeometry args={[16.2, 9.2]} />
      <meshBasicMaterial 
        map={texture} 
        toneMapped={false} 
        transparent 
        opacity={isActive ? 1 : 0.2} 
      />
    </mesh>
  );
}

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
  const videoPath = "/video/alpha.mp4";

  // NUNCA devolver null, usamos visibilidad para no romper la rueda
  return (
    <group>
      {/* 1. CAPA DE VÍDEO 3D (Nativo) */}
      <Suspense fallback={<mesh><planeGeometry args={[16, 9]} /><meshBasicMaterial color="#050505" /></mesh>}>
        <CinemaScreen videoUrl={videoPath} isActive={isActive} />
      </Suspense>

      {/* 2. CAPA DE INTERFAZ HTML (UI de cámara) */}
      <Html
        transform
        center
        distanceFactor={8}
        occlude={false}
        style={{
          width: '800px',
          height: '500px',
          pointerEvents: 'none', // Importante para que no bloquee el arrastre de la rueda
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <div className="relative w-full h-full font-mono text-white select-none">
          {/* Esquineras de cámara (Tus originales, escaladas) */}
          <div className="absolute top-10 left-10 w-16 h-16 border-t-4 border-l-4 border-white/40" />
          <div className="absolute top-10 right-10 w-16 h-16 border-t-4 border-r-4 border-white/40" />
          <div className="absolute bottom-10 left-10 w-16 h-16 border-b-4 border-l-4 border-white/40" />
          <div className="absolute bottom-10 right-10 w-16 h-16 border-b-4 border-r-4 border-white/40" />

          {/* REC INDICATOR */}
          <div className="absolute top-12 left-12 flex items-center gap-4 bg-black/40 px-6 py-2 rounded-md backdrop-blur-md">
            <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]" />
            <span className="text-2xl font-bold text-red-500 tracking-tighter">REC 00:12:45:22</span>
          </div>

          {/* BARRA INFERIOR */}
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between px-12">
            <div className="flex flex-col">
                <span className="text-[12px] text-white/50 tracking-[5px] uppercase">STORAGE: 128GB // RAW</span>
                <span className="text-[10px] text-white/30 tracking-[2px]">AURA & VOID // OPTICAL_UNIT_01</span>
            </div>
            <span className="text-[12px] text-white/50 tracking-[5px]">24 FPS // 800 ISO</span>
          </div>

          {/* Viñeta interna CSS */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] pointer-events-none" />
        </div>
      </Html>
    </group>
  );
}
