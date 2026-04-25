'use client';
import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVideoTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

function CinemaScreen({ videoUrl, isActive }: { videoUrl: string; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // 🚀 Cargamos el vídeo con los flags críticos para iPad/Safari
  const texture = useVideoTexture(videoUrl, {
    muted: true,
    loop: true,
    start: true,
  });

  useFrame((state) => {
    if (!meshRef.current || !isActive) return;
    
    // 💡 REDUCIMOS LA INCLINACIÓN: 
    // Antes era muy fuerte y por eso se veía lo de atrás. 
    // Ahora es un sutil efecto de profundidad.
    const x = (state.mouse.x * Math.PI) / 40; 
    const y = (state.mouse.y * Math.PI) / 40;
    
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y, 0.05);
  });

  return (
    <mesh ref={meshRef}>
      {/* 📏 TAMAÑO TOTAL: Cubre exactamente el marco 16.5 x 9.5 de la rueda */}
      <planeGeometry args={[16.5, 9.5]} />
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

  return (
    <group>
      {/* 1. EL VÍDEO (Sin Canvas interno, directo al motor de la rueda) */}
      <Suspense fallback={
        <mesh>
          <planeGeometry args={[16.5, 9.5]} />
          <meshBasicMaterial color="#020202" />
        </mesh>
      }>
        <CinemaScreen videoUrl={videoPath} isActive={isActive} />
      </Suspense>

      {/* 2. LA INTERFAZ (REC y Datos técnicos) */}
      <Html
        transform
        center
        distanceFactor={8.5} // Ajuste para que encaje visualmente
        occlude={false}
        style={{
          width: '800px',
          height: '500px',
          pointerEvents: 'none', 
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      >
        <div className="relative w-full h-full font-mono text-white select-none">
          {/* Esquineras de cámara */}
          <div className="absolute top-8 left-8 w-14 h-14 border-t-2 border-l-2 border-white/30" />
          <div className="absolute top-8 right-8 w-14 h-14 border-t-2 border-r-2 border-white/30" />
          <div className="absolute bottom-8 left-8 w-14 h-14 border-b-2 border-l-2 border-white/30" />
          <div className="absolute bottom-8 right-8 w-14 h-14 border-b-2 border-r-2 border-white/30" />

          {/* INDICADOR REC EN VIVO */}
          <div className="absolute top-10 left-10 flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-sm backdrop-blur-md border border-white/10">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
            <span className="text-xl font-bold text-red-500 tracking-tighter">REC 00:12:45:22</span>
          </div>

          {/* DATOS TÉCNICOS INFERIORES */}
          <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between px-10 pb-8">
            <div className="flex flex-col">
                <span className="text-[10px] text-white/40 tracking-[4px] uppercase">OPTICAL UNIT: AURA_01</span>
                <span className="text-[11px] text-white/60 tracking-[2px]">RAW 4:4:4 // LOG-C</span>
            </div>
            <div className="text-right">
                <span className="text-[11px] text-white/60 tracking-[4px]">24 FPS // ISO 800</span>
            </div>
          </div>

          {/* Viñeta sutil para integrar el vídeo en el 3D */}
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.7)] pointer-events-none" />
        </div>
      </Html>
    </group>
  );
}
