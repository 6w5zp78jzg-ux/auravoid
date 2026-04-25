'use client';
import React, { useRef, Suspense, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVideoTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. PANTALLA DE CINE AMBIENTAL (Texturizado Total) ---
function CinemaScreen({ videoUrl, isActive }: { videoUrl: string; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // 🚀 Cargamos la textura con los flags críticos para iPad/Safari
  // Aseguramos que muted y playsInline estén activados.
  const texture = useVideoTexture(videoUrl, {
    muted: true,
    loop: true,
    start: true,
  });

  // 🚀 AJUSTE DE COBERTURA: Convertimos la textura en "object-fit: cover"
  // Esto estira la textura para que no haya bordes negros, 
  // incluso si la relación de aspecto no es perfecta.
  useEffect(() => {
    if (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.matrixAutoUpdate = false;
        
        // Calculamos el factor de escala para 'cover' (cubrir)
        const aspectPlane = 16.5 / 9.5; // El aspecto de la malla del widget
        const aspectVideo = 16 / 9; // El aspecto de tu vídeo
        
        if (aspectPlane > aspectVideo) {
            // Plano más ancho que el vídeo
            const scaleY = aspectVideo / aspectPlane;
            texture.matrix.setUvTransform(0, (1 - scaleY) / 2, 1, scaleY, 0, 0.5, 0.5);
        } else {
            // Plano más alto que el vídeo (raro, pero manejado)
            const scaleX = aspectPlane / aspectVideo;
            texture.matrix.setUvTransform((1 - scaleX) / 2, 0, scaleX, 1, 0, 0.5, 0.5);
        }
        texture.needsUpdate = true;
    }
  }, [texture]);

  useFrame((state) => {
    if (!meshRef.current || !isActive) return;
    
    // 💡 EFECTO DE PROFUNDIDAD SUTIL (No rotación)
    // Usamos el ratón solo para un brillo emissive muy leve,
    // evitando que la geometría se mueva y exponga el fondo negro.
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    const intensity = THREE.MathUtils.lerp(1, 1.3, Math.abs(state.mouse.x) * 0.5);
    // Aplicamos toneMapped false para un efecto neón siisActive
    material.color.set(isActive ? "#ffffff" : "#cccccc");
  });

  return (
    <mesh ref={meshRef}>
      {/* 📏 TAMAÑO TOTAL: Cubre exactamente el marco 16.5 x 9.5 de la chasis */}
      <planeGeometry args={[16.5, 9.5]} />
      {/* Usamos un material simple y brillante que Safari puede manejar */}
      <meshBasicMaterial 
        map={texture} 
        toneMapped={false} // Desactivado para un brillo premium
        transparent 
        opacity={isActive ? 1 : 0.3} 
      />
    </mesh>
  );
}

// --- 2. EL PANEL PRINCIPAL ---
export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
  // 💡 Ruta al archivo de vídeo (Asegúrate de que está en /public/video/alpha.mp4)
  const videoPath = "/video/alpha.mp4";

  // NUNCA devolver null, usamos visibilidad para no romper la rueda en el iPad
  return (
    <group>
      {/* 1. EL VÍDEO COMPLETO (Nativo WebGL, Sin Canvas interno) */}
      {/* Fallback de color sólido mientras carga */}
      <Suspense fallback={
        <mesh>
          <planeGeometry args={[16.5, 9.5]} />
          <meshBasicMaterial color="#020202" />
        </mesh>
      }>
        <CinemaScreen videoUrl={videoPath} isActive={isActive} />
      </Suspense>

      {/* 2. LA INTERFAZ HTML (UI de cámara) */}
      <Html
        transform
        center
        // distanceFactor corregido para la escala HeroMasiva
        distanceFactor={8.5} 
        occlude={false}
        style={{
          width: '800px',
          height: '500px',
          pointerEvents: 'none', // Importante para que no bloquee el arrastre de la rueda
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      >
        <div className="relative w-full h-full font-mono text-white select-none">
          {/* Esquineras de cámara (Tus originales, escaladas) */}
          <div className="absolute top-10 left-10 w-16 h-16 border-t-2 border-l-2 border-white/40" />
          <div className="absolute top-10 right-10 w-16 h-16 border-t-2 border-r-2 border-white/40" />
          <div className="absolute bottom-10 left-10 w-16 h-16 border-b-2 border-l-2 border-white/40" />
          <div className="absolute bottom-10 right-10 w-16 h-16 border-b-2 border-r-2 border-white/40" />

          {/* INDICADOR REC EN VIVO */}
          <div className="absolute top-12 left-12 flex items-center gap-4 bg-black/40 px-6 py-2 rounded-sm backdrop-blur-md border border-white/10">
            <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]" />
            <span className="text-2xl font-bold text-red-500 tracking-tighter">REC 00:12:45:22</span>
          </div>

          {/* BARRA INFERIOR DE DATOS TÉCNICOS */}
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between px-12">
            <div className="flex flex-col gap-1">
                <span className="text-[12px] text-white/50 tracking-[5px] uppercase font-bold">STORAGE: 128GB // RAW // LOG-C</span>
                <span className="text-[10px] text-white/30 tracking-[3px]">AURA & VOID // OPTICAL_UNIT_01</span>
            </div>
            <div className="text-right">
                <span className="text-[12px] text-white/50 tracking-[5px]">24 FPS // 800 ISO // 5600K</span>
            </div>
          </div>

          {/* Viñeta interna CSS para dar profundidad */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none" />
        </div>
      </Html>
    </group>
  );
}
