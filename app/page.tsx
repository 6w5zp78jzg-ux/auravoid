'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import dynamic from 'next/dynamic';

// Importaciones dinámicas para evitar conflictos de tipado en el arranque
const SceneManager = dynamic(() => import('../components/SceneManager'), { ssr: false });
const UIOverlay = dynamic(() => import('../components/UIOverlay'), { ssr: false });
const AuraVoidBackground = dynamic(() => import('../components/AuraVoidBackground'), { ssr: false });

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* CAPA FONDO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AuraVoidBackground />
      </div>

      {/* CAPA UI */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <UIOverlay />
      </div>

      {/* CAPA 3D ÚNICA */}
      <div className="absolute inset-0 z-10">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 45], fov: 35 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <ScrollControls pages={3} damping={0.25}>
              <SceneManager />
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>
    </main>
  );
}
