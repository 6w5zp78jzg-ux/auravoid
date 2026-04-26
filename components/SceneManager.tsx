'use client';
import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Scroll } from '@react-three/drei';
import * as THREE from 'three';

import SystemCore from './ServiceWheelContent';

// --- DATA ---
const PANELS_DATA = [
  { id: 'AV', title: 'AURA VISUAL', description: 'Experiencias inmersivas y renderizado.' },
  { id: 'MK', title: 'NEURO MARKETING', description: 'Micro-interacciones de alta conversión.' },
  { id: 'AI', title: 'AI TRACKING', description: 'Modelos predictivos en el DOM.' },
  { id: 'BR', title: 'BRUTAL BRANDING', description: 'Identidades que destruyen tendencias.' },
  { id: 'EV', title: 'EVENT HORIZON', description: 'Lanzamientos a escala masiva.' }
];

// --- PANEL DE INFORMACIÓN ---
function InfoPanel({ data, progress }: { data: any, progress: number }) {
  // Calculamos opacidad: Solo aparece cuando el scroll pasa el 50%
  const opacity = Math.max(0, (progress - 0.5) * 2);

  return (
    <div style={{ opacity }} className="flex flex-col items-center justify-center h-full text-center space-y-6 transition-opacity duration-300">
      <span className="text-xs tracking-[0.3em] uppercase text-neutral-500">
        // {data.id} //
      </span>
      <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-white mix-blend-difference">
        {data.title}
      </h2>
      <p className="text-lg md:text-xl text-neutral-400 max-w-lg font-light leading-relaxed">
        {data.description}
      </p>
      <button className="mt-8 group relative px-8 py-4 overflow-hidden rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-colors pointer-events-auto">
        <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
        <span className="relative z-10 text-sm tracking-widest uppercase group-hover:text-black text-white mix-blend-difference">
          Explorar Entidad
        </span>
      </button>
    </div>
  );
}

// --- CÁMARA (El Encuadre Perfecto) ---
function CameraRig() {
  const scroll = useScroll();
  useFrame((state) => {
    // El zoom ocurre en la primera mitad del scroll (0 a 0.5)
    const zoomProgress = Math.min(scroll.offset * 2, 1);
    
    // Y: Baja de 12 a 6.5 (el centro exacto de la rueda)
    // Z: Avanza de 45 a 26.5 (Distancia matemática exacta para encuadrar tu malla de 16.5x9.5)
    const targetY = THREE.MathUtils.lerp(12, 6.5, zoomProgress);
    const targetZ = THREE.MathUtils.lerp(45, 26.5, zoomProgress); 
    const targetRotX = THREE.MathUtils.lerp(-Math.PI / 10, 0, zoomProgress);
    
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.1);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.1);
  });
  return null;
}

// --- COMPONENTE HTML ENVOLVENTE (Para leer el progreso en DOM) ---
function HTMLOverlay({ activeIndex }: { activeIndex: number }) {
  const scroll = useScroll();
  const [progress, setProgress] = useState(0);

  useFrame(() => {
    setProgress(scroll.offset);
  });

  return (
    <div className="w-full h-full relative">
      {/* EL FONDO OSCURO: Aparece gradualmente cuando pasamos del 40% del scroll */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm pointer-events-none transition-opacity duration-300"
        style={{ opacity: progress > 0.4 ? (progress - 0.4) * 2.5 : 0 }}
      />
      
      {/* EL CONTENIDO: Centrado y anclado al scroll */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <InfoPanel data={PANELS_DATA[activeIndex]} progress={progress} />
      </div>
    </div>
  );
}

export default function SceneManager() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <group>
      <ambientLight intensity={0.6} />
      <spotLight position={[0, 20, 20]} angle={0.5} penumbra={0.8} intensity={2.5} color="#8b5cf6" />
      <pointLight position={[0, -5, -15]} intensity={2} color="#4c1d95" distance={60} decay={2} />

      <CameraRig />

      <group position={[0, 0, 0]}>
        <SystemCore activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      </group>

      <Scroll html style={{ width: '100vw', height: '100vh' }}>
        <HTMLOverlay activeIndex={activeIndex} />
      </Scroll>
    </group>
  );
}
