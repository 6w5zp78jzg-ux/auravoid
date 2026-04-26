'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Html, useProgress } from '@react-three/drei';
import dynamic from 'next/dynamic';

// Importaciones dinámicas sin SSR (Vital para que el objeto 'window' no colapse en Next.js)
// Nota de diseño: Si configuras los alias de Next.js en tu tsconfig.json, cambia '../components/' por '@/components/'
const SceneManager = dynamic(() => import('../components/SceneManager'), { ssr: false });
const UIOverlay = dynamic(() => import('../components/UIOverlay'), { ssr: false });
const AuraVoidBackground = dynamic(() => import('../components/AuraVoidBackground'), { ssr: false });

// ✦ Vanguard Upgrade: Bootloader Holográfico ✦
// Esto evita el 'pantallazo negro' mientras los recursos pesados del 3D se compilan en WebGL.
function TerminalBootloader() {
  const { progress } = useProgress();
  return (
    <Html center zIndexRange={[100, 0]}>
      <div className="flex flex-col items-center justify-center pointer-events-none select-none">
        <span className="text-emerald-400 font-mono text-sm md:text-base tracking-[0.2em] animate-pulse whitespace-nowrap drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
          {`// CARGANDO_MOTOR_VOID [ ${progress.toFixed(0)}% ]`}
        </span>
        <div className="w-32 h-[1px] bg-emerald-400/20 mt-2 overflow-hidden">
          <div 
            className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]" 
            style={{ width: `${progress}%`, transition: 'width 0.1s ease-out' }}
          />
        </div>
      </div>
    </Html>
  );
}

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-[#020202] overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* CAPA 0: FONDO INMERSIVO */}
      {/* Aislado para no disparar re-renders en el Canvas 3D */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AuraVoidBackground />
      </div>

      {/* CAPA 1: NÚCLEO WEBGL */}
      <div className="absolute inset-0 z-10">
        <Canvas
          // dpr={[1, 2]} limita la densidad de píxeles a 2 (ideal para no freír las GPUs de dispositivos Retina como el iPad)
          dpr={[1, 2]} 
          camera={{ position: [0, 0, 45], fov: 35 }}
          gl={{ 
            antialias: true, 
            alpha: true, 
            powerPreference: 'high-performance', // Fuerza a usar la GPU dedicada si está disponible
            stencil: false, // Apaga buffers innecesarios para ganar FPS
            depth: true 
          }}
        >
          <Suspense fallback={<TerminalBootloader />}>
            {/* damping={0.1} da un scroll más suave y "pesado", distance={1} ajusta la longitud del scroll */}
            <ScrollControls pages={3} damping={0.1} distance={1}>
              <SceneManager />
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>

      {/* CAPA 2: HUD UI OVERLAY */}
      {/* CRÍTICO: El wrapper debe ser pointer-events-none para no tapar el Scroll del Canvas.
          Asegúrate de que dentro de UIOverlay.tsx tus botones tengan pointer-events-auto */}
      <div className="absolute inset-0 z-50 pointer-events-none flex flex-col w-full h-full">
        <UIOverlay />
      </div>

    </main>
  );
}
