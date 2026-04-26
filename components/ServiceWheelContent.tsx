'use client';
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Asegúrate de que las rutas a tus widgets sean correctas
import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

const WIDGETS = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' }, 
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' },
  { id: 'br', Component: BrandingWidget, color: '#ffff00' },
  { id: 'ev', Component: EventsWidget, color: '#9932cc' }
];

export default function ServiceWheelContent({ wheelDataRef }: any) {
   const groupRef = useRef<THREE.Group>(null);
   const [activeIndex, setActiveIndex] = useState(0);

   const isDragging = useRef(false);
   const previousX = useRef(0);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const faceAngle = (Math.PI * 2) / 5;

   // 📐 Vanguard Fix: Un radio de 22 evita que los paneles de 24 de ancho colisionen
   const RADIUS = 22; 

   const handlePointerDown = (e: any) => {
       e.stopPropagation();
       if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
       isDragging.current = true;
       
       // Extracción segura de coordenadas en R3F
       const nativeEvent = e.nativeEvent;
       previousX.current = nativeEvent.touches ? nativeEvent.touches[0].clientX : nativeEvent.clientX;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current) return;
       const nativeEvent = e.nativeEvent;
       const currentX = nativeEvent.touches ? nativeEvent.touches[0].clientX : nativeEvent.clientX;
       
       const deltaX = currentX - previousX.current;
       velocity.current = deltaX * 0.008; 
       rotationRef.current += velocity.current;
       previousX.current = currentX;
   };

   const handlePointerUp = (e: any) => {
       isDragging.current = false;
       if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
   };

   useFrame(() => {
       if (!groupRef.current) return;
       if (!isDragging.current) {
           velocity.current *= 0.95; 
           rotationRef.current += velocity.current;
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.1);
       }

       let index = Math.round(-rotationRef.current / faceAngle) % 5;
       if (index < 0) index += 5;
       if (index !== activeIndex) setActiveIndex(index);

       if (wheelDataRef && wheelDataRef.current) {
           wheelDataRef.current.rotation = rotationRef.current;
           wheelDataRef.current.activeIndex = index;
       }
       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       <>
           {/* ILUMINACIÓN Y ENTORNO: Sin esto, los materiales PBR son invisibles */}
           <ambientLight intensity={0.6} />
           <directionalLight position={[10, 10, 10]} intensity={1.5} />
           {/* El Environment le da al metal algo que reflejar, haciéndolo fotorrealista */}
           <Environment preset="city" /> 

           <group 
              ref={groupRef} 
              onPointerDown={handlePointerDown} 
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
           >
               {/* Escudo invisible - Mantenido pero ajustado al nuevo radio */}
               <mesh visible={false}>
                   <sphereGeometry args={[RADIUS + 5, 16, 16]} />
               </mesh>

               {WIDGETS.map((widget, i) => {
                   const angle = (i / 5) * Math.PI * 2;
                   const isFront = i === activeIndex;

                   return (
                       <group 
                            key={widget.id} 
                            position={[Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS]} 
                            rotation={[0, angle, 0]}
                        >
                           {/* Chasis */}
                           <mesh>
                               <boxGeometry args={[24, 10, 0.4]} />
                               {/* Color ligeramente más claro para apreciar los reflejos del metal */}
                               <meshStandardMaterial 
                                    color="#111111" 
                                    metalness={0.9} 
                                    roughness={0.3} 
                                />
                               <Edges 
                                    color={widget.color} 
                                    threshold={15} 
                                    transparent 
                                    opacity={isFront ? 1 : 0.2} 
                                />
                           </mesh>
                           
                           {/* Contenido (Widgets Reales) */}
                           <group position={[0, 0, 0.3]}>
                               <widget.Component isActive={isFront} />
                           </group>
                       </group>
                   );
               })}
           </group>
       </>
   );
}
