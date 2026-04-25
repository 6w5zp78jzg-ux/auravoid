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
   const lastMoveTime = useRef(0);

   const faceAngle = (Math.PI * 2) / 5;

   // --- MANEJO DE EVENTOS (MEJORADO) ---
   const onPointerDown = (e: any) => {
       // Esto evita que otros elementos "roben" el click
       e.stopPropagation();
       (e.target as HTMLElement).setPointerCapture(e.pointerId);
       
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       velocity.current = 0;
       lastMoveTime.current = performance.now();
   };

   const onPointerMove = (e: any) => {
       if (!isDragging.current) return;
       
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const now = performance.now();
       const deltaX = currentX - previousX.current;
       const deltaTime = now - lastMoveTime.current;

       // Sensibilidad táctil premium
       const sensitivity = 0.006;
       rotationRef.current += deltaX * sensitivity;
       
       if (deltaTime > 0) {
           velocity.current = (deltaX * sensitivity) / (deltaTime / 16);
       }

       previousX.current = currentX;
       lastMoveTime.current = now;
   };

   const onPointerUp = (e: any) => {
       isDragging.current = false;
       (e.target as HTMLElement).releasePointerCapture(e.pointerId);
   };

   useFrame(() => {
       if (!groupRef.current) return;

       if (!isDragging.current) {
           // Inercia
           rotationRef.current += velocity.current;
           velocity.current *= 0.95; // Fricción

           // Snap Magnético (Solo cuando se frena)
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           const diff = targetSnap - rotationRef.current;
           
           if (Math.abs(velocity.current) < 0.05) {
               rotationRef.current += diff * 0.1;
           }

           // Calcular índice activo
           let index = Math.round(-rotationRef.current / faceAngle) % 5;
           if (index < 0) index += 5;
           if (index !== activeIndex) setActiveIndex(index);
       }

       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       <group 
          ref={groupRef} 
          position={[0, 8.5, 0]} 
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
       >
           {/* 🛡️ ÁREA DE CAPTURA INVISIBLE: Asegura que el giro funcione siempre */}
           <mesh visible={false}>
               <cylinderGeometry args={[14, 14, 10, 20]} />
           </mesh>

           {WIDGETS_DATA.map((widget, i) => {
               const angle = (i / 5) * Math.PI * 2;
               
               // 📐 RADIO MONOLÍTICO: 11.35 hace que los bordes se toquen perfectamente
               const radius = 11.35; 
               const isFront = i === activeIndex;

               return (
                   <group 
                      key={widget.id} 
                      position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} 
                      rotation={[0, angle, 0]}
                   >
                       {/* ESTRUCTURA FÍSICA (Chasis) */}
                       <mesh>
                           <boxGeometry args={[16.5, 9.5, 0.5]} />
                           <meshStandardMaterial color="#020202" metalness={0.9} roughness={0.4} />
                           <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.2} />
                       </mesh>

                       {/* EL WIDGET (Ya corregido para no devolver null) */}
                       <group position={[0, 0, 0.3]}>
                           <widget.Component isActive={isFront} />
                       </group>
                   </group>
               );
           })}
       </group>
   );
}
