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
  { id: 'av', Component: AudiovisualWidget, color: 'magenta' },
  { id: 'mk', Component: MarketingWidget, color: 'cyan' },
  { id: 'ai', Component: IARobotTracker, color: 'lime' },
  { id: 'br', Component: BrandingWidget, color: 'yellow' },
  { id: 'ev', Component: EventsWidget, color: 'purple' }
];

export default function ServiceWheelContent() {
   const groupRef = useRef<THREE.Group>(null);
   const [activeIndex, setActiveIndex] = useState(0);
   const rotationRef = useRef(0);

   useFrame(() => {
       if (!groupRef.current) return;
       // Rotación constante automática para que la veas aparecer si está por ahí
       rotationRef.current += 0.005; 
       groupRef.current.rotation.y = rotationRef.current;
       
       const faceAngle = (Math.PI * 2) / 5;
       let index = Math.round(-rotationRef.current / faceAngle) % 5;
       if (index < 0) index += 5;
       if (index !== activeIndex) setActiveIndex(index);
   });

   return (
       <group 
          ref={groupRef} 
          // 🚀 POSICIÓN DE RESCATE: Un poco elevada y centrada
          position={[0, 2, 0]} 
       >
           {WIDGETS_DATA.map((widget, i) => {
               const angle = (i / 5) * Math.PI * 2;
               const radius = 10; 

               return (
                   <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
                       
                       {/* 🟥 PANEL DE PRUEBA: Si ves estos rectángulos de colores, la rueda ha vuelto */}
                       <mesh>
                           <boxGeometry args={[12, 7, 0.5]} />
                           <meshStandardMaterial color={widget.color} emissive={widget.color} emissiveIntensity={0.5} />
                       </mesh>

                       <group position={[0, 0, 0.6]}>
                           <widget.Component isActive={i === activeIndex} />
                       </group>
                   </group>
               );
           })}
       </group>
   );
}
