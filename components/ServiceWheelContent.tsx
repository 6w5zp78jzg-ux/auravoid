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

function PanelFrame({ color, isFront }: { color: string, isFront: boolean }) {
   const W = 16.5; 
   const H = 9.5;
   const geometry = useMemo(() => new THREE.BoxGeometry(W, H, 0.4), []);

   return (
       <mesh geometry={geometry}>
           <meshStandardMaterial 
              color="#020202" 
              roughness={0.9} 
              metalness={0.5} 
           />
           <Edges scale={1.002} threshold={15} color={color} transparent opacity={isFront ? 1 : 0.3} />
       </mesh>
   );
}

export default function ServiceWheelContent() {
   const groupRef = useRef<THREE.Group>(null);
   const [activeIndex, setActiveIndex] = useState(0);

   // --- FÍSICA AVANZADA ---
   const isDragging = useRef(false);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const previousX = useRef(0);
   const lastMoveTime = useRef(0);

   // Parámetros de sensación (Ajustables)
   const friction = 0.95;     // Inercia: 0.98 flota mucho, 0.90 se frena rápido
   const snapStrength = 0.12; // Qué tan fuerte el imán te absorbe al centro
   const faceAngle = (Math.PI * 2) / 5; // 72 grados por cara

   const handlePointerDown = (e: any) => {
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       velocity.current = 0;
       lastMoveTime.current = performance.now();
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const now = performance.now();
       const deltaTime = now - lastMoveTime.current;
       
       const deltaX = currentX - previousX.current;
       const moveScale = 0.006; // Sensibilidad del dedo
       
       rotationRef.current += deltaX * moveScale;
       
       // Calculamos la velocidad basada en el último movimiento para la inercia
       if (deltaTime > 0) {
           velocity.current = (deltaX * moveScale) / (deltaTime / 16.6);
       }

       previousX.current = currentX;
       lastMoveTime.current = now;
   };

   const handlePointerUp = () => {
       isDragging.current = false;
   };

   useFrame((state, delta) => {
       if (!groupRef.current) return;

       if (!isDragging.current) {
           // 1. Aplicamos Inercia (Fricción)
           rotationRef.current += velocity.current;
           velocity.current *= friction;

           // 2. Cálculo de Snap Magnético
           // Buscamos el ángulo ideal del panel más cercano
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           const diff = targetSnap - rotationRef.current;
           
           // El snap se activa progresivamente cuando la rueda pierde velocidad
           if (Math.abs(velocity.current) < 0.05) {
               rotationRef.current += diff * snapStrength;
               velocity.current *= 0.8; // Ayuda a estabilizar el frenado
           }

           // 3. Actualizar índice activo (para cargar widgets)
           let index = Math.round(-rotationRef.current / faceAngle) % 5;
           if (index < 0) index += 5;
           if (index !== activeIndex) setActiveIndex(index);
       }

       // Aplicamos la rotación física al modelo
       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       <group
           ref={groupRef}
           position={[0, 8.5, 0]} // Elevado más arriba para despejar el logo
           onPointerDown={handlePointerDown}
           onPointerMove={handlePointerMove}
           onPointerUp={handlePointerUp}
           onPointerLeave={handlePointerUp}
           onPointerCancel={handlePointerUp}
       >
           <ambientLight intensity={0.5} />
           <pointLight position={[0, 0, 10]} intensity={2} color="#ffffff" />

           {WIDGETS_DATA.map((widget, i) => {
               const radius = 12.5; 
               const angle = (i / 5) * Math.PI * 2;
               // El widget está activo si el índice coincide
               const isFront = i === activeIndex;

               return (
                   <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
                       
                       <PanelFrame color={widget.color} isFront={isFront} />

                       <group position={[0, 0, 0.25]}>
                           <widget.Component isActive={isFront} />
                       </group>

                   </group>
               );
           })}
       </group>
   );
}
