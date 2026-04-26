'use client';
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import AudiovisualWidget from './AudiovisualWidget';

export default function ServiceWheelContent({ wheelDataRef }: any) {
   const groupRef = useRef<THREE.Group>(null);
   const [activeIndex, setActiveIndex] = useState(0);

   const isDragging = useRef(false);
   const previousX = useRef(0);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const faceAngle = (Math.PI * 2) / 5;

   const handlePointerDown = (e: any) => {
       e.stopPropagation();
       // Forzamos al navegador a darnos el control total del dedo
       if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const deltaX = currentX - previousX.current;
       
       velocity.current = deltaX * 0.01; // Más sensibilidad
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
           velocity.current *= 0.9; // Fricción
           rotationRef.current += velocity.current;
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.1);
       }

       let index = Math.round(-rotationRef.current / faceAngle) % 5;
       if (index < 0) index += 5;
       if (index !== activeIndex) setActiveIndex(index);

       if (wheelDataRef.current) {
           wheelDataRef.current.rotation = rotationRef.current;
           wheelDataRef.current.activeIndex = index;
       }
       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       <group 
          ref={groupRef} 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
       >
           {/* CAPA DE CAPTURA: Una esfera invisible enorme para que el dedo siempre gire la rueda */}
           <mesh visible={false}>
               <sphereGeometry args={[25, 16, 16]} />
           </mesh>

           {[0, 1, 2, 3, 4].map((i) => {
               const angle = (i / 5) * Math.PI * 2;
               return (
                   <group key={i} position={[Math.sin(angle) * 15, 0, Math.cos(angle) * 15]} rotation={[0, angle, 0]}>
                       <mesh>
                           <boxGeometry args={[24, 10, 0.1]} />
                           <meshBasicMaterial color="#050505" />
                       </mesh>
                       <group position={[0, 0, 0.1]}>
                           {i === 0 && <AudiovisualWidget isActive={i === activeIndex} />}
                           {/* Resto de widgets irán aquí */}
                       </group>
                   </group>
               );
           })}
       </group>
   );
}
