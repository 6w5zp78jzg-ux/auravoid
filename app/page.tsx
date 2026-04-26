'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import dynamic from 'next/dynamic';

// Importaciones dinámicas
const SceneManager = dynamic(() => import('../components/SceneManager'), { ssr: false });
const UIOverlay = dynamic(() => import('../components/UIOverlay'), { ssr: false });
const AuraVoidBackground = dynamic(() => import('../components/AuraVoidBackground'), { ssr: false });

// 🚨 COMPONENTE CHIVATO 🚨
function Loader() {
  return (
    <mesh>
      <boxGeometry args={[5, 5, 5]} />
      <meshBasicMaterial color="red" wireframe />
      <Html center>
        <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
          CARGANDO 3D...
        </div>
      </Html>
    </mesh>
  );
}

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden touch-none">
      
      {/* CAPA FONDO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AuraVoidBackground />
      </div>

      {/* CAPA 3D ÚNICA */}
      <div className="absolute inset-0 z-10">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 45], fov: 35 }} // La cámara está perfecta
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ touchAction: 'none' }} 
        >
          {/* Si hay un error, veremos el cubo rojo */}
          <Suspense fallback={<Loader />}>
            <SceneManager />
          </Suspense>
        </Canvas>
      </div>

      {/* CAPA UI */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <UIOverlay />
      </div>
      
    </main>
  );
}
