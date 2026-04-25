'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Edges, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

// DATOS DE SERVICIOS (Con Títulos y Colores Hero)
const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, titleEs: "PRODUCCIÓN AUDIOVISUAL", titleEn: "AUDIOVISUAL PRODUCTION", color: '#ff1493' }, // Rosa Neón
  { id: 'mk', Component: MarketingWidget, titleEs: "MARKETING DE PRECISIÓN", titleEn: "PRECISION MARKETING", color: '#4169e1' }, // Azul Real
  { id: 'ai', Component: IARobotTracker, titleEs: "IA Y AUTOMATIZACIONES", titleEn: "AI & AUTOMATIONS", color: '#00fa9a' }, // Verde Esmeralda
  { id: 'br', Component: BrandingWidget, titleEs: "BRANDING Y PR", titleEn: "BRANDING & PR", color: '#ffff00' }, // Amarillo
  { id: 'ev', Component: EventsWidget, titleEs: "FÍSICO Y EVENTOS", titleEn: "PHYSICAL & EVENTS", color: '#9932cc' } // Púrpura
];

// --- SUBCOMPONENTE: CHASSIS DEL MONOLITO (Metal + Texto base) ---
function ServiceMonolith({ title, index, total, rotationY, isFront, dragDistance, color }: {
   title: string,
   index: number,
   total: number,
   rotationY: number,
   isFront: boolean,
   dragDistance: React.MutableRefObject<number>,
   color: string
}) {
   const meshRef = useRef<THREE.Mesh>(null);
   const textMeshRef = useRef<THREE.Mesh>(null);

   // 🚀 GEOMETRÍAS MASIVAS (Aumentado tamaño a 16x11) 🚀
   const frameGeometry = useMemo(() => new THREE.BoxGeometry(16.6, 11.6, 0.4), []); // Chasis metálico
   const textPanelGeometry = useMemo(() => new THREE.PlaneGeometry(16, 11), []); // Panel de texto base

   // --- GENERACIÓN DE TEXTURA DE TEXTO BASE ( Canvas ) ---
   const textTexture = useMemo(() => {
       const c = document.createElement('canvas');
       const ctx = c.getContext('2d');
       if (!ctx) return null;
       c.width = 1024; c.height = 350;
      
       ctx.fillStyle = 'rgba(10, 10, 15, 0.9)'; // Negro muy oscuro pero no negro absoluto
       ctx.fillRect(0, 0, 1024, 350);
      
       // --- TEXTO (Montserrat sutil) ---
       ctx.fillStyle = '#fff';
       ctx.font = '500 62px "Montserrat", sans-serif';
       ctx.textAlign = 'center';
       ctx.shadowColor = 'rgba(255, 255, 255, 0.2)'; // Brillo sutil
       ctx.shadowBlur = 10;
       ctx.fillText(title, 512, 185);
      
       return new THREE.CanvasTexture(c);
   }, [title]);

   useFrame(() => {
       if (!meshRef.current || !textMeshRef.current) return;
       const angle = (index / total) * Math.PI * 2 + rotationY + Math.PI;
       
       // 🚀 RADIO MASIVO (Aumentado a 10.5 para Hero style) 🚀
       const radius = 10.5; 
       const xPos = Math.sin(angle) * radius;
       const zPos = Math.cos(angle) * radius;
      
       // Posicionamiento del monolito físico
       meshRef.current.position.set(xPos, 0, zPos);
       meshRef.current.lookAt(0, 0, 0); // Todo mira al núcleo central
       meshRef.current.rotateY(Math.PI); // Corrección de lookAt
      
       // Posicionamiento del texto base (ligeramente delante del monolito)
       textMeshRef.current.position.copy(meshRef.current.position);
       textMeshRef.current.lookAt(0, 0, 0);
       textMeshRef.current.rotateY(Math.PI);
       textMeshRef.current.translateZ(0.21); // Ligeramente delante

       // --- LÓGICA DE VISIBILIDAD DE TEXTO BASE ---
       if (textMeshRef.current.material instanceof THREE.MeshBasicMaterial) {
           // Solo mostramos el texto base si el panel NO es el frontal (isFront)
           // Esto crea el efecto de "carga" del holograma sobre el panel inactivo
           textMeshRef.current.material.visible = !isFront;
           // Desvanecimiento sutil al girar
           const opacity = THREE.MathUtils.smoothstep(meshRef.current.position.z, -3, 8);
           textMeshRef.current.material.opacity = opacity;
       }
   });

   return (
       <group>
           {/* 1. CHASSIS METÁLICO MONOLÍTICO NEGRO (Metal ness alto) */}
           <mesh ref={meshRef} geometry={frameGeometry}>
               <meshStandardMaterial
                   color="#020202"
                   roughness={0.7}
                   metalness={1}
                   side={THREE.DoubleSide}
               />
               {/* Bordes de neón tácticos del color corporativo */}
               <Edges scale={1} threshold={15} color={color} transparent opacity={isFront ? 1 : 0.3} />
           </mesh>

           {/* 2. PANEL DE TEXTO BASE (CanvasTexture con título siempre visible cuando inactivo) */}
           <mesh ref={textMeshRef} geometry={textPanelGeometry}>
               <meshBasicMaterial map={textTexture} transparent={true} side={THREE.DoubleSide} />
           </mesh>
       </group>
   );
}

