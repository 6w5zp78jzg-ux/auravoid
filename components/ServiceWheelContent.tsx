'use client';
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

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

export default function ServiceWheelContent() {
   const groupRef = useRef<THREE.Group>(null);
   const [activeIndex, setActiveIndex] = useState(0);

   const isDragging = useRef(false);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const previousX = useRef(0);
   const faceAngle = (Math.PI * 2) / 5;

   const onPointerDown = (e: any) => {
       e.stopPropagation();
       // Importante para capturar el dedo en iPad
       if(e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   const onPointerMove = (e: any) => {
       if (!isDragging.current) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const deltaX = currentX - previousX.current;
       
       velocity.current = deltaX * 0.01;
       rotationRef.current += velocity.current;
       previousX.current = currentX;
   };

   const onPointerUp = (e: any) => {
       isDragging.current = false;
       if(e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
   };

   useFrame(() => {
       if (!groupRef.current) return;
       if (!isDragging.current) {
           velocity.current *= 0.95;
           rotationRef.current += velocity.current;
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.15);

           let index = Math.round(-rotationRef.current / faceAngle) % 5;
           if (index < 0) index += 5;
           if (index !== activeIndex) setActiveIndex(index);
       }
       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       <group 
          ref={groupRef} 
          position={[0, 9, 0]} // Posición Hero bien alta
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
       >
           {/* Área de impacto invisible para asegurar el giro */}
           <mesh visible={false}>
               <cylinderGeometry args={[15, 15, 12, 16]} />
           </mesh>

           {WIDGETS_DATA.map((widget, i) => {
               const angle = (i / 5) * Math.PI * 2;
               const radius = 11.5; // Radio exacto para paneles de 16.5
               const isFront = i === activeIndex;

               return (
                   <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
                       
                       {/* EL CHASIS: Sólido y un poco más pequeño para que no coma al HTML */}
                       <mesh position={[0, 0, -0.2]}>
                           <boxGeometry args={[16.5, 9.5, 0.1]} />
                           <meshStandardMaterial color="#010101" metalness={1} roughness={0.5} />
                           <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.2} />
                       </mesh>

                       {/* EL WIDGET: Lo adelantamos a Z=0.8 para evitar Z-Fighting */}
                       <group position={[0, 0, 0.8]}>
                           <widget.Component isActive={isFront} />
                       </group>
                   </group>
               );
           })}
       </group>
   );
}
