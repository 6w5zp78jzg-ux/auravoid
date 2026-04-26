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

// 📊 PROPUESTA ESTRATÉGICA DE SERVICIOS (Información de la Pizarra)
const SCAN_DATA: any = {
  av: { 
    tag: "PRODUCCIÓN AUDIOVISUAL", 
    showTitle: true, 
    metrics: ["NARRATIVA VISUAL", "FOTOGRAFÍA ARQ.", "TOURS VIRTUALES", "RENDERS 3D"] 
  },
  mk: { 
    tag: "MARKETING DE PRECISIÓN", 
    showTitle: true, 
    metrics: ["CAMPALAS DE LEADS", "ADS PROGRAMÁTICA", "SEO LOCAL E INTL", "PERFORMANCE SEM"] 
  },
  ai: { 
    tag: "IA Y AUTOMATIZACIONES", 
    showTitle: true, 
    metrics: ["OPTIMIZACIÓN CON IA", "EDICIÓN ASISTIDA", "FLUJOS DE PROCESO", "ANÁLISIS DE DATOS"] 
  },
  br: { 
    tag: "BRANDING Y ESTRATEGIA", 
    showTitle: false, // Branding se define visualmente por su widget
    metrics: ["STORYTELLING", "DISEÑO WEB INMERSIVO", "COPYWRITING MARCA", "PR DIGITAL"] 
  },
  ev: { 
    tag: "MATERIAL FÍSICO Y EVENTOS", 
    showTitle: true, 
    metrics: ["DISEÑO DE CATÁLOGOS", "OPENHOUSES", "BROCHURES", "EVENTOS Y CAMPAÑAS"] 
  }
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
            <span className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase">Estrategia Integral</span>
            {data.showTitle && (
              <h2 className="text-4xl font-light tracking-tighter uppercase mt-2" style={{ color }}>
                {data.tag}
              </h2>
            )}
          </div>
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        </div>

        <div className="flex justify-between items-end">
          <div className="flex space-x-8">
            {data.metrics.map((m: string, i: number) => (
              <div key={i} className="flex flex-col">
                <span className="text-[9px] opacity-40 mb-1 uppercase">Servicio_0{i+1}</span>
                <span className="text-xs tracking-[0.1em]">{m}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] opacity-20 tracking-widest uppercase">Aura & Void</div>
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

  useFrame(() => {
    if (!groupRef.current) return;

    if (!isDragging.current) {
      velocity.current *= 0.94;
      rotationRef.current += velocity.current;

      const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
      const baseLerp = 0.06;
      const scrollInfluence = Math.pow(scroll.offset, 2) * 0.15; 
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