// --- COMPONENTE PRINCIPAL (CONTROLADOR DE LA RUEDA HERO) ---
export default function ServiceWheelContent() {
   const { language } = useLanguage();
   const groupRef = useRef<THREE.Group>(null);
  
   // Estado para la cara activa (Empezamos con la primera cara)
   const [activeIndex, setActiveIndex] = useState(0);
   const [pageLoaded, setPageLoaded] = useState(false);

   // Activamos el motor táctil e interactive tras la carga (ahorro de RAM inicial)
   useEffect(() => {
       const timer = setTimeout(() => {
           setPageLoaded(true);
       }, 1500); // 1.5 segundos de carga de escena
       return () => clearTimeout(timer);
   }, []);

   // --- FÍSICA DE ARRASTRE ---
   const isDragging = useRef(false);
   const previousX = useRef(0);
   const velocity = useRef(0);
   const targetRotation = useRef(0);
   const dragDistance = useRef(0); // Para detectar clics vs arrastres

   const handlePointerDown = (e: any) => {
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || e.nativeEvent?.clientX || 0;
       velocity.current = 0;
       dragDistance.current = 0;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current || !pageLoaded) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || e.nativeEvent?.clientX || 0;
       const pixelDelta = currentX - previousX.current;
       
       dragDistance.current += Math.abs(pixelDelta);
      
       // Sensibilidad ajustada para el arrastre horizontal premium
       const delta = pixelDelta * 0.005;
       velocity.current = delta;
       targetRotation.current += velocity.current;
       previousX.current = currentX;
   };

   const handlePointerUp = () => {
       if (!isDragging.current || !pageLoaded) return;
       isDragging.current = false;

       // Calculamos el snap magnético al panel más cercano (72 grados)
       const faceAngle = (Math.PI * 2) / 5;
       const closestFace = Math.round(targetRotation.current / faceAngle);
       targetRotation.current = closestFace * faceAngle;

       // Matemática pura para saber qué panel está al frente (0 a 4)
       let index = (-closestFace) % 5;
       if (index < 0) index += 5; 
       
       // Solo actualizamos si cambia, para evitar re-renders innecesarios
       if (index !== activeIndex) {
           setActiveIndex(index);
       }
   };

   useFrame(() => {
       if (!groupRef.current) return;
       if (!isDragging.current) {
           // Viaje suave hacia el snap magnético
           groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current, 0.1);
       } else {
           // Sigue al dedo al instante
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
           {/* 💡 --- SISTEMA DE ILUMINACIÓN VOLUMÉTRICA INTERNA (Núcleo) --- 💡 */}
           {/* Luz puntual central que ilumina los monolitos desde el interior */}
           <pointLight position={[0, 0, 0]} intensity={3} color="#4c1d95" distance={15} decay={2} />
           
           {/* Foco central que ilumina hacia afuera los cristales inactivos */}
           <SpotLight
               position={[0, 0, 0]} 
               angle={Math.PI * 2} // Círculo completo
               penumbra={1}
               intensity={2.5}
               distance={20}
               color="#3200a8" // Purple / Violet base
               castShadow={false}
           />

           {WIDGETS_DATA.map((widgetData, i) => {
               // 🚀 RADIO MASIVO (Aumentado a 10.5 para Hero style) 🚀
               const radius = 10.5; 
               
               // Ángulo de cada panel
               const angle = (i / 5) * Math.PI * 2;
               
               // Coordenadas fijas del monolito en el universo (Y=0 fijo)
               const x = Math.sin(angle) * radius;
               const z = Math.cos(angle) * radius;

               // Lógica de visibilidad del Holograma Interactivo
               const isFront = pageLoaded && i === activeIndex;
               
               // Selección de título basado en el idioma
               const titleText = language === 'es' ? widgetData.titleEs : widgetData.titleEn;

               return (
                   <group
                       key={widgetData.id}
                       position={[x, 0, z]}
                       rotation={[0, angle, 0]}
                   >
                       {/* 1. CHASSIS DEL MONOLITO (Físico, masivo y siempre visible con texto base) */}
                       <ServiceMonolith
                           title={titleText}
                           index={i}
                           total={WIDGETS_DATA.length}
                           rotationY={groupRef.current?.rotation.y || 0}
                           isFront={isFront}
                           dragDistance={dragDistance}
                           color={widgetData.color}
                       />

                       {/* 2. HOLOGRAMA INTERACTIVO (HTML de Drei, Solo visible al estar de frente) */}
                       {/* Al encenderse, se superpone al texto base con tu diseño premium */}
                       <group position={[0, 0, 0.22]}>
                           <widgetData.Component isActive={isFront} />
                       </group>
                   </group>
               );
           })}
       </group>
   );
}
