'use client';
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

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
       if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   const handlePointerMove = (e: any) => {
       if (!isDragging.current) return;
       const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
       const deltaX = currentX - previousX.current;
       velocity.current = deltaX * 0.01; // Máxima sensibilidad para probar
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
           velocity.current *= 0.9;
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
       <group ref={groupRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
           {/* Área de toque gigante */}
           <mesh visible={false}>
               <sphereGeometry args={[20, 16, 16]} />
           </mesh>

           {[0, 1, 2, 3, 4].map((i) => {
               const colors = ['#ff1493', '#4169e1', '#00fa9a', '#ffff00', '#9932cc'];
               const angle = (i / 5) * Math.PI * 2;
               return (
                   <group key={i} position={[Math.sin(angle) * 15, 0, Math.cos(angle) * 15]} rotation={[0, angle, 0]}>
                       <mesh>
                           <boxGeometry args={[24, 10, 0.5]} />
                           <meshStandardMaterial color={colors[i]} />
                           <Edges color="white" />
                       </mesh>
                   </group>
               );
           })}
       </group>
   );
}
