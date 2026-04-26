'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';

// Importaciones dinámicas
const SceneManager = dynamic(() => import('../components/SceneManager'), { ssr: false });
const UIOverlay = dynamic(() => import('../components/UIOverlay'), { ssr: false });
const AuraVoidBackground = dynamic(() => import('../components/AuraVoidBackground'), { ssr: false });

export default function Home() {
  return (
    // overflow-hidden y touch-none son vitales para iPad
    <main className="relative w-full h-screen bg-black overflow-hidden touch-none">
      
      {/* CAPA FONDO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AuraVoidBackground />
      </div>

      {/* CAPA 3D ÚNICA */}
      {/* z-10: Está por encima del fondo, recibe los clicks */}
      <div className="absolute inset-0 z-10">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 45], fov: 35 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          // Quitamos los eventos táctiles nativos del navegador
          style={{ touchAction: 'none' }} 
        >
          {/* Hemos eliminado el ScrollControls que estaba bloqueando la pantalla */}
          <Suspense fallback={null}>
            <SceneManager />
          </Suspense>
        </Canvas>
      </div>

      {/* CAPA UI */}
      {/* z-50: Está por encima del 3D, pero con pointer-events-none para no bloquear */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <UIOverlay />
      </div>
      
    </main>
  );
}
