'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import dynamic from 'next/dynamic';

// Importaciones dinámicas estrictas para Client-Side Rendering del entorno WebGL
const SceneManager = dynamic(() => import('../components/SceneManager'), { ssr: false });
const UIOverlay = dynamic(() => import('../components/UIOverlay'), { ssr: false });
const AuraVoidBackground = dynamic(() => import('../components/AuraVoidBackground'), { ssr: false });

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* CAPA FONDO (Base inmersiva) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AuraVoidBackground />
      </div>

      {/* CAPA UI (Interacciones HTML/DOM por encima del Canvas) */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <UIOverlay />
      </div>

      {/* CAPA 3D ÚNICA (Rendimiento Extremo) */}
      <div className="absolute inset-0 z-10">
        <Canvas
          dpr={[1, 2]} // Optimización de densidad de píxeles (Vanguardia)
          // ⚠️ ALINEACIÓN CRÍTICA: Y=12 coincide con el inicio del Lerp en SceneManager
          camera={{ position: [0, 12, 45], fov: 35 }} 
          gl={{ 
            antialias: true, 
            alpha: true, 
            powerPreference: 'high-performance',
            stencil: false, // Ligera optimización si no usas máscaras
            depth: true
          }}
        >
          <Suspense fallback={null}>
            {/* pages={3} define la "longitud" del viaje cinemático hacia el monolito.
                damping={0.25} añade una inercia sutil al scroll del ratón/trackpad */}
            <ScrollControls pages={3} damping={0.25}>
              <SceneManager />
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>
    </main>
  );
}
