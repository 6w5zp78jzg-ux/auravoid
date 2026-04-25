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
  { id: 'av', Component: AudiovisualWidget, titleEs: "PRODUCCIÓN AUDIOVISUAL", titleEn: "AUDIOVISUAL PRODUCTION", color: '#ff1493' },
  { id: 'mk', Component: MarketingWidget, titleEs: "MARKETING DE PRECISIÓN", titleEn: "PRECISION MARKETING", color: '#4169e1' },
  { id: 'ai', Component: IARobotTracker, titleEs: "IA Y AUTOMATIZACIONES", titleEn: "AI & AUTOMATIONS", color: '#00fa9a' },
  { id: 'br', Component: BrandingWidget, titleEs: "BRANDING Y PR", titleEn: "BRANDING & PR", color: '#ffff00' },
  { id: 'ev', Component: EventsWidget, titleEs: "FÍSICO Y EVENTOS", titleEn: "PHYSICAL & EVENTS", color: '#9932cc' }
];

// --- SUBCOMPONENTE: CHASSIS DEL MONOLITO ---
// Aquí eliminamos el error de doble rotación. Ahora solo dibuja el objeto en su sitio.
function ServiceMonolith({ title, isFront, color }: { title: string, isFront: boolean, color: string }) {
   // Dimensiones calculadas para que los 5 encajen perfectamente como un anillo
   const frameGeometry = useMemo(() => new THREE.BoxGeometry(11.5, 7.5, 0.4), []);
   const textPanelGeometry = useMemo(() => new THREE.PlaneGeometry(11, 7), []);

   const textTexture = useMemo(() => {
       const c = document.createElement('canvas');
       const ctx = c.getContext('2d');
       if (!ctx) return null;
       c.width = 1024; c.height = 600;
      
       ctx.fillStyle = 'rgba(12, 12, 15, 0.95)';
       ctx.fillRect(0, 0, 1024, 600);
      
       ctx.fillStyle = '#ffffff';
       ctx.font = '600 65px "Montserrat", sans-serif';
       ctx.textAlign = 'center';
       ctx.textBaseline = 'middle';
       ctx.shadowColor = color;
       ctx.shadowBlur = 20;
       ctx.fillText(title, 512, 300);
      
       return new THREE.CanvasTexture(c);
   }, [title, color]);

   return (
       <group>
           {/* 1. CHASSIS METÁLICO */}
           <mesh geometry={frameGeometry}>
               <meshStandardMaterial color="#050505" roughness={0.6} metalness={0.9} />
               <Edges scale={1.001} threshold={15} color={color} transparent opacity={isFront ? 1 : 0.2} />
           </mesh>

           {/* 2. PANEL DE TEXTO BASE (Se oculta al activarse el holograma frontal) */}
           <mesh geometry={textPanelGeometry} position={[0, 0, 0.21]}>
               <meshBasicMaterial map={textTexture} transparent={true} visible={!isFront} />
           </mesh>
       </group>
   );
}

// --- COMPONENTE PRINCIPAL DE LA RUEDA ---
export default function ServiceWheelContent() {
   const { language } = useLanguage();
   const groupRef = useRef<THREE.Group>(null);
  
   const [activeIndex, setActiveIndex] = useState(0);
   const [pageLoaded, setPageLoaded] = useState(false);

   useEffect(() => {
       const timer = setTimeout(() => {
           setPageLoaded(true);
       }, 1500);
       return () => clearTimeout(timer);
   }, []);

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

       const faceAngle = (Math.PI * 2) / 5;
       const closestFace = Math.round(targetRotation.current / faceAngle);
       targetRotation.current = closestFace * faceAngle;

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
       <group
           ref={groupRef}
           onPointerDown={handlePointerDown}
           onPointerMove={handlePointerMove}
           onPointerUp={handlePointerUp}
           onPointerLeave={handlePointerUp}
           onPointerCancel={handlePointerUp}
       >
           {/* Luz puntual central que da vida a los colores desde el interior */}
           <pointLight position={[0, 0, 0]} intensity={3} color="#4c1d95" distance={15} decay={2} />
           
           <SpotLight
               position={[0, 0, 0]} 
               angle={Math.PI * 2}
               penumbra={1}
               intensity={2.5}
               distance={20}
               color="#3200a8"
               castShadow={false}
           />

           {WIDGETS_DATA.map((widgetData, i) => {
               // Radio perfecto para encajar el ancho de 11.5
               const radius = 9.5; 
               const angle = (i / 5) * Math.PI * 2;
               
               // Coordenadas absolutas de cada monolito
               const x = Math.sin(angle) * radius;
               const z = Math.cos(angle) * radius;

               const isFront = pageLoaded && i === activeIndex;
               const titleText = language === 'es' ? widgetData.titleEs : widgetData.titleEn;

               return (
                   <group
                       key={widgetData.id}
                       position={[x, 0, z]}
                       rotation={[0, angle, 0]}
                   >
                       {/* ESTRUCTURA FÍSICA Y TEXTO BASE */}
                       <ServiceMonolith
                           title={titleText}
                           isFront={isFront}
                           color={widgetData.color}
                       />

                       {/* WIDGET INTERACTIVO (Sobresale ligeramente para ponerse encima) */}
                       <group position={[0, 0, 0.25]}>
                           <widgetData.Component isActive={isFront} />
                       </group>
                   </group>
               );
           })}
       </group>
   );
}
