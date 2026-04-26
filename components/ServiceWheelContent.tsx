'use client';
import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Edges, useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';

// Importaciones de tus widgets (Mantenlas tal cual)
import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

const SCAN_DATA: any = {
  av: { tag: "VISUAL_ENGINE", metrics: ["FREQ: 440Hz", "GL_LAYER: ACTIVE"] },
  mk: { tag: "MARKETING_CORE", metrics: ["BIAS: DETECTED", "NEURO: SYNC"] },
  ai: { tag: "AI_CORE", metrics: ["NODES: 1024", "LATENCY: 2ms"] },
  br: { tag: "BRAND_CORE", metrics: ["BRUT_IDX: 0.9", "VIBE: 100"] },
  ev: { tag: "EVENT_CORE", metrics: ["LOAD: MAX", "SYNC: OK"] }
};

const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' },
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' },
  { id: 'br', Component: BrandingWidget, color: '#ffff00' },
  { id: 'ev', Component: EventsWidget, color: '#9932cc' }
];

// --- INFOGRAFÍA HUD (Rediseño con absoluta visibilidad) ---
function AuraVoidHUD({ data, color, visible }: { data: any, color: string, visible: boolean }) {
  return (
    <Html
      transform
      distanceFactor={8} // Ajuste crítico para escala
      position={[0, 0, 0.6]} // Un poco más separado para evitar Z-fighting
      pointerEvents="none"
      style={{
        width: '450px',
        height: '250px',
        display: visible ? 'block' : 'none',
        transition: 'all 0.5s ease-out'
      }}
    >
      <div className={`flex flex-col justify-between w-full h-full p-6 font-mono text-white border-x border-white/20 bg-black/40 backdrop-blur-xl transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="flex justify-between items-start">
          <div className="text-[10px] tracking-[0.4em] opacity-50">SCAN_ENTITY://{data?.tag}</div>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        </div>
        
        <div className="space-y-2">
          {data?.metrics.map((m: string, i: number) => (
            <div key={i} className="text-[11px] tracking-widest flex items-center">
              <span className="mr-2" style={{ color }}>●</span> {m}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-end border-t border-white/10 pt-4">
          <div className="text-[8px] opacity-30 tracking-tighter uppercase">Authorized by Aura&Void</div>
          <div className="text-xl font-thin tracking-tighter" style={{ color }}>{data?.tag.split('_')[0]}</div>
        </div>
      </div>
    </Html>
  );
}

export default function ServiceWheelContent({ activeIndex, setActiveIndex }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { viewport } = useThree();
  
  // FÍSICA DE ROTACIÓN (Mejorada para ScrollControls)
  const isDragging = useRef(false);
  const rotationRef = useRef(0);
  const velocity = useRef(0);
  const faceAngle = (Math.PI * 2) / 5;

  // CAPTURA DE GESTOS (Aislada para no morir por el scroll)
  const onPointerDown = (e: any) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
  };

  const onPointerMove = (e: any) => {
    if (!isDragging.current) return;
    // Usamos el movimiento relativo del puntero
    const delta = e.movementX * 0.005; 
    velocity.current = delta;
    rotationRef.current += delta;
  };

  const onPointerUp = (e: any) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. APLICAR FÍSICA DE ROTACIÓN
    if (!isDragging.current) {
      velocity.current *= 0.92; // Fricción suave
      rotationRef.current += velocity.current;

      // Imán de centrado (Magnético)
      const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
      // El imán es más fuerte cuanto más scroll hacemos (Enfoque balístico)
      const lerpFactor = scroll.offset > 0.1 ? 0.15 : 0.04;
      rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, lerpFactor);
    }

    // Actualizar índice global
    let index = Math.round(-rotationRef.current / faceAngle) % 5;
    if (index < 0) index += 5;
    if (index !== activeIndex) setActiveIndex(index);

    groupRef.current.rotation.y = rotationRef.current;
  });

  return (
    <group ref={groupRef} position={[0, 6.5, 0]}>
      
      {/* ⚡ LA MALLA DE INTERACCIÓN (Hitbox invisible)
          Este cilindro captura el drag incluso si el scroll está activo */}
      <mesh 
        visible={false} 
        onPointerDown={onPointerDown} 
        onPointerMove={onPointerMove} 
        onPointerUp={onPointerUp}
      >
        <cylinderGeometry args={[15, 15, 12, 16]} />
      </mesh>

      {WIDGETS_DATA.map((widget, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 11.35;
        const isFront = i === activeIndex;
        // Solo mostramos HUD si está de frente y el zoom es avanzado (>60%)
        const showHUD = isFront && scroll.offset > 0.6;

        return (
          <group 
            key={widget.id} 
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} 
            rotation={[0, angle, 0]}
          >
            {/* Chasis */}
            <mesh>
              <boxGeometry args={[16.5, 9.5, 0.4]} />
              <meshStandardMaterial color="#050505" metalness={1} roughness={0.4} />
              <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.1} />
            </mesh>

            {/* El Widget original */}
            <group position={[0, 0, 0.35]}>
              <widget.Component isActive={isFront} />
            </group>

            {/* La Infografía (HUD) */}
            <AuraVoidHUD 
              data={SCAN_DATA[widget.id]} 
              color={widget.color} 
              visible={showHUD} 
            />
          </group>
        );
      })}
    </group>
  );
}
