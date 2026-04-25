'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, SpotLight, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

// DATOS DE SERVICIOS (Con Títulos y Colores Hero)
const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' }, // Rosa Neón
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' }, // Azul Real
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' }, // Verde Esmeralda
  { id: 'br', Component: BrandingWidget, color: '#ffff00' }, // Amarillo
  { id: 'ev', Component: EventsWidget, color: '#9932cc' } // Púrpura
];

// --- 🏗️ SUBCOMPONENTE: CHASSIS HERO (Solo estructura) 🏗️ ---
// Hemos ELIMINADO completamente la textura de texto y las pantallas negras.
// Ahora es solo un marco de "Obsidiana" sutil que sirve de base para tus widgets.
function ServiceMonolithStructure({ isFront, color }: { isFront: boolean, color: string }) {
   
   // 📐 MATEMÁTICA EXACTA DEL PENTÁGONO HERO 📐
   const W = 16.5; // Masivo
   const H = 9.5; // Imponente

   const frameGeometry = useMemo(() => new THREE.BoxGeometry(W, H, 0.4), []);

   return (
       <group>
           {/* CHASSIS METÁLICO (Cuerpo principal sutil) */}
           <mesh geometry={frameGeometry}>
               <meshStandardMaterial 
                   color="#050505" 
                   roughness={0.7} 
                   metalness={1} 
                   transparent
                   opacity={0.9} 
               />
               {/* Líneas de Neón que marcan la arquitectura exacta de la rueda */}
               <Edges scale={1.001} threshold={15} color={color} transparent opacity={isFront ? 1 : 0.3} />
           </mesh>
       </group>
   );
}

// --- ⚙️ MOTOR DE LA RUEDA HERO (FÍSICA Y CONTROL) ⚙️ ---
export default function ServiceWheelContent() {
   const { language } = useLanguage();
   const groupRef = useRef<THREE.Group>(null);
  
   // Estado para la cara activa (empezamos en null para no sobrecargar el inicio táctil)
   const [activeIndex, setActiveIndex] = useState<number | null>(null);
   const [pageLoaded, setPageLoaded] = useState(false);

   // Temporizador para activar el motor táctil tras la carga de página
   useEffect(() => {
       const timer = setTimeout(() => {
           setPageLoaded(true);
           setActiveIndex(0); // Activamos la primera cara tras 1.5s
       }, 1500);
       return () => clearTimeout(timer);
   }, []);

   // --- FÍSICA DE ARRASTRE PREMIUM ---
   const isDragging = useRef(false);
   const previousX = useRef(0);
   const velocity = useRef(0);
   const targetRotation = useRef(0);

   const handlePointerDown = (e: any) => {
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || e.nativeEvent?.clientX || 0;
       velocity.current = 0;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current || !pageLoaded) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || e.nativeEvent?.clientX || 0;
       const pixelDelta = currentX - previousX.current;
      
       const delta = pixelDelta * 0.005;
       velocity.current = delta;
       targetRotation.current += velocity.current;
       previousX.current = currentX;
   };

   const handlePointerUp = () => {
       if (!isDragging.current || !pageLoaded) return;
       isDragging.current = false;

       // Snap magnético al panel más cercano (72 grados)
       const faceAngle = (Math.PI * 2) / 5;
       const closestFace = Math.round(targetRotation.current / faceAngle);
       targetRotation.current = closestFace * faceAngle;

       // Matemática para saber qué panel está al frente (0 a 4)
       let index = (-closestFace) % 5;
       if (index < 0) index += 5; 
       
       if (index !== activeIndex) {
           setActiveIndex(index);
       }
   };

   useFrame(() => {
       if (!groupRef.current) return;
       if (!isDragging.current) {
           groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current, 0.1);
       } else {
           groupRef.current.rotation.y = targetRotation.current;
       }
   });

   return (
       // 🚀 DETALLE: Hemos añadido position={[0, 1.5, 0]} para subir la rueda
       // y evitar que pise el logo 'AURA & VOID' en la parte inferior.
       <group
           ref={groupRef}
           position={[0, 1.5, 0]} 
           onPointerDown={handlePointerDown}
           onPointerMove={handlePointerMove}
           onPointerUp={handlePointerUp}
           onPointerLeave={handlePointerUp}
           onPointerCancel={handlePointerUp}
       >
           {/* Foco interno iluminando la estructura desde dentro */}
           <SpotLight position={[0, 0, 0]} angle={Math.PI * 2} penumbra={1} intensity={1.5} distance={30} color="#3200a8" castShadow={false} />
           {/* Pequeña luz puntual para dar relieve a los widgets frontales */}
           <pointLight position={[0, 0, 5]} intensity={1} color="#ffffff" distance={20} />

           {WIDGETS_DATA.map((widgetData, i) => {
               // 📐 ARQUITECTURA PENTÁGONAL PERFECTA 📐
               // Radio = Ancho (16.5) / (2 * tan(36º)). 
               const radius = 11.35; 
               const angle = (i / 5) * Math.PI * 2;
               
               const x = Math.sin(angle) * radius;
               const z = Math.cos(angle) * radius;

               const isFront = pageLoaded && i === activeIndex;

               return (
                   <group key={widgetData.id} position={[x, 0, z]} rotation={[0, angle, 0]}>
                       
                       {/* 1. EL CHASSIS HERO (Solo estructura maciza) */}
                       <ServiceMonolithStructure isFront={isFront} color={widgetData.color} />

                       {/* 2. EL WIDGET INTERACTIVO COMPLETO (Se muestra SIEMPRE) */}
                       {/* Ya no hay condición de 'if (isFront && ...)'. Se renderizan los 5 siempre. */}
                       {/* Pasamos 'isActive' para que el widget sepa si tiene que mostrar partículas/vídeos complexes o solo estáticos. */}
                       <group position={[0, 0, 0.22]}>
                           <widgetData.Component isActive={isFront} />
                       </group>

                       {/* Partículas internas que flotan solo dentro de los marcos inactivos para dar ambiente */}
                       {!isFront && (
                           <Sparkles count={15} scale={[8, 5, 0.5]} size={3} speed={0.2} opacity={0.2} color={widgetData.color} />
                       )}
                   </group>
               );
           })}
       </group>
   );
}
