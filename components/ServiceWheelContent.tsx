'use client';
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

interface ServiceWheelProps {
  wheelDataRef: React.MutableRefObject<{ rotation: number; activeIndex: number }>;
}

const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' }, 
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' },
  { id: 'br', Component: BrandingWidget, color: '#ffff00' },
  { id: 'ev', Component: EventsWidget, color: '#9932cc' }
];

export default function ServiceWheelContent({ wheelDataRef }: ServiceWheelProps) {
   const groupRef = useRef<THREE.Group>(null);
   const [activeIndex, setActiveIndex] = useState(0);

   // --- ESTADO FÍSICO ---
   const isDragging = useRef(false);
   const previousX = useRef(0);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const faceAngle = (Math.PI * 2) / 5;

   // --- GESTIÓN DE EVENTOS (Touch y Mouse) ---
   const handlePointerDown = (e: any) => {
       e.stopPropagation();
       // Importante para iPad: captura el movimiento aunque el dedo se salga del panel
       if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       velocity.current = 0;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const deltaX = currentX - previousX.current;
       
       // Sensibilidad de arrastre
       velocity.current = deltaX * 0.006;
       rotationRef.current += velocity.current;
       previousX.current = currentX;
   };

   const handlePointerUp = (e: any) => {
       isDragging.current = false;
       if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
   };

   // --- BUCLE DE FÍSICA (60 FPS) ---
   useFrame(() => {
       if (!groupRef.current) return;
       
       if (!isDragging.current) {
           // Inercia: la velocidad disminuye gradualmente
           velocity.current *= 0.95; 
           rotationRef.current += velocity.current;
           
           // Magnetismo (Snap): se detiene justo en el panel frontal
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.1);
       }

       // Cálculo de qué panel está de frente
       let index = Math.round(-rotationRef.current / faceAngle) % 5;
       if (index < 0) index += 5;
       if (index !== activeIndex) setActiveIndex(index);

       // Sincronización silenciosa con el cilindro
       if (wheelDataRef.current) {
           wheelDataRef.current.rotation = rotationRef.current;
           wheelDataRef.current.activeIndex = index;
       }

       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       <group 
          ref={groupRef} 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
       >
           {/* Área táctil invisible más grande para facilitar el agarre */}
           <mesh visible={false}>
               <cylinderGeometry args={[18, 18, 12, 16]} />
           </mesh>

           {WIDGETS_DATA.map((widget, i) => {
               const angle = (i / 5) * Math.PI * 2;
               const radius = 13.5; 
               const isFront = i === activeIndex;

               return (
                   <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
                       <mesh>
                           <boxGeometry args={[24, 10, 0.4]} /> 
                           <meshStandardMaterial color="#050505" metalness={1} roughness={0.4} />
                           <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.1} />
                       </mesh>
                       <group position={[0, 0, 0.3]}>
                           <widget.Component isActive={isFront} />
                       </group>
                   </group>
               );
           })}
       </group>
   );
}
