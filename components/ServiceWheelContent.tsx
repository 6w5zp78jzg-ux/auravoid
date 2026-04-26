'use client';
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

// --- DATA HUD (AURA & VOID) ---
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

function AuraVoidHUD({ data, color, isActive, scrollProgress }: any) {
  // Solo se activa visualmente cuando el panel es el frontal Y estamos en zoom (scroll > 0.5)
  const visibility = isActive ? Math.max(0, (scrollProgress - 0.5) * 4) : 0;

  return (
    <Html
      transform
      distanceFactor={10} // Ajuste para que no desaparezca por tamaño
      position={[0, 0, 0.45]}
      style={{
        width: '400px',
        height: '250px',
        opacity: visibility,
        transition: 'opacity 0.3s ease-out',
        pointerEvents: 'none',
      }}
    >
      <div className="flex justify-between w-full h-full border-l border-r border-white/10 p-4 font-mono text-white bg-black/20 backdrop-blur-sm">
        <div className="flex flex-col justify-end">
          <div className="text-[10px] mb-2" style={{ color }}>{'>'} STATUS_SCAN</div>
          {data?.metrics.map((m: string, i: number) => (
            <div key={i} className="text-[9px] opacity-50 tracking-tighter">{m}</div>
          ))}
        </div>
        <div className="text-right">
          <div className="text-[8px] opacity-30">TYPE://ENTITY</div>
          <div className="text-lg font-light tracking-tighter" style={{ color }}>{data?.tag}</div>
        </div>
        {/* Esquinas Brutalistas */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: color }} />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: color }} />
      </div>
    </Html>
  );
}

export default function ServiceWheelContent({ activeIndex, setActiveIndex }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  
  // Física de rotación (SIEMPRE DISPONIBLE)
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const rotationRef = useRef(0);
  const velocity = useRef(0);
  const faceAngle = (Math.PI * 2) / 5;

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    isDragging.current = true;
    previousX.current = e.clientX || e.touches?.[0].clientX || 0;
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging.current) return;
    const currentX = e.clientX || e.touches?.[0].clientX || 0;
    const deltaX = currentX - previousX.current;
    velocity.current = deltaX * 0.005;
    rotationRef.current += velocity.current;
    previousX.current = currentX;
  };

  const handlePointerUp = () => { isDragging.current = false; };

  useFrame(() => {
    if (!groupRef.current) return;

    // Aplicamos inercia constante
    if (!isDragging.current) {
      velocity.current *= 0.95;
      rotationRef.current += velocity.current;

      // FUERZA MAGNÉTICA: Solo si el usuario no está arrastrando, 
      // el scroll atrae al panel más cercano al centro.
      const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
      const attractionStrength = scroll.offset > 0.1 ? 0.15 : 0.05;
      rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, attractionStrength);
    }

    // Actualizamos el índice activo basándonos en la rotación real
    let index = Math.round(-rotationRef.current / faceAngle) % 5;
    if (index < 0) index += 5;
    if (index !== activeIndex) setActiveIndex(index);

    groupRef.current.rotation.y = rotationRef.current;
  });

  return (
    <group 
      ref={groupRef} 
      position={[0, 6.5, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {WIDGETS_DATA.map((widget, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 11.35;
        const isFront = i === activeIndex;

        return (
          <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[16.5, 9.5, 0.4]} />
              <meshStandardMaterial color="#050505" metalness={1} roughness={0.5} />
              <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.2} />
            </mesh>
            <group position={[0, 0, 0.35]}>
              <widget.Component isActive={isFront} />
            </group>
            {/* Infografía HUD */}
            <AuraVoidHUD 
              data={SCAN_DATA[widget.id]} 
              color={widget.color} 
              isActive={isFront} 
              scrollProgress={scroll.offset} 
            />
          </group>
        );
      })}
    </group>
  );
}
