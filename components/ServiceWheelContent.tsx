'use client';
import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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
   const { size } = useThree(); // Para normalizar el movimiento

   const isDragging = useRef(false);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const previousX = useRef(0);

   const faceAngle = (Math.PI * 2) / 5;

   // EVENTOS REFORZADOS
   const onPointerDown = (e: any) => {
       e.stopPropagation();
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   const onPointerMove = (e: any) => {
       if (!isDragging.current) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const deltaX = currentX - previousX.current;
       
       // Inyectamos movimiento directamente
       const sensitivity = 0.01;
       velocity.current = deltaX * sensitivity;
       rotationRef.current += velocity.current;
       
       previousX.current = currentX;
   };

   const onPointerUp = () => {
       isDragging.current = false;
   };

   useFrame(() => {
       if (!groupRef.current) return;

       if (!isDragging.current) {
           velocity.current *= 0.95; // Fricción
           rotationRef.current += velocity.current;

           // SNAP Magnético
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.1);

           // Calcular el índice
           let index = Math.round(-rotationRef.current / faceAngle) % 5;
           if (index < 0) index += 5;
           if (index !== activeIndex) setActiveIndex(index);
       }

       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       <group 
          ref={groupRef} 
          position={[0, 10, 0]} // Bien arriba
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerOut={onPointerUp}
       >
           {WIDGETS_DATA.map((widget, i) => {
               const angle = (i / 5) * Math.PI * 2;
               const radius = 13;
               const isFront = i === activeIndex;

               return (
                   <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
                       
                       {/* PLACA BASE SÓLIDA PARA QUE SE VEA ALGO SIEMPRE */}
                       <mesh>
                           <boxGeometry args={[16.5, 9.5, 0.5]} />
                           <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.2} />
                           <Edges color={widget.color} threshold={15} />
                       </mesh>

                       {/* EL WIDGET (Aquí está el problema probable) */}
                       <group position={[0, 0, 0.3]}>
                           <widget.Component isActive={isFront} />
                       </group>
                   </group>
               );
           })}
       </group>
   );
}
