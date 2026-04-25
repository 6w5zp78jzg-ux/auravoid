'use client';
import React, { useRef, Suspense, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVideoTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

function CinemaScreen({ videoUrl, isActive }: { videoUrl: string; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const texture = useVideoTexture(videoUrl, {
    muted: true,
    loop: true,
    start: true,
  });

  // 🚀 LÓGICA DE CENTRADO Y AJUSTE "COVER"
  useEffect(() => {
    if (texture && texture.image) {
      const video = texture.image;

      const updateTexture = () => {
        const videoAspect = video.videoWidth / video.videoHeight;
        const planeAspect = 16.5 / 9.5;

        // 1. Definimos el punto de pivote en el CENTRO
        texture.center.set(0.5, 0.5);

        if (videoAspect > planeAspect) {
          // El vídeo es más ancho que el marco: recortamos laterales proporcionalmente
          // Esto "estira" el ancho para que no queden huecos a los lados
          texture.repeat.set(planeAspect / videoAspect, 1);
          texture.offset.set(0, 0); // Al estar el centro en 0.5, esto lo mantiene en medio
        } else {
          // El vídeo es más alto que el marco: recortamos arriba/abajo
          texture.repeat.set(1, videoAspect / planeAspect);
          texture.offset.set(0, 0);
        }
        
        texture.needsUpdate = true;
      };

      if (video.readyState >= 1) {
        updateTexture();
      } else {
        video.addEventListener('loadedmetadata', updateTexture);
      }
      
      return () => video.removeEventListener('loadedmetadata', updateTexture);
    }
  }, [texture]);

  return (
    <mesh ref={meshRef}>
      {/* 📏 El plano debe coincidir exactamente con el marco de la rueda */}
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
      <Suspense fallback={
        <mesh>
          <planeGeometry args={[16.5, 9.5]} />
          <meshBasicMaterial color="#020202" />
        </mesh>
      }>
        <CinemaScreen videoUrl={videoPath} isActive={isActive} />
      </Suspense>

      {/* INTERFAZ HUD (REC, ESQUINAS) */}
      <Html
        transform
        center
        distanceFactor={8.5}
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
          <div className="absolute top-10 left-10 w-16 h-16 border-t-2 border-l-2 border-white/40" />
          <div className="absolute top-10 right-10 w-16 h-16 border-t-2 border-r-2 border-white/40" />
          <div className="absolute bottom-10 left-10 w-16 h-16 border-b-2 border-l-2 border-white/40" />
          <div className="absolute bottom-10 right-10 w-16 h-16 border-b-2 border-r-2 border-white/40" />

          {/* INDICADOR REC */}
          <div className="absolute top-12 left-12 flex items-center gap-4 bg-black/40 px-6 py-2 rounded-sm backdrop-blur-md border border-white/10">
            <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]" />
            <span className="text-2xl font-bold text-red-500 tracking-tighter">REC 00:12:45:22</span>
          </div>

          {/* BARRA INFERIOR */}
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between px-12">
            <div className="flex flex-col gap-1">
                <span className="text-[12px] text-white/50 tracking-[5px] uppercase font-bold">STORAGE: 128GB // RAW</span>
                <span className="text-[10px] text-white/30 tracking-[3px]">AURA & VOID // OPTICAL_UNIT_01</span>
            </div>
            <span className="text-[12px] text-white/50 tracking-[5px]">24 FPS // 800 ISO</span>
          </div>

          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none" />
        </div>
      </Html>
    </group>
  );
}
