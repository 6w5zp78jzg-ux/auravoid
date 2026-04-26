'use client';
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, useScroll } from '@react-three/drei';
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
   
   // Hook mágico de Drei para leer el progreso del scroll (0 a 1)
   const scroll = useScroll(); 

   const isDragging = useRef(false);
   const isScrolling = useRef(false);
   const previousX = useRef(0);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const faceAngle = (Math.PI * 2) / 5;

   const handlePointerDown = (e: any) => {
       if (isScrolling.current) return; // Bloquea el toque si estamos en pleno zoomscroll
       e.stopPropagation();
       if(e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current || isScrolling.current) return;
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

       // 1. EL VANGUARD UPGRADE: Control del ZoomScroll
       // scroll.offset va de 0 (arriba) a 1 (abajo del todo)
       const offset = scroll.offset; 
       isScrolling.current = offset > 0.02; // Detectamos si el usuario empezó a bajar

       // Efecto Zoom (Eje Z): Mueve la rueda hacia la cámara. 
       // Tu cámara está en Z=45. Llevamos la rueda hasta Z=50 para que nos "atraviese".
       const targetZ = THREE.MathUtils.lerp(0, 50, offset * 1.5); // *1.5 para acelerar la penetración
       groupRef.current.position.z = targetZ;

       // Efecto Caída (Eje Y): Para que el usuario no choque contra el borde superior de la rueda
       groupRef.current.position.y = THREE.MathUtils.lerp(6.5, -5, offset);

       // Efecto Torbellino: Si está haciendo scroll, la rueda gira sola hacia el "Void"
       if (isScrolling.current) {
           rotationRef.current -= 0.02 * (offset * 5); 
       }

       // 2. Fricción y Snapping (Tu lógica original impecable)
       if (!isDragging.current && !isScrolling.current) {
           velocity.current *= 0.95;
           rotationRef.current += velocity.current;
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.1);

           let index = Math.round(-rotationRef.current / faceAngle) % 5;
           if (index < 0) index += 5;
           if (index !== activeIndex) setActiveIndex(index);
       } else if (isScrolling.current) {
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, rotationRef.current, 0.1);
       }
       
       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       <group 
          ref={groupRef} 
          position={[0, 6.5, 0]} 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
       >
           <mesh visible={false}>
               <cylinderGeometry args={[15, 15, 10, 16]} />
           </mesh>

           {WIDGETS_DATA.map((widget, i) => {
               const angle = (i / 5) * Math.PI * 2;
               const radius = 11.35; 
               const isFront = i === activeIndex;

               return (
                   <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
                       <mesh>
                           <boxGeometry args={[16.5, 9.5, 0.4]} />
                           <meshStandardMaterial color="#050505" metalness={1} roughness={0.5} />
                           <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.2} />
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
