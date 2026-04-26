'use client';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

// --- DATA DE ESCANEO (AURA & VOID LANGUAGE) ---
const SCAN_DATA: any = {
  av: { title: "DYNAMICS", metrics: ["FREQ: 440Hz", "BUFFER: 100%", "GL_LAYER: ACTIVE"], tag: "VISUAL_ENGINE" },
  mk: { title: "CONVERSION", metrics: ["BIAS: DETECTED", "CTR_PROJ: 12.4%", "NEURO: SYNC"], tag: "MARKETING_CORE" },
  ai: { title: "TRACKING", metrics: ["NODES: 1024", "LATENCY: 2ms", "MOD_V4: TRUE"], tag: "AI_CORE" },
  br: { title: "IDENTITY", metrics: ["BRUT_IDX: 0.9", "GRID: CUSTOM", "VIBE: 100"], tag: "BRAND_CORE" },
  ev: { title: "HORIZON", metrics: ["LOAD: MAX", "NODES: CLUSTER", "SYNC: OK"], tag: "EVENT_CORE" }
};

const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' },
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' },
  { id: 'br', Component: BrandingWidget, color: '#ffff00' },
  { id: 'ev', Component: EventsWidget, color: '#9932cc' }
];

function AuraVoidHUD({ data, color, progress }: { data: any, color: string, progress: number }) {
  // Solo surge después del 60% del scroll
  const opacity = Math.max(0, (progress - 0.6) * 4);
  
  return (
    <Html
      transform
      distanceFactor={1.5}
      position={[0, 0, 0.5]} // Ligeramente por delante del widget
      style={{
        width: '30 units', // Más ancho que el widget para "enmarcarlo"
        height: '15 units',
        opacity: opacity,
        pointerEvents: 'none',
        transition: 'opacity 0.4s ease-out'
      }}
    >
      <div className="w-full h-full relative font-mono text-white flex justify-between p-4">
        {/* MARCO IZQUIERDO: Métricas técnicas */}
        <div className="flex flex-col justify-end space-y-2 pb-10">
          <div className="w-8 h-px mb-4" style={{ backgroundColor: color }} />
          {data?.metrics.map((m: string, i: number) => (
            <div key={i} className="text-[10px] tracking-widest opacity-60">
              <span style={{ color }}>{'>'}</span> {m}
            </div>
          ))}
        </div>

        {/* MARCO DERECHO: Título y Tag */}
        <div className="flex flex-col items-end pt-10">
          <div className="text-xs tracking-[0.4em] opacity-40 mb-1">ENTITY_TYPE</div>
          <div className="text-2xl font-light mb-4" style={{ textShadow: `0 0 10px ${color}` }}>{data?.tag}</div>
          <div className="w-20 h-[1px]" style={{ backgroundColor: color }} />
        </div>

        {/* ELEMENTOS DE ESQUINA (Brutalismo Visual) */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l opacity-30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r opacity-30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l opacity-30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r opacity-30" />
      </div>
    </Html>
  );
}

export default function ServiceWheelContent({ activeIndex, setActiveIndex }: any) {
   const groupRef = useRef<THREE.Group>(null);
   const scroll = useScroll(); 
   const faceAngle = (Math.PI * 2) / 5;

   useFrame(() => {
       if (!groupRef.current) return;
       const offset = scroll.offset;

       if (offset > 0.05) {
           const targetAngle = activeIndex * faceAngle * -1;
           groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, 0.15);
       } else {
           // Lógica de rotación libre...
       }
   });

   return (
       <group ref={groupRef} position={[0, 6.5, 0]}>
           {WIDGETS_DATA.map((widget, i) => {
               const angle = (i / 5) * Math.PI * 2;
               const radius = 11.35; 
               const isFront = i === activeIndex;

               return (
                   <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
                       {/* EL PANEL BASE (Siempre visible) */}
                       <mesh>
                           <boxGeometry args={[16.5, 9.5, 0.4]} />
                           <meshStandardMaterial color="#050505" metalness={1} roughness={0.5} />
                           <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.2} />
                       </mesh>

                       {/* EL WIDGET ORIGINAL (Nunca se oculta) */}
                       <group position={[0, 0, 0.3]}>
                           <widget.Component isActive={isFront} />
                       </group>

                       {/* LA INFOGRAFÍA HUD (Surge sobre el widget) */}
                       {isFront && (
                        <AuraVoidHUD 
                            data={SCAN_DATA[widget.id]} 
                            color={widget.color} 
                            progress={scroll.offset}
                        />
                       )}
                   </group>
               );
           })}
       </group>
   );
}
