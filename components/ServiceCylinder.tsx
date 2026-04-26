'use client';
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers';

interface WheelData {
  rotation: number;
  activeIndex: number;
}

function InfoBanner({ 
   service, 
   index, 
   total, 
   radius, 
   size, 
   wheelDataRef 
}: {
   service: { titulo: string, desc: string, stats: string },
   index: number,
   total: number,
   radius: number,
   size: [number, number],
   wheelDataRef?: React.MutableRefObject<WheelData>
}) {
   const meshRef = useRef<THREE.Mesh>(null);

   const texture = useMemo(() => {
       const c = document.createElement('canvas');
       const ctx = c.getContext('2d');
       if (!ctx) return null;
       c.width = 1024; c.height = 512;
      
       const margin = 20;
       const pWidth = 1024 - (margin * 2);
       const pHeight = 512 - (margin * 2);
      
       ctx.fillStyle = 'rgba(10, 10, 15, 0.8)'; 
       ctx.fillRect(margin, margin, pWidth, pHeight);

       ctx.textAlign = 'center';
       ctx.fillStyle = '#ffffff';
       ctx.font = '800 45px "Montserrat", sans-serif';
       ctx.fillText(service.titulo, 512, 120);

       ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
       ctx.font = '400 32px "Montserrat", sans-serif';
       const lines = service.desc.split('\n');
       
       // 🚀 SOLUCIÓN AL ERROR: Tipado explícito (line: string, i: number)
       lines.forEach((line: string, i: number) => {
           ctx.fillText(line, 512, 240 + (i * 45));
       });

       ctx.fillStyle = '#00ffff';
       ctx.font = '700 45px "Montserrat", sans-serif';
       ctx.fillText(service.stats, 512, 420);
      
       return new THREE.CanvasTexture(c);
   }, [service]);

   useEffect(() => {
       if (!meshRef.current) return;
       const angle = (index / total) * Math.PI * 2;
       meshRef.current.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
       meshRef.current.lookAt(0, 0, 0);
       meshRef.current.rotateY(Math.PI);
   }, [index, total, radius]);

   useFrame(() => {
       if (!meshRef.current || !wheelDataRef?.current) return;
       const isActive = wheelDataRef.current.activeIndex === index;
       const mat = meshRef.current.material as THREE.MeshBasicMaterial;
       mat.opacity = THREE.MathUtils.lerp(mat.opacity, isActive ? 1 : 0.1, 0.1);
   });

   return (
       <mesh ref={meshRef}>
           <planeGeometry args={size} />
           <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
       </mesh>
   );
}

export default function ServiceCylinder({ wheelDataRef }: { wheelDataRef: React.MutableRefObject<WheelData> }) {
   const { language } = useLanguage();
   const { size: screen } = useThree();
   const isMobile = screen.width < 768;
   const scale = isMobile ? 0.5 : 0.8;

   const SERVICIOS_INFO = useMemo(() => [
       { titulo: language === 'es' ? "AUDIOVISUAL" : "AUDIOVISUAL", desc: "Producción cinematográfica 8K.\nNarrativas inmersivas.", stats: "PREMIUM CONTENT" },
       { titulo: language === 'es' ? "MARKETING" : "MARKETING", desc: "Estrategias de precisión.\nGrowth hacking táctico.", stats: "HIGH ROI" },
       { titulo: language === 'es' ? "I.A." : "A.I.", desc: "Agentes autónomos personalizados.\nAutomatización cognitiva.", stats: "NEURAL CORE" },
       { titulo: language === 'es' ? "BRANDING" : "BRANDING", desc: "Identidad visual de alto nivel.\nPosicionamiento global.", stats: "BRAND EQUITY" },
       { titulo: language === 'es' ? "EVENTOS" : "EVENTS", desc: "Experiencias físicas de lujo.\nShowrooms tecnológicos.", stats: "LIVE IMPACT" }
   ], [language]);

   const coreRef = useRef<THREE.Group>(null);

   useFrame(() => {
       if (coreRef.current && wheelDataRef.current) {
           coreRef.current.rotation.y = THREE.MathUtils.lerp(coreRef.current.rotation.y, wheelDataRef.current.rotation, 0.15);
       }
   });

   return (
       <group>
           <Sparkles count={50} scale={[6, 6, 6]} size={3} speed={0.2} color="#00ffff" />
           <group ref={coreRef}>
               {SERVICIOS_INFO.map((s, i) => (
                   <InfoBanner key={i} service={s} index={i} total={5} radius={5 * scale} size={[9 * scale, 5 * scale]} wheelDataRef={wheelDataRef} />
               ))}
           </group>
       </group>
   );
}
