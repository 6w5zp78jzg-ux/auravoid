'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import dynamic from 'next/dynamic';

// Importaciones dinámicas para evitar errores de SSR (Server Side Rendering)
const SceneManager = dynamic(() => import('@/components/SceneManager'), { ssr: false });
const UIOverlay = dynamic(() => import('@/components/UIOverlay'), { ssr: false });
const AuraVoidBackground = dynamic(() => import('@/components/AuraVoidBackground'), { ssr: false });

export default function Home() {
  return (
    // 'overflow-hidden' es vital: bloqueamos el scroll feo del navegador
    <main className="relative w-full h-screen bg-black overflow-hidden font-sans">
      
      {/* 🌌 CAPA 0: FONDO VORONOI (Fixed y detrás de todo) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AuraVoidBackground />
      </div>

      {/* 💎 CAPA 2: INTERFAZ DE USUARIO (Logos, Idioma, Navegación) */}
      {/* Usamos z-50 para que siempre esté por encima del 3D */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <UIOverlay />
      </div>

      {/* 🎬 CAPA 1: EL MOTOR WEBGL ÚNICO */}
      <div className="absolute inset-0 z-10">
        <Canvas
          shadows
          dpr={[1, 2]} // Optimización para pantallas Retina
          camera={{ position: [0, 0, 45], fov: 35 }}
          gl={{ 
            antialias: true, 
            alpha: true, 
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
          }}
        >
          {/* Luces globales del escenario */}
          <ambientLight intensity={0.5} />
          <pointLight position={[20, 20, 20]} intensity={1} />
          <spotLight position={[-20, 20, 10]} angle={0.15} penumbra={1} intensity={1} />

          <Suspense fallback={null}>
            {/* 🚀 EL CORAZÓN DEL DISEÑO: ScrollControls
                - pages={3}: Define cuánto "espacio virtual" hay para scrollear.
                - damping={0.25}: Es la inercia. Cuanto más bajo, más "pesado" y premium se siente.
                - distance={1}: Multiplicador de velocidad.
            */}
            <ScrollControls pages={3} damping={0.25} infinite={false}>
              
              {/* 1. Elementos 3D que reaccionan al scroll */}
              <SceneManager />

              {/* 2. Capa de HTML que viaja con el scroll 3D (Opcional)
                  Si quieres meter textos que se muevan con el scroll, van aquí dentro.
              */}
              <Scroll html>
                <div className="w-screen h-[300vh] pointer-events-none">
                  {/* Aquí podrías poner indicadores de sección discretos */}
                </div>
              </Scroll>

            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>

      {/* 🚨 ESTILOS CRÍTICOS PARA EL FEELING AGENCIA 🚨 */}
      <style jsx global>{`
        * {
          user-select: none; /* Evita que el usuario seleccione texto por error al arrastrar */
        }
        
        canvas {
          touch-action: none; /* Importante para que el iPad no intente hacer scroll nativo */
        }

        /* Ocultamos cualquier rastro de scrollbar */
        ::-webkit-scrollbar {
          display: none;
        }
        html, body {
          -ms-overflow-style: none;
          scrollbar-width: none;
          background: black;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}
