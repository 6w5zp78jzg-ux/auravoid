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

// 📊 DATA HUD SIMPLIFICADA Y PLANA
const SCAN_DATA: any = {
  av: { tag: "VISUAL ENGINE", showTitle: true, metrics: ["440Hz", "WEBGL", "ACTIVE"] },
  mk: { tag: "NEURO MKT", showTitle: true, metrics: ["BIAS", "12%", "SYNC"] },
  ai: { tag: "AI TRACKER", showTitle: true, metrics: ["NODES", "2ms", "98%"] },
  br: { tag: "BRANDING", showTitle: false, metrics: ["BRUT", "GRID", "MAX"] },
  ev: { tag: "EVENT HORIZON", showTitle: true, metrics: ["LOAD", "CLUSTER", "OK"] }
};

const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' },
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' },
  { id: 'br', Component: BrandingWidget, color: '#ffff00' },
  { id: 'ev', Component: EventsWidget, color: '#9932cc' }
];

function AuraVoidHUD({ data, color, isFront }: { data: any, color: string, isFront: boolean }) {
  const scroll = useScroll();
  const [opacity, setOpacity] = useState(0);

  useFrame(() => {
    // Cálculo de visibilidad: si es frontal y pasamos el 50% de scroll
    const targetOpacity = isFront && scroll.offset > 0.5 
      ? Math.min((scroll.offset - 0.5) * 5, 1) 
      : 0;
    
    if (Math.abs(opacity - targetOpacity) > 0.01) {
      setOpacity(targetOpacity);
    }
  });

  if (opacity <= 0) return null;

  return (
    <Html
      transform
      center
      distanceFactor={10}
      position={[0, 0, 0.5]} // Separación física para evitar parpadeos
      portal={{ current: document.body }} // Forzamos el renderizado fuera del Canvas
      style={{
        width: '600px',
        height: '400px',
        pointerEvents: 'none',
        opacity: opacity,
        transition: 'opacity 0.2s ease-out'
      }}
    >
      <div className="w-full h-full p-10 flex flex-col justify-between border border-white/20 bg-black/80 backdrop-blur-xl font-mono text-white">
        {/* Cabecera */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.5em] text-neutral-500">SYSTEM.SCAN</span>
            {data.showTitle && (
              <h2 className="text-5xl font-light tracking-tighter uppercase mt-2" style={{ color }}>
                {data.tag}
              </h2>
            )}
          </div>
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        </div>

        {/* Info Plana */}
        <div className="flex justify-between items-end">
          <div className="flex space-x-8">
            {data.metrics.map((m: string, i: number) => (
              <div key={i} className="flex flex-col">
                <span className="text-[9px] opacity-40 mb-1">UNIT_0{i}</span>
                <span className="text-sm tracking-widest">{m}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] opacity-20">AURA_VOID_V3</div>
        </div>

        {/* Marco decorativo */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: color }} />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: color }} />
      </div>
    </Html>
  );
}

export default function ServiceWheelContent({ activeIndex, setActiveIndex }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const rotationRef = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const faceAngle = (Math.PI * 2) / 5;

  // Handlers de física (Drag)
  const onPointerDown = (e: any) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
  };
  const onPointerMove = (e: any) => {
    if (!isDragging.current) return;
    const delta = e.movementX * 0.005;
    velocity.current = delta;
    rotationRef.current += delta;
  };
  const onPointerUp = (e: any) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  useFrame(() => {
    if (!groupRef.current) return;

    if (!isDragging.current) {
      velocity.current *= 0.92;
      rotationRef.current += velocity.current;
      const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
      const lerpFactor = scroll.offset > 0.1 ? 0.15 : 0.05;
      rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, lerpFactor);
    }

    let index = Math.round(-rotationRef.current / faceAngle) % 5;
    if (index < 0) index += 5;
    if (index !== activeIndex) setActiveIndex(index);

    groupRef.current.rotation.y = rotationRef.current;
  });

  return (
    <group ref={groupRef} position={[0, 6.5, 0]}>
      {/* Zona de interacción */}
      <mesh visible={false} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <cylinderGeometry args={[16, 16, 12, 16]} />
      </mesh>

      {WIDGETS_DATA.map((widget, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 11.35;
        const isFront = i === activeIndex;

        return (
          <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
            {/* Chasis del panel */}
            <mesh>
              <boxGeometry args={[16.5, 9.5, 0.4]} />
              <meshStandardMaterial color="#020202" metalness={1} roughness={0.3} />
              <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.1} />
            </mesh>

            {/* El Widget original */}
            <group position={[0, 0, 0.3]}>
              <widget.Component isActive={isFront} />
            </group>

            {/* LA INFOGRAFÍA HUD (Solo se renderiza si es el frontal) */}
            <AuraVoidHUD 
              data={SCAN_DATA[widget.id]} 
              color={widget.color} 
              isFront={isFront} 
            />
          </group>
        );
      })}
    </group>
  );
}
