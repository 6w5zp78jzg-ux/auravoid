'use client';
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

// Importación de Widgets
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

   // Lógica de Física y Rotación
   const isDragging = useRef(false);
   const previousX = useRef(0);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const faceAngle = (Math.PI * 2) / 5; // Pentágono

   // --- INTERACCIÓN ---
   const handlePointerDown = (e: any) => {
       e.stopPropagation();
       if(e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current) return;
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

   // --- BUCLE DE ANIMACIÓN ---
   useFrame(() => {
       if (!groupRef.current) return;
       
       if (!isDragging.current) {
           // Inercia y Magnetismo
           velocity.current *= 0.95; 
           rotationRef.current += velocity.current;
           
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.1);
       }

       // Cálculo de índice
       let index = Math.round(-rotationRef.current / faceAngle) % 5;
       if (index < 0) index += 5;
       
       if (index !== activeIndex) setActiveIndex(index);

       // Comunicación con el Cilindro (Brain Sync)
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
           {/* Área táctica invisible para facilitar el drag */}
           <mesh visible={false}>
               <cylinderGeometry args={[18, 18, 12, 16]} />
           </mesh>

           {WIDGETS_DATA.map((widget, i) => {
               const angle = (i / 5) * Math.PI * 2;
               
               // 📐 AJUSTES "WIDER"
               const radius = 13.5; // Un poco más de radio para que los paneles anchos no choquen
               const isFront = i === activeIndex;

               return (
                   <group 
                      key={widget.id} 
                      position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} 
                      rotation={[0, angle, 0]}
                   >
                       {/* CHASIS DEL PANEL (Proporción Cinematográfica) */}
                       <mesh>
                           {/* Aumentamos de 16.5 a 24 para que sea mucho más ancho */}
                           <boxGeometry args={[24, 10, 0.4]} /> 
                           <meshStandardMaterial 
                              color="#050505" 
                              metalness={1} 
                              roughness={0.4} 
                           />
                           <Edges 
                              color={widget.color} 
                              threshold={15} 
                              transparent 
                              opacity={isFront ? 1 : 0.1} 
                           />
                       </mesh>

                       {/* CONTENIDO (WIDGET) */}
                       <group position={[0, 0, 0.3]}>
                           <widget.Component isActive={isFront} />
                       </group>
                   </group>
               );
           })}
       </group>
   );
}
