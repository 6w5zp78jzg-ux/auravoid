'use client';
import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Scroll } from '@react-three/drei';
import * as THREE from 'three';

import SystemCore from './ServiceWheelContent';

// --- DATA: 5 Entidades para mapear tus 5 Widgets ---
const PANELS_DATA = [
  { id: 'AV', title: 'AURA VISUAL', description: 'Experiencias inmersivas impulsadas por WebGL y renderizado en tiempo real.' },
  { id: 'MK', title: 'NEURO MARKETING', description: 'Arquitectura de conversión basada en micro-interacciones psicológicas.' },
  { id: 'AI', title: 'VOID AI TRACKING', description: 'Modelos predictivos y análisis de comportamiento en el DOM invisible.' },
  { id: 'BR', title: 'BRUTALIST BRANDING', description: 'Identidades visuales que no siguen tendencias, las destruyen y las crean.' },
  { id: 'EV', title: 'EVENT HORIZON', description: 'Despliegues digitales a escala masiva para lanzamientos disruptivos.' }
];

function InfoPanel({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <span className="text-xs tracking-[0.3em] uppercase text-neutral-500">
        // {data.id} //
      </span>
      <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-white mix-blend-difference">
        {data.title}
      </h2>
      <p className="text-lg md:text-xl text-neutral-400 max-w-lg font-light leading-relaxed">
        {data.description}
      </p>
      <button className="mt-8 group relative px-8 py-4 overflow-hidden rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-colors duration-500 pointer-events-auto">
        <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
        <span className="relative z-10 text-sm tracking-widest uppercase group-hover:text-black transition-colors duration-500 mix-blend-difference text-white">
          Explorar Entidad
        </span>
      </button>
    </div>
  );
}

function CameraRig() {
  const scroll = useScroll();
  useFrame((state) => {
    // La cámara converge al centro absoluto (Y:0) y se acerca (Z:28)
    const targetY = THREE.MathUtils.lerp(12, 0, scroll.offset);
    const targetZ = THREE.MathUtils.lerp(45, 28, scroll.offset); 
    const targetRotX = THREE.MathUtils.lerp(-Math.PI / 10, 0, scroll.offset);
    
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.07);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.07);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.07);
  });
  return null;
}

export default function SceneManager() {
  // 🧠 ESTADO MAESTRO: La telepatía entre WebGL y HTML
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <group>
      <ambientLight intensity={0.6} />
      <spotLight position={[0, 20, 20]} angle={0.5} penumbra={0.8} intensity={2.5} color="#8b5cf6" />
      <pointLight position={[0, -5, -15]} intensity={2} color="#4c1d95" distance={60} decay={2} />

      <CameraRig />

      {/* Inyectamos el estado a la Rueda */}
      <group position={[0, 0, 0]}>
        <SystemCore activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      </group>

      <Scroll html style={{ width: '100vw' }}>
        <div className="w-full relative pointer-events-none">
          {/* Espacio vacío durante el zoom (Página 1 y mitad de la 2) */}
          <div className="h-[150vh] w-full" />

          {/* El contenido aparece dinámicamente según el widget enfocado */}
          <div className="h-[100vh] flex items-center justify-center w-full px-4 pointer-events-auto">
             {/* Animación CSS sutil mediante key (fuerza re-render visual al cambiar índice) */}
             <div key={activeIndex} className="animate-fade-in-up">
               <InfoPanel data={PANELS_DATA[activeIndex]} />
             </div>
          </div>
          
          <div className="h-[50vh] w-full" />
        </div>
      </Scroll>
    </group>
  );
}
