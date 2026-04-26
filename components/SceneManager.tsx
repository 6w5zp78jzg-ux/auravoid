'use client';
import React, { useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Scroll } from '@react-three/drei';
import * as THREE from 'three';
import SystemCore from './ServiceWheelContent';

// --- DATA EXTENDIDA (Aquí es donde "accedemos" a la info real) ---
const SERVICES_DETAILS = [
  { 
    id: '01', 
    title: 'AURA VISUAL', 
    subtitle: 'Dirección de Arte & WebGL',
    description: 'Elevamos la identidad de marca a entornos tridimensionales. No usamos plantillas; programamos sensaciones mediante shaders y partículas.',
    features: ['Real-time Rendering', 'Interactive Storytelling', 'Custom Shaders']
  },
  { 
    id: '02', 
    title: 'NEURO MARKETING', 
    subtitle: 'Conversión por Diseño',
    description: 'Aplicamos principios de psicología cognitiva para guiar el flujo del usuario hacia la conversión sin fricción.',
    features: ['Behavioral Analysis', 'Heatmap Optimization', 'A/B Neuro-Testing']
  },
  // ... (añadir el resto de servicios siguiendo este esquema)
];

// --- EL NUEVO PANEL INFORMATIVO (La "Entrada") ---
function ServiceEntry({ data, progress }: { data: any, progress: number }) {
  // El contenido empieza a emerger después del 60% del scroll
  const contentVisibility = Math.max(0, (progress - 0.6) * 2.5);
  
  return (
    <div 
      className="flex flex-col items-start justify-center h-full max-w-4xl mx-auto px-10 text-left transition-all duration-700 ease-out"
      style={{ 
        opacity: contentVisibility,
        transform: `translateY(${(1 - contentVisibility) * 50}px)` 
      }}
    >
      <div className="space-y-2 mb-8">
        <span className="text-magenta-500 font-mono text-sm tracking-tighter">/ ENTIDAD {data.id} /</span>
        <h2 className="text-7xl md:text-9xl font-bold tracking-tighter text-white uppercase italic leading-none">
          {data.title}
        </h2>
        <p className="text-xl text-neutral-500 font-light">{data.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/10 pt-10">
        <p className="text-lg text-neutral-300 leading-relaxed font-light">
          {data.description}
        </p>
        <ul className="space-y-4">
          {data.features?.map((f: string) => (
            <li key={f} className="flex items-center text-xs tracking-widest text-white/50 uppercase">
              <span className="w-2 h-2 bg-white rounded-full mr-4 opacity-20" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <button className="mt-12 px-10 py-5 bg-white text-black font-bold uppercase tracking-tighter hover:bg-magenta-500 transition-colors">
        Iniciar Proyecto
      </button>
    </div>
  );
}

export default function SceneManager() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scroll = useScroll();
  const [localProgress, setLocalProgress] = useState(0);

  useFrame((state) => {
    setLocalProgress(scroll.offset);
    
    // CAMERARIG INTEGRADO
    const zoomProgress = Math.min(scroll.offset * 2, 1);
    const targetY = THREE.MathUtils.lerp(12, 6.5, zoomProgress);
    const targetZ = THREE.MathUtils.lerp(45, 26, zoomProgress); // Un poco más cerca
    
    state.camera.position.set(0, targetY, targetZ);
    state.camera.lookAt(0, 6.5, 0); // Siempre miramos al centro de la rueda
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />

      <SystemCore activeIndex={activeIndex} setActiveIndex={setActiveIndex} />

      <Scroll html style={{ width: '100vw', height: '100vh' }}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* FONDO OSCURO DE TRANSICIÓN */}
          <div 
            className="absolute inset-0 bg-black transition-opacity duration-500"
            style={{ 
              opacity: localProgress > 0.45 ? (localProgress - 0.45) * 3 : 0,
              zIndex: 5
            }}
          />

          {/* CAPA DE INFORMACIÓN NUEVA */}
          <div className="relative z-10 w-full h-full pointer-events-auto">
            {SERVICES_DETAILS[activeIndex] && (
              <ServiceEntry data={SERVICES_DETAILS[activeIndex]} progress={localProgress} />
            )}
          </div>
        </div>
      </Scroll>
    </group>
  );
}
