'use client';
import React, { useRef } from 'react';
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

// 🧠 Recibimos el estado desde SceneManager
interface SystemCoreProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
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
       if (scroll.offset > 0.05) return; // Bloquea si ya empezamos a hacer zoom
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

       // 1. CÁLCULO DE ZOOM BALÍSTICO
       // Multiplicamos por 2 y limitamos a 1. Así el zoom termina al 50% del scroll.
       const zoomProgress = Math.min(scroll.offset * 2, 1); 

       // Target Z: La cámara está en Z=28. El panel frontal está a Z=11.35 relativo a la rueda.
       // Acercamos la rueda hasta Z=15. Así el panel queda en Z=26.35 (justo en la cara del usuario).
       const targetZ = THREE.MathUtils.lerp(0, 15, zoomProgress);
       
       // Target Y: Llevamos la rueda a Y=0 para que el panel frontal quede exactamente en el centro
       const targetY = THREE.MathUtils.lerp(6.5, 0, zoomProgress);

       groupRef.current.position.z = targetZ;
       groupRef.current.position.y = targetY;

       // 2. CONTROL DE ROTACIÓN Y SNAP PERFECTO
       if (!isDragging.current) {
           velocity.current *= 0.95;
           
           // Si el usuario hace zoom, forzamos un frenado inmediato para evitar desvíos
           if (scroll.offset > 0.05) velocity.current = 0; 

           rotationRef.current += velocity.current;
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           
           // Interpolación dura hacia el snap si estamos en pleno zoom
           const lerpSpeed = scroll.offset > 0.05 ? 0.2 : 0.1;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, lerpSpeed);

           // Detectamos y elevamos el estado activo
           let index = Math.round(-rotationRef.current / faceAngle) % 5;
           if (index < 0) index += 5;
           if (index !== activeIndex) setActiveIndex(index);
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
