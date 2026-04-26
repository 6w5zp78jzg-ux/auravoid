'use client';
import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Scroll } from '@react-three/drei';
import * as THREE from 'three';

// 🌐 Importamos el núcleo de la rueda que ya tienes
import SystemCore from './ServiceWheelContent';

// --- DATA DE LOS SERVICIOS (Aura) ---
const PANELS_DATA = [
  { id: '01', title: 'AURA VISUAL', description: 'Experiencias inmersivas impulsadas por WebGL y renderizado en tiempo real.' },
  { id: '02', title: 'NEURO MARKETING', description: 'Arquitectura de conversión basada en micro-interacciones psicológicas.' },
  { id: '03', title: 'VOID AI TRACKING', description: 'Modelos predictivos y análisis de comportamiento integrados en el core.' }
];

// --- COMPONENTE INTERNO: EL PANEL DE INFORMACIÓN ---
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

// --- RIG DE CÁMARA ---
function CameraRig() {
  const scroll = useScroll();
  useFrame((state) => {
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
  return (
    <group>
      {/* 1. Iluminación */}
      <ambientLight intensity={0.6} />
      <spotLight position={[0, 20, 20]} angle={0.5} penumbra={0.8} intensity={2.5} color="#8b5cf6" />
      <pointLight position={[0, -5, -15]} intensity={2} color="#4c1d95" distance={60} decay={2} />

      {/* 2. Controladores */}
      <CameraRig />

      {/* 3. La Rueda 3D */}
      <group position={[0, 0, 0]}>
        <SystemCore />
      </group>

      {/* 4. Capa HTML Sincronizada */}
      <Scroll html style={{ width: '100vw' }}>
        <div className="w-full relative pointer-events-none">
          {/* Espaciador para la entrada cinematográfica */}
          <div className="h-[120vh] w-full" />

          {/* Mapeo de paneles de texto */}
          {PANELS_DATA.map((panel) => (
            <div 
              key={panel.id} 
              className="h-[100vh] flex items-center justify-center w-full px-4 mb-[20vh] pointer-events-auto"
            >
              <InfoPanel data={panel} />
            </div>
          ))}

          {/* Espacio final */}
          <div className="h-[50vh] w-full" />
        </div>
      </Scroll>
    </group>
  );
}
