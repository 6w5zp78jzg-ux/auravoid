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

// --- 🏗️ SUBCOMPONENTE: EL MONOLITO HERO (100% 3D Puro) 🏗️ ---
function ServiceMonolith({ title, isFront, color }: { title: string, isFront: boolean, color: string }) {
   
   // 📐 MATEMÁTICA EXACTA DEL PENTÁGONO 📐
   // Ancho masivo = 16. Altura = 9.
   // Para que un pentágono cierre perfecto sin huecos, el radio DEBE ser W / (2 * tan(36º)).
   // 16 / 1.45308 = 11.01. (Lo aplicamos abajo en el mapeo).
   const W = 16;
   const H = 9;

   const frameGeometry = useMemo(() => new THREE.BoxGeometry(W, H, 0.4), []);
   const textPanelGeometry = useMemo(() => new THREE.PlaneGeometry(W - 0.2, H - 0.2), []);

   // 🎨 MOTOR DE RENDERIZADO DE TEXTO EN ALTA RESOLUCIÓN 🎨
   const textTexture = useMemo(() => {
       const c = document.createElement('canvas');
       const ctx = c.getContext('2d');
       if (!ctx) return null;
       c.width = 1600; c.height = 900;
      
       // Fondo oscuro premium
       ctx.fillStyle = '#050505';
       ctx.fillRect(0, 0, 1600, 900);
      
       // Brillo sutil del color corporativo en el centro
       const grad = ctx.createRadialGradient(800, 450, 0, 800, 450, 800);
       grad.addColorStop(0, `${color}30`); // 30% opacidad
       grad.addColorStop(1, 'transparent');
       ctx.fillStyle = grad;
       ctx.fillRect(0, 0, 1600, 900);
      
       // Texto Gigante y Centrado
       ctx.fillStyle = '#ffffff';
       ctx.font = '800 85px "Montserrat", sans-serif';
       ctx.textAlign = 'center';
       ctx.textBaseline = 'middle';
       ctx.shadowColor = color;
       ctx.shadowBlur = 25;
       ctx.fillText(title, 800, 450);

       // Etiqueta técnica debajo
       ctx.font = '400 24px monospace';
       ctx.fillStyle = '#666666';
       ctx.shadowBlur = 0;
       ctx.fillText("AURA & VOID // LAB", 800, 800);
      
       return new THREE.CanvasTexture(c);
   }, [title, color]);

   return (
       <group>
           {/* CHASSIS METÁLICO (Cuerpo principal) */}
           <mesh geometry={frameGeometry}>
               <meshStandardMaterial color="#020202" roughness={0.5} metalness={0.9} />
               {/* Líneas de Neón que marcan la arquitectura exacta */}
               <Edges scale={1.001} threshold={15} color={color} transparent opacity={isFront ? 1 : 0.3} />
           </mesh>

           {/* PANEL FRONTAL (El texto integrado 100% visible SIEMPRE) */}
           <mesh geometry={textPanelGeometry} position={[0, 0, 0.21]}>
               <meshBasicMaterial map={textTexture} />
           </mesh>
       </group>
   );
}

// --- ⚙️ MOTOR DE LA RUEDA (FÍSICA Y CONTROL) ⚙️ ---
export default function ServiceWheelContent() {
   const { language } = useLanguage();
   const groupRef = useRef<THREE.Group>(null);
  
   const [activeIndex, setActiveIndex] = useState(0);
   const [pageLoaded, setPageLoaded] = useState(false);

   useEffect(() => {
       const timer = setTimeout(() => setPageLoaded(true), 1000);
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
           {/* Foco interno iluminando la estructura */}
           <SpotLight position={[0, 0, 0]} angle={Math.PI * 2} penumbra={1} intensity={2} distance={30} color="#4c1d95" castShadow={false} />

           {WIDGETS_DATA.map((widgetData, i) => {
               // 📐 EL NÚMERO DE LA MAGIA ARQUITECTÓNICA 📐
               // Radio = Ancho (16) / (2 * tan(36º)). 
               // Esto garantiza que el pentágono SE CIERRA a la perfección y no parece roto.
               const radius = 11.01; 
               const angle = (i / 5) * Math.PI * 2;
               
               const x = Math.sin(angle) * radius;
               const z = Math.cos(angle) * radius;

               const isFront = pageLoaded && i === activeIndex;
               const titleText = language === 'es' ? widgetData.titleEs : widgetData.titleEn;

               return (
                   <group key={widgetData.id} position={[x, 0, z]} rotation={[0, angle, 0]}>
                       
                       {/* 1. EL MONOLITO MACIZO (El texto y la estructura siempre se ven) */}
                       <ServiceMonolith title={titleText} isFront={isFront} color={widgetData.color} />

                       {/* 2. EL COMPONENTE EXTRA (Solo visible si estás de frente) */}
                       {/* Lo ponemos con algo de opacidad para que se mezcle con el texto base y no tape el panel */}
                       <group position={[0, 0, 0.25]}>
                           {isFront && (
                               <widgetData.Component isActive={isFront} />
                           )}
                       </group>

                   </group>
               );
           })}
       </group>
   );
}
