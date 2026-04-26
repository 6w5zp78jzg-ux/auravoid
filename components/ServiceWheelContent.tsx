'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ... (tus importaciones de widgets y WIDGETS_DATA se mantienen igual)

gsap.registerPlugin(ScrollTrigger);

export default function ServiceWheelContent() {
   const groupRef = useRef<THREE.Group>(null);
   const [activeIndex, setActiveIndex] = useState(0);

   // Controles táctiles
   const isDragging = useRef(false);
   const isScrolling = useRef(false); // NUEVO: Bloqueo de seguridad
   const previousX = useRef(0);
   const rotationRef = useRef(0);
   const velocity = useRef(0);
   const faceAngle = (Math.PI * 2) / 5;

   // EL VANGUARD UPGRADE: GSAP ScrollTrigger dentro de WebGL
   useEffect(() => {
       if (!groupRef.current) return;

       // Asumimos que tu ZoomScrollArena tiene un ID o Clase que funge como trigger
       // Esto conectará el mundo 3D con el scroll de la página HTML
       const st = ScrollTrigger.create({
           trigger: "#zoomscroll-trigger-area", // Este div debe existir en tu layout/page
           start: "top top",
           end: "+=3000",
           scrub: 1, // Suavidad brutal
           onUpdate: (self) => {
               // Si estamos haciendo scroll profundo, bloqueamos el drag manual
               isScrolling.current = self.progress > 0.05;

               // 1. Efecto Zoom (Eje Z): Acercamos la rueda hasta atravesarla
               groupRef.current!.position.z = self.progress * 30; // Ajusta el 30 según tu cámara
               
               // 2. Efecto Caída (Eje Y): La bajamos ligeramente
               groupRef.current!.position.y = 6.5 - (self.progress * 5);

               // 3. Efecto Torbellino: Añadimos rotación extra basada en el scroll
               if (isScrolling.current) {
                   rotationRef.current -= self.getVelocity() * 0.001; 
               }
           }
       });

       return () => st.kill(); // Limpieza vital para evitar memory leaks
   }, []);

   // ... (tus funciones handlePointerDown, Move, Up se mantienen intactas)
   const handlePointerDown = (e: any) => {
       if (isScrolling.current) return; // Si estamos en pleno zoomscroll, anulamos el touch
       e.stopPropagation();
       if(e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
       isDragging.current = true;
       previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
   };

   // ... (handlePointerMove y handlePointerUp se mantienen igual)

   useFrame(() => {
       if (!groupRef.current) return;
       
       // Tu lógica de fricción y snapping impecable
       if (!isDragging.current && !isScrolling.current) {
           velocity.current *= 0.95;
           rotationRef.current += velocity.current;
           const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.1);

           let index = Math.round(-rotationRef.current / faceAngle) % 5;
           if (index < 0) index += 5;
           if (index !== activeIndex) setActiveIndex(index);
       } else if (isScrolling.current) {
           // Si hacemos scroll, forzamos la actualización de la rotación para el efecto torbellino
           rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, rotationRef.current, 0.1);
       }
       
       groupRef.current.rotation.y = rotationRef.current;
   });

   return (
       // ... (Tu JSX del return se mantiene EXACTAMENTE igual)
       <group 
          ref={groupRef} 
          position={[0, 6.5, 0]} 
          onPointerDown={handlePointerDown}
          /* ...resto de tus eventos y renderizado de mallas... */
       >
           {/* ... tu código de renderizado de los WIDGETS_DATA ... */}
       </group>
   );
}
