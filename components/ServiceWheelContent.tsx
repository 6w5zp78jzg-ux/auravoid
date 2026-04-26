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
    // La infografía aparece del 50% al 85% del scroll
    const targetOpacity = isFront && scroll.offset > 0.5 
      ? Math.min((scroll.offset - 0.5) * 4, 1) 
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
      position={[0, 0, 0.52]} 
      portal={{ current: document.body }}
      style={{
        width: '600px',
        height: '400px',
        pointerEvents: opacity > 0.8 ? 'auto' : 'none',
        opacity: opacity,
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div className="w-full h-full p-10 flex flex-col justify-between border border-white/20 bg-black/85 backdrop-blur-2xl font-mono text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="flex justify-between items-start border-b border-white/10 pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase">System Intelligence</span>
            {data.showTitle && (
              <h2 className="text-5xl font-light tracking-tighter uppercase mt-2" style={{ color }}>
                {data.tag}
              </h2>
            )}
          </div>
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        </div>

        <div className="flex justify-between items-end">
          <div className="flex space-x-10">
            {data.metrics.map((m: string, i: number) => (
              <div key={i} className="flex flex-col">
                <span className="text-[9px] opacity-40 mb-1 uppercase">Unit_Index_0{i}</span>
                <span className="text-sm tracking-[0.2em]">{m}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] opacity-20 tracking-widest">AV_CORE_V3.0</div>
        </div>

        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: color }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: color }} />
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

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isDragging.current) {
      // Fricción optimizada para respuesta rápida al scroll out
      velocity.current *= 0.94;
      rotationRef.current += velocity.current;

      const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
      
      // FÍSICA SIMÉTRICA:
      // El imán se debilita cuando scroll.offset disminuye (Scroll Out)
      // y se fortalece cuando aumenta (Scroll In).
      const baseLerp = 0.06;
      const scrollInfluence = Math.pow(scroll.offset, 2) * 0.15; // Curva cuadrática para suavizar la salida
      const lerpFactor = baseLerp + scrollInfluence;

      rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, lerpFactor);
    }

    let index = Math.round(-rotationRef.current / faceAngle) % 5;
    if (index < 0) index += 5;
    if (index !== activeIndex) setActiveIndex(index);

    groupRef.current.rotation.y = rotationRef.current;
  });

  return (
    <group ref={groupRef} position={[0, 6.5, 0]}>
      {/* Hitbox de interacción masiva */}
      <mesh visible={false} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <cylinderGeometry args={[18, 18, 14, 16]} />
      </mesh>

      {WIDGETS_DATA.map((widget, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 11.35;
        const isFront = i === activeIndex;

        return (
          <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[16.5, 9.5, 0.4]} />
              <meshStandardMaterial color="#020202" metalness={1} roughness={0.35} />
              <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.15} />
            </mesh>

            <group position={[0, 0, 0.32]}>
              <widget.Component isActive={isFront} />
            </group>

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
