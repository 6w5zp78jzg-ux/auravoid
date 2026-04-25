'use client';
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget },
  { id: 'mk', Component: MarketingWidget },
  { id: 'ai', Component: IARobotTracker },
  { id: 'br', Component: BrandingWidget },
  { id: 'ev', Component: EventsWidget }
];

export default function ServiceWheelContent() {
   const groupRef = useRef<THREE.Group>(null);
   const [activeIndex, setActiveIndex] = useState(0);

   // Física ultra-simple para asegurar el giro
   const rotationRef = useRef(0);
   const isDragging = useRef(false);
   const previousX = useRef(0);

   const onPointerDown = (e: any) => {
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   const onPointerMove = (e: any) => {
       if (!isDragging.current) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const deltaX = currentX - previousX.current;
       rotationRef.current += deltaX * 0.01;
       previousX.current = currentX;
   };

   const onPointerUp = () => { isDragging.current = false; };

   useFrame(() => {
       if (!groupRef.current) return;
       const faceAngle = (Math.PI * 2) / 5;

       if (!isDragging.current) {
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.1);
           
           let index = Math.round(-rotationRef.current / faceAngle) % 5;
           if (index < 0) index += 5;
           if (index !== activeIndex) setActiveIndex(index);
       }
       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       <group 
          ref={groupRef} 
          position={[0, 0, 0]} // 🚀 CENTRADO ABSOLUTO PARA PRUEBA
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
       >
           {/* Malla invisible para poder tocar en cualquier sitio */}
           <mesh visible={false}>
               <sphereGeometry args={[20, 16, 16]} />
           </mesh>

           {WIDGETS_DATA.map((widget, i) => {
               const angle = (i / 5) * Math.PI * 2;
               const radius = 12; 
               const isFront = i === activeIndex;

               return (
                   <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
                       {/* 🚀 HEMOS QUITADO EL PANEL NEGRO PARA QUE NO TAPE NADA */}
                       <widget.Component isActive={isFront} />
                   </group>
               );
           })}
       </group>
   );
}
