'use client';
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

// 🌐 DEFINICIÓN DE LOS DATOS INFOGRÁFICOS (Lenguaje Aura&Void)
// En producción, esto vendría de un CMS estructurado.
const INFOGRAPHICS_DATA = {
  av: {
    title: "Aura Visual Dynamics",
    nodes: [
      { id: "input", label: "RAW DATA", icon: "░" },
      { id: "process", label: "GL CORE", icon: "⎜" },
      { id: "output", label: "RENDER", icon: "☀" }
    ],
    flow: ["░▒▓", "▓▒░", "▒▓▒"]
  },
  mk: {
    title: "Neuro Conversion Grid",
    nodes: [
      { id: "input", label: "IMPULSE", icon: "⌗" },
      { id: "process", label: "BIAS CLUSTER", icon: "⌬" },
      { id: "output", label: "ACTION", icon: "▶" }
    ],
    flow: ["-->", "<--", "==>"]
  },
  // ... añadir datos para AI, BR, EV siguiendo esta estructura
};

const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493', info: INFOGRAPHICS_DATA.av },
  { id: 'mk', Component: MarketingWidget, color: '#4169e1', info: INFOGRAPHICS_DATA.mk },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a', info: null }, // Rellenar
  { id: 'br', Component: BrandingWidget, color: '#ffff00', info: null }, // Rellenar
  { id: 'ev', Component: EventsWidget, color: '#9932cc', info: null }  // Rellenar
];

interface SystemCoreProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

// --- EL COMPONENTE DE INFOGRAFÍA GENERATIVA (Aura Void Language) ---
// Usamos HTML transform para meter layouts complejos en WebGL con z-index correcto
function AuraVoidInfographic({ data, color, progress }: { data: any, color: string, progress: number }) {
  if (!data) return null;

  // Calculamos la opacidad de activación (Aparece del 70% al 100% de scroll)
  // Añadimos una 'curva' para que la aparición sea brutalista, no linear.
  const baseOpacity = Math.max(0, (progress - 0.7) * 3.3);
  const opacity = baseOpacity > 0.9 ? 1 : baseOpacity * baseOpacity; // Curva easeIn
  
  return (
    <Html
      transform
      distanceFactor={1.5}
      position={[0, 0, 0.21]} // Justo sobre la superficie del panel
      style={{
        width: '16.5 units', // Coincidir con boxGeometry args
        height: '9.5 units',
        opacity: opacity,
        color: 'white',
        fontFamily: 'monospace',
        userSelect: 'none',
        pointerEvents: opacity > 0.5 ? 'auto' : 'none',
        transition: 'opacity 0.2s cubic-bezier(0.19,1,0.22,1)'
      }}
    >
      <div className="w-full h-full flex flex-col p-8 bg-black/5 backdrop-blur-md border border-white/10" style={{ boxShadow: `0 0 20px ${color}10` }}>
        {/* Cabecera Brutalista */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-4xl font-light tracking-tighter" style={{ color: color, mixBlendMode: 'difference' }}>
            {data.title}
          </h3>
          <span className="text-xs tracking-[0.3em] uppercase opacity-40">
            // STATUS: DEPLOYED //
          </span>
        </div>

        {/* El "Void Flow" (Nodos de información abstractos) */}
        <div className="flex-grow flex items-center justify-between relative">
          {/* Línea de conexión central */}
          <div className="absolute left-0 right-0 h-px top-1/2 -translate-y-1/2 opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
          
          {data.nodes.map((node: any, index: number) => (
            <div key={node.id} className="relative z-10 flex flex-col items-center group">
              <div className="text-6xl mb-3 transition-transform duration-500 group-hover:scale-110" style={{ color: color }}>
                {node.label === "RENDER" && progress > 0.95 ? "☼" : node.icon}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-light tracking-tight">{node.label}</span>
                <span className="text-[10px] tracking-widest opacity-30 mt-1">[{data.flow[index]}]</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer procedimental (Texto generativo aleatorio sutil) */}
        <div className="mt-6 pt-4 border-t border-white/10 text-[9px] text-neutral-600 tracking-widest leading-relaxed flex justify-between">
            <span>HASH_{color.replace('#', '')}_ENTHITY_VERIFIED</span>
            <span className="animate-pulse">AURA://VOID</span>
        </div>
      </div>
    </Html>
  );
}

export default function ServiceWheelContent({ activeIndex, setActiveIndex }: SystemCoreProps) {
   const groupRef = useRef<THREE.Group>(null);
   const scroll = useScroll(); 

   const isDragging = useRef(false);
   const previousX = useRef(0);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const faceAngle = (Math.PI * 2) / 5;

   const handlePointerDown = (e: any) => {
       if (scroll.offset > 0.05) return;
       e.stopPropagation();
       if(e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current || scroll.offset > 0.05) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const deltaX = currentX - previousX.current;
       velocity.current = deltaX * 0.005;
       rotationRef.current += velocity.current;
       previousX.current = currentX;
   };

   const handlePointerUp = (e: any) => {
       isDragging.current = false;
       if(e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
   };

   useFrame(() => {
       if (!groupRef.current) return;

       // Lógica balística de alineación
       if (scroll.offset > 0.05) {
           velocity.current = 0; 
           const targetAngle = activeIndex * faceAngle * -1;
           // Alineación ultra-rápida (lerp 0.2) para el snap perfecto antes de la infografía
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetAngle, 0.2);
       } else if (!isDragging.current) {
           velocity.current *= 0.95;
           rotationRef.current += velocity.current;
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.1);
           
           let index = Math.round(-rotationRef.current / faceAngle) % 5;
           if (index < 0) index += 5;
           if (index !== activeIndex) setActiveIndex(index);
       }
       
       groupRef.current.rotation.y = rotationRef.current;
   });

   // Memorizamos la estructura para evitar re-renders costosos de Html
   const panels = useMemo(() => {
    return WIDGETS_DATA.map((widget, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 11.35; 
        
        return {
            ...widget,
            position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius] as [number, number, number],
            rotation: [0, angle, 0] as [number, number, number]
        };
    });
   }, []);

   return (
       <group 
          ref={groupRef} 
          position={[0, 6.5, 0]} // Rueda fija en Y
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
       >
           <mesh visible={false}>
               <cylinderGeometry args={[15, 15, 10, 16]} />
           </mesh>

           {panels.map((widget, i) => {
               const isFront = i === activeIndex;

               return (
                   <group key={widget.id} position={widget.position} rotation={widget.rotation}>
                       
                       {/* ESTRUCTURA FÍSICA (Chasis) */}
                       <mesh>
                           <boxGeometry args={[16.5, 9.5, 0.4]} />
                           {/* Material con más metalness y roughness bajo para reflejar las luces */}
                           <meshStandardMaterial color="#020202" metalness={1} roughness={0.3} />
                           <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.2} />
                       </mesh>

                       {/* EL WIDGET ORIGINAL (Z-index 0.3) */}
                       <group position={[0, 0, 0.3]} visible={!isFront || scroll.offset < 0.7}>
                           <widget.Component isActive={isFront} />
                       </group>

                       {/* 🔮 EL VANGUARD UPGRADE: INFOGRAFÍA GENERATIVA (Html) */}
                       {isFront && (
                        <AuraVoidInfographic 
                            data={widget.info} 
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
