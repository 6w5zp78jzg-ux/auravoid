'use client';
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

// Importación de tus Widgets
import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

// 1. Interfaz para la comunicación silenciosa (Ref)
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

   // Referencias de control de física y rotación
   const isDragging = useRef(false);
   const previousX = useRef(0);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const faceAngle = (Math.PI * 2) / 5; // Pentágono

   // --- GESTIÓN DE INTERACCIÓN ---
   const handlePointerDown = (e: any) => {
       e.stopPropagation();
       // Capturamos el puntero para que el iPad no pierda el foco al arrastrar rápido
       if(e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const deltaX = currentX - previousX.current;
       
       // Sensibilidad del giro
       velocity.current = deltaX * 0.005;
       rotationRef.current += velocity.current;
       previousX.current = currentX;
   };

   const handlePointerUp = (e: any) => {
       isDragging.current = false;
       if(e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
   };

   // --- BUCLE DE ANIMACIÓN (60 FPS) ---
   useFrame(() => {
       if (!groupRef.current) return;
       
       // Inercia y Magnetismo (Snap)
       if (!isDragging.current) {
           velocity.current *= 0.95; // Fricción
           rotationRef.current += velocity.current;
           
           // Snap suave al panel más cercano
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.1);
       }

       // Cálculo del índice activo (0-4)
       let index = Math.round(-rotationRef.current / faceAngle) % 5;
       if (index < 0) index += 5;
       
       // Actualización de estado local (para efectos visuales)
       if (index !== activeIndex) setActiveIndex(index);

       // 🚀 ACTUALIZACIÓN DEL REF (Cerebro compartido)
       // Esto permite que el Cilindro sepa hacia dónde girar sin crashear React
       if (wheelDataRef.current) {
           wheelDataRef.current.rotation = rotationRef.current;
           wheelDataRef.current.activeIndex = index;
       }

       // Aplicamos la rotación física al grupo 3D
       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       <group 
          ref={groupRef} 
          position={[0, 0, 0]} // Posición neutra (el padre SceneManager decide la altura)
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
       >
           {/* Malla invisible para facilitar el toque en el iPad */}
           <mesh visible={false}>
               <cylinderGeometry args={[15, 15, 10, 16]} />
           </mesh>

           {WIDGETS_DATA.map((widget, i) => {
               const angle = (i / 5) * Math.PI * 2;
               const radius = 11.35; 
               const isFront = i === activeIndex;

               return (
                   <group 
                      key={widget.id} 
                      position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} 
                      rotation={[0, angle, 0]}
                   >
                       {/* ESTRUCTURA DEL PANEL (CHASIS) */}
                       <mesh>
                           <boxGeometry args={[16.5, 9.5, 0.4]} />
                           <meshStandardMaterial 
                              color="#050505" 
                              metalness={1} 
                              roughness={0.5} 
                           />
                           {/* Bordes brillantes */}
                           <Edges 
                              color={widget.color} 
                              threshold={15} 
                              transparent 
                              opacity={isFront ? 1 : 0.2} 
                           />
                       </mesh>

                       {/* CONTENIDO DEL SERVICIO (WIDGET) */}
                       <group position={[0, 0, 0.3]}>
                           {/* MODO DIAGNÓSTICO: 
                             Si no ves nada, deja estas líneas como están.
                             Si ves los rectángulos de colores, descomenta el widget.Component
                             y comenta el rectágulo de prueba.
                           */}

                           {/* <widget.Component isActive={isFront} /> */}

                           {/* Rectángulo de prueba (Bypass de seguridad) */}
                           <mesh>
                               <planeGeometry args={[12, 6]} />
                               <meshBasicMaterial color={widget.color} wireframe opacity={0.5} transparent />
                           </mesh>
                       </group>

                   </group>
               );
           })}
       </group>
   );
}
