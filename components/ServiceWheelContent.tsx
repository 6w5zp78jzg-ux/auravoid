'use client';
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

// 📊 CONFIGURACIÓN DE INFOGRAFÍAS PLANAS
const SCAN_DATA: any = {
  av: { tag: "VISUAL_ENGINE", showTitle: true, metrics: ["440Hz", "WEBGL_CORE", "ACTIVE"] },
  mk: { tag: "NEURO_MARKETING", showTitle: true, metrics: ["BIAS_DET", "CTR: 12%", "SYNC_OK"] },
  ai: { tag: "AI_TRACKER", showTitle: true, metrics: ["1024_NODES", "2ms_LAT", "PREDICT_98%"] },
  br: { tag: "BRANDING", showTitle: false, metrics: ["BRUT_0.9", "GRID_CUST", "VIBE_MAX"] },
  ev: { tag: "EVENT_HORIZON", showTitle: true, metrics: ["LOAD_MAX", "CLUSTER", "SYNC_OK"] }
};

const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' },
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' },
  { id: 'br', Component: BrandingWidget, color: '#ffff00' },
  { id: 'ev', Component: EventsWidget, color: '#9932cc' }
];

// --- 🖥️ HUD 2D INTEGRADO EN EL PANEL ---
function AuraVoidHUD({ data, color, isFront }: { data: any, color: string, isFront: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!containerRef.current) return;
    // Solo aparece si es el panel frontal y el zoom es avanzado (>50%)
    const targetOpacity = isFront && scroll.offset > 0.5 
      ? Math.min((scroll.offset - 0.5) * 5, 1) 
      : 0;

    containerRef.current.style.opacity = targetOpacity.toString();
    containerRef.current.style.transform = `scale(${0.95 + (targetOpacity * 0.05)})`;
  });

  return (
    <Html
      transform
      center
      distanceFactor={6}
      position={[0, 0, 0.41]} // Justo encima de la superficie negra
      zIndexRange={[100, 0]}
    >
      <div 
        ref={containerRef}
        className="w-[500px] h-[300px] flex flex-col justify-between p-6 font-mono text-white pointer-events-none"
        style={{ opacity: 0 }}
      >
        {/* LÍNEAS DE ENCUADRE (Brutalismo Plano) */}
        <div className="absolute inset-0 border-x border-white/10" />
        
        {/* TÍTULO 2D (Solo si showTitle es true) */}
        <div className="flex justify-between items-start z-10">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.5em] text-neutral-500 mb-1">AURA_VOID // ENTITY</span>
            {data.showTitle && (
              <h2 className="text-4xl font-light tracking-tighter" style={{ color }}>
                {data.tag}
              </h2>
            )}
          </div>
          <div className="w-10 h-[1px] mt-4" style={{ backgroundColor: color }} />
        </div>

        {/* INFOGRAFÍA SIMPLE (Métricas Horizontales) */}
        <div className="flex justify-between items-end z-10">
          <div className="flex space-x-6">
            {data.metrics.map((m: string, i: number) => (
              <div key={i} className="flex flex-col">
                <span className="text-[8px] opacity-30 mb-1">DATA_SET_0{i+1}</span>
                <span className="text-xs tracking-widest">{m}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] tracking-[0.3em] opacity-40">VERIFIED_ACCESS</div>
        </div>

        {/* DETALLE DE ESQUINA */}
        <div className="absolute bottom-0 left-0 w-4 h-[1px]" style={{ backgroundColor: color }} />
      </div>
    </Html>
  );
}

export default function ServiceWheelContent({ activeIndex, setActiveIndex }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const isDragging = useRef(false);
  const rotationRef = useRef(0);
  const velocity = useRef(0);
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
      velocity.current *= 0.92;
      rotationRef.current += velocity.current;
      const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
      const lerpFactor = scroll.offset > 0.1 ? 0.15 : 0.04;
      rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, lerpFactor);
    }

    let index = Math.round(-rotationRef.current / faceAngle) % 5;
    if (index < 0) index += 5;
    if (index !== activeIndex) setActiveIndex(index);

    groupRef.current.rotation.y = rotationRef.current;
  });

  return (
    <group ref={groupRef} position={[0, 6.5, 0]}>
      {/* Hitbox invisible para el drag */}
      <mesh visible={false} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <cylinderGeometry args={[15, 15, 12, 16]} />
      </mesh>

      {WIDGETS_DATA.map((widget, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 11.35;
        const isFront = i === activeIndex;

        return (
          <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
            {/* PANEL */}
            <mesh>
              <boxGeometry args={[16.5, 9.5, 0.4]} />
              <meshStandardMaterial color="#050505" metalness={1} roughness={0.4} />
              <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.1} />
            </mesh>

            {/* WIDGET */}
            <group position={[0, 0, 0.35]}>
              <widget.Component isActive={isFront} />
            </group>

            {/* HUD 2D INTEGRADO */}
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
