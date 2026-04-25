'use client';
import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers';

function ServiceBanner({ title, index, total, rotationY, radius, heightStep, size, dragDistance }: {
   title: string,
   index: number,
   total: number,
   rotationY: number,
   radius: number,
   heightStep: number,
   size: [number, number],
   dragDistance: React.MutableRefObject<number>
}) {
   const meshRef = useRef<THREE.Mesh>(null);

   const texture = useMemo(() => {
       const c = document.createElement('canvas');
       const ctx = c.getContext('2d');
       if (!ctx) return null;
       c.width = 1024; c.height = 350;
      
       const margin = 20;
       const pWidth = 1024 - (margin * 2);
       const pHeight = 350 - (margin * 2);
      
       // --- 1. FONDO DE CRISTAL ---
       const rainbowGrad = ctx.createLinearGradient(margin, margin, 1024 - margin, 350 - margin);
       rainbowGrad.addColorStop(0, 'rgba(255, 0, 0, 0.08)');   
       rainbowGrad.addColorStop(0.2, 'rgba(255, 255, 0, 0.08)');
       rainbowGrad.addColorStop(0.4, 'rgba(0, 255, 0, 0.08)');  
       rainbowGrad.addColorStop(0.6, 'rgba(0, 255, 255, 0.08)');
       rainbowGrad.addColorStop(0.8, 'rgba(0, 0, 255, 0.08)');  
       rainbowGrad.addColorStop(1, 'rgba(255, 0, 255, 0.08)');  
      
       ctx.fillStyle = 'rgba(10, 10, 15, 0.4)';
       ctx.fillRect(margin, margin, pWidth, pHeight);
      
       ctx.fillStyle = rainbowGrad;
       ctx.fillRect(margin, margin, pWidth, pHeight);
      
       const shine = ctx.createLinearGradient(margin, margin, margin, 350 - margin);
       shine.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
       shine.addColorStop(0.5, 'transparent');
       shine.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
       ctx.fillStyle = shine;
       ctx.fillRect(margin, margin, pWidth, pHeight);

       // --- 2. BORDE NEÓN DE 1 PÍXEL ---
       ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
       ctx.shadowBlur = 15;                         
       ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
       ctx.lineWidth = 1;                           
      
       ctx.strokeRect(margin, margin, pWidth, pHeight);
       ctx.shadowBlur = 0;

       // --- 3. TEXTO ---
       ctx.fillStyle = '#fff';
       ctx.font = '500 62px "Montserrat", sans-serif';
       ctx.textAlign = 'center';
       ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
       ctx.shadowBlur = 10;
       ctx.fillText(title, 512, 185);
      
       return new THREE.CanvasTexture(c);
   }, [title]);

   useFrame(() => {
       if (!meshRef.current) return;
       const angle = (index / total) * Math.PI * 2 + rotationY + Math.PI;
       meshRef.current.position.x = Math.sin(angle) * radius;
       meshRef.current.position.z = Math.cos(angle) * radius;
      
       const totalH = total * heightStep;
       const vOff = (rotationY / (Math.PI * 2)) * totalH;
       const iY = (index - 2) * heightStep;
       let yPos = ((iY + vOff + totalH / 2) % totalH + totalH) % totalH - totalH / 2;
      
       meshRef.current.position.y = yPos;
       meshRef.current.lookAt(0, yPos, 0);
       meshRef.current.rotateY(Math.PI);
      
       const wp = new THREE.Vector3();
       meshRef.current.getWorldPosition(wp);
       if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
           meshRef.current.material.opacity = THREE.MathUtils.smoothstep(wp.z, -3, 8) * (1.0 - THREE.MathUtils.smoothstep(Math.abs(wp.y), 8, 12));
       }
   });

   const handlePointerUp = (e: any) => {
       if (dragDistance.current < 15) {
           window.dispatchEvent(new CustomEvent('open-service', { detail: index }));
       }
   };

   return (
       <mesh ref={meshRef} onPointerUp={handlePointerUp}>
           <planeGeometry args={size} />
           <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
       </mesh>
   );
}

export default function ServiceCylinder() {
   const { language } = useLanguage();
   const { size } = useThree();
   const isMobile = size.width < 768;
   const scaleFactor = isMobile ? 0.6 : 1.0;

   const RADIUS = 5.5 * scaleFactor;
   const HEIGHT_STEP = 5.5 * scaleFactor;
   const BANNER_SIZE: [number, number] = [11 * scaleFactor, 3.8 * scaleFactor];
  
   const SERVICIOS = [
       { titulo: language === 'es' ? "PRODUCCIÓN AUDIOVISUAL" : "AUDIOVISUAL PRODUCTION" },
       { titulo: language === 'es' ? "MARKETING DE PRECISIÓN" : "PRECISION MARKETING" },
       { titulo: language === 'es' ? "IA Y AUTOMATIZACIONES" : "AI & AUTOMATIONS" },
       { titulo: language === 'es' ? "BRANDING Y PR" : "BRANDING & PR" },
       { titulo: language === 'es' ? "FÍSICO Y EVENTOS" : "PHYSICAL & EVENTS" }
   ];

   const [rotationY, setRotationY] = useState(0);
   const rotRef = useRef(0);
   const velocity = useRef(0);
   const isDragging = useRef(false);
   
   // AHORA RASTREAMOS LA X (Horizontal)
   const lastX = useRef(0);
   const dragDistance = useRef(0);

   useFrame(() => {
       if (!isDragging.current) {
           velocity.current *= 0.95;
           rotRef.current -= (0.0015 + velocity.current); // Rotación automática constante
       } else {
           velocity.current *= 0.8;
       }
       setRotationY(rotRef.current);
   });

   const handlePointerDown = (e: any) => {
       isDragging.current = true;
       // Captura multi-dispositivo de la coordenada X
       lastX.current = e.clientX || (e.touches && e.touches[0].clientX) || e.nativeEvent?.clientX || 0;
       velocity.current = 0;
       dragDistance.current = 0;
   };

   const handlePointerUp = () => {
       isDragging.current = false;
   };

   const handlePointerMove = (e: any) => {
       if (isDragging.current) {
           // Captura multi-dispositivo de la coordenada X
           const currentX = e.clientX || (e.touches && e.touches[0].clientX) || e.nativeEvent?.clientX || 0;
           const pixelDelta = currentX - lastX.current;
           
           dragDistance.current += Math.abs(pixelDelta);
          
           // Sensibilidad ajustada para el arrastre horizontal
           const delta = pixelDelta * 0.005;
           velocity.current = delta;
           
           // Usamos += para que gire orgánicamente siguiendo la dirección de tu dedo
           rotRef.current += delta;
           lastX.current = currentX;
       }
   };

   return (
       <group>
           <Sparkles 
               count={300} 
               scale={[RADIUS * 2, 15, RADIUS * 2]} 
               size={2.5 * scaleFactor} 
               speed={0.2} 
               opacity={0.35} 
               color="#ffffff" 
           />

           <group
               onPointerDown={handlePointerDown}
               onPointerUp={handlePointerUp}
               onPointerMove={handlePointerMove}
               onPointerLeave={handlePointerUp}
               onPointerCancel={handlePointerUp}
           >
               {SERVICIOS.map((s, i) => (
                   <ServiceBanner
                       key={`${s.titulo}-${i}`}
                       title={s.titulo}
                       index={i}
                       total={SERVICIOS.length}
                       rotationY={rotationY}
                       radius={RADIUS}
                       heightStep={HEIGHT_STEP}
                       size={BANNER_SIZE}
                       dragDistance={dragDistance}
                   />
               ))}
           </group>
       </group>
   );
}
