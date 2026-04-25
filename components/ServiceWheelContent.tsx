'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' },
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' },
  { id: 'br', Component: BrandingWidget, color: '#ffff00' },
  { id: 'ev', Component: EventsWidget, color: '#9932cc' }
];

// --- SUBCOMPONENTE: ESTRUCTURA DEL PANEL ---
function PanelFrame({ color, isFront }: { color: string, isFront: boolean }) {
   const W = 16.5; 
   const H = 9.5;
   const geometry = useMemo(() => new THREE.BoxGeometry(W, H, 0.4), []);

   return (
       <mesh geometry={geometry}>
           <meshStandardMaterial 
               color="#050505" 
               roughness={0.8} 
               metalness={1} 
               transparent
               opacity={isFront ? 0.5 : 0.9} 
           />
           <Edges scale={1.002} threshold={15} color={color} transparent opacity={isFront ? 1 : 0.2} />
       </mesh>
   );
}

export default function ServiceWheelContent() {
   const { language } = useLanguage();
   const groupRef = useRef<THREE.Group>(null);
  
   const [activeIndex, setActiveIndex] = useState<number | null>(null);
   const [pageLoaded, setPageLoaded] = useState(false);

   useEffect(() => {
       const timer = setTimeout(() => {
           setPageLoaded(true);
           setActiveIndex(0); 
       }, 1000);
       return () => clearTimeout(timer);
   }, []);

   // --- FÍSICA DE ARRASTRE ---
   const isDragging = useRef(false);
   const previousX = useRef(0);
   const velocity = useRef(0);
   const targetRotation = useRef(0);

   const handlePointerDown = (e: any) => {
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current || !pageLoaded) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const deltaX = currentX - previousX.current;
       velocity.current = deltaX * 0.005;
       targetRotation.current += velocity.current;
       previousX.current = currentX;
   };

   const handlePointerUp = () => {
       if (!isDragging.current) return;
       isDragging.current = false;

       const faceAngle = (Math.PI * 2) / 5;
       const closestFace = Math.round(targetRotation.current / faceAngle);
       targetRotation.current = closestFace * faceAngle;

       let index = (-closestFace) % 5;
       if (index < 0) index += 5; 
       
       if (index !== activeIndex) setActiveIndex(index);
   };

   useFrame(() => {
       if (!groupRef.current) return;
       if (!isDragging.current) {
           groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current, 0.1);
       } else {
           groupRef.current.rotation.y = targetRotation.current;
       }
   });

   return (
       // 🚀 SUBIDA DE POSICIÓN: Se mueve a y=5 para alejarse del logo
       <group
           ref={groupRef}
           position={[0, 5, 0]} 
           onPointerDown={handlePointerDown}
           onPointerMove={handlePointerMove}
           onPointerUp={handlePointerUp}
           onPointerLeave={handlePointerUp}
       >
           <SpotLight position={[0, 0, 10]} angle={0.5} penumbra={1} intensity={2} color="#ffffff" />

           {WIDGETS_DATA.map((widget, i) => {
               const radius = 11.35; 
               const angle = (i / 5) * Math.PI * 2;
               const x = Math.sin(angle) * radius;
               const z = Math.cos(angle) * radius;
               const isFront = pageLoaded && i === activeIndex;

               return (
                   <group key={widget.id} position={[x, 0, z]} rotation={[0, angle, 0]}>
                       
                       {/* ESTRUCTURA BASE (Siempre visible para ver la rueda) */}
                       <PanelFrame color={widget.color} isFront={isFront} />

                       {/* 🚀 WIDGET ACTIVO: Solo se renderiza si es la cara frontal */}
                       {isFront && (
                           <group position={[0, 0, 0.4]}> 
                               <widget.Component isActive={isFront} />
                           </group>
                       )}

                   </group>
               );
           })}
       </group>
   );
}
