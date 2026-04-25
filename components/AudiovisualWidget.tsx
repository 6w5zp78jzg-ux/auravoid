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

  // 🚀 LÓGICA DE AJUSTE "COVER" INFALIBLE
  useEffect(() => {
    if (texture && texture.image) {
      const video = texture.image;

      const updateTexture = () => {
        const videoAspect = video.videoWidth / video.videoHeight;
        const planeAspect = 16.5 / 9.5;

        // Reset de la textura
        texture.matrixAutoUpdate = false;
        
        // Calculamos el factor de escala
        let scaleX = 1;
        let scaleY = 1;
        let offsetX = 0;
        let offsetY = 0;

        if (videoAspect > planeAspect) {
          // El vídeo es más ancho que el marco: recortamos laterales
          scaleX = planeAspect / videoAspect;
          offsetX = (1 - scaleX) / 2;
        } else {
          // El vídeo es más alto que el marco: recortamos arriba/abajo
          scaleY = videoAspect / planeAspect;
          offsetY = (1 - scaleY) / 2;
        }

        // Aplicamos la transformación "Cover"
        texture.matrix.setUvTransform(offsetX, offsetY, scaleX, scaleY, 0, 0.5, 0.5);
      };

      // Si el vídeo ya cargó los datos, actualizamos; si no, esperamos al evento
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
      {/* Usamos el tamaño exacto del marco */}
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
          <meshBasicMaterial color="#050505" />
        </mesh>
      }>
        <CinemaScreen videoUrl={videoPath} isActive={isActive} />
      </Suspense>

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
          {/* Esquineras */}
          <div className="absolute top-10 left-10 w-16 h-16 border-t-2 border-l-2 border-white/40" />
          <div className="absolute top-10 right-10 w-16 h-16 border-t-2 border-r-2 border-white/40" />
          <div className="absolute bottom-10 left-10 w-16 h-16 border-b-2 border-l-2 border-white/40" />
          <div className="absolute bottom-10 right-10 w-16 h-16 border-b-2 border-r-2 border-white/40" />

          {/* REC */}
          <div className="absolute top-12 left-12 flex items-center gap-4 bg-black/40 px-6 py-2 rounded-sm backdrop-blur-md">
            <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]" />
            <span className="text-2xl font-bold text-red-500 tracking-tighter">REC 00:12:45:22</span>
          </div>

          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none" />
        </div>
      </Html>
    </group>
  );
}
