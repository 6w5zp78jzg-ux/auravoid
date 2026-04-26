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

function InfoBanner({ service, index, total, radius, size, wheelDataRef }: any) {
   const meshRef = useRef<THREE.Mesh>(null);

   const texture = useMemo(() => {
       const c = document.createElement('canvas');
       const ctx = c.getContext('2d');
       if (!ctx) return null;
       c.width = 1024; c.height = 512;
      
       const margin = 30;
       const pWidth = 1024 - (margin * 2);
       const pHeight = 512 - (margin * 2);
      
       // Estética Cristal Aura Void
       ctx.fillStyle = 'rgba(10, 10, 15, 0.85)'; 
       ctx.fillRect(margin, margin, pWidth, pHeight);

       ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
       ctx.lineWidth = 4;
       ctx.strokeRect(margin, margin, pWidth, pHeight);

       ctx.textAlign = 'center';
       // Título Principal
       ctx.fillStyle = '#00ffff';
       ctx.font = 'bold 50px Montserrat, sans-serif';
       ctx.fillText(service.titulo, 512, 120);

       // Separador
       ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
       ctx.fillRect(362, 160, 300, 3);

       // Descripción con tipado corregido
       ctx.fillStyle = '#ffffff';
       ctx.font = '34px Montserrat, sans-serif';
       const lines = service.desc.split('\n');
       lines.forEach((line: string, i: number) => {
           ctx.fillText(line, 512, 260 + (i * 50));
       });

       // Tag inferior
       ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
       ctx.font = 'bold 40px Montserrat, sans-serif';
       ctx.fillText(service.stats, 512, 440);
      
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
       mat.opacity = THREE.MathUtils.lerp(mat.opacity, isActive ? 1 : 0.05, 0.1);
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
   
   // 📏 AJUSTE DE TAMAÑO IMPACTANTE
   const scaleFactor = isMobile ? 0.7 : 1.1; 
   const RADIUS = 11.5 * scaleFactor; 
   const BANNER_SIZE: [number, number] = [15 * scaleFactor, 7.5 * scaleFactor];
  
   const SERVICIOS_INFO = useMemo(() => [
       { titulo: language === 'es' ? "PRODUCCIÓN AUDIOVISUAL" : "AUDIOVISUAL PRODUCTION", desc: "Contenido cinematográfico de alto impacto.\nResolución 8K y drones tácticos.", stats: "PREMIUM STUDIO" },
       { titulo: language === 'es' ? "MARKETING DE PRECISIÓN" : "PRECISION MARKETING", desc: "Estrategias de adquisición de usuarios.\nOptimización predictiva mediante datos.", stats: "MAXIMUM ROI" },
       { titulo: language === 'es' ? "IA Y AUTOMATIZACIÓN" : "AI & AUTOMATION", desc: "Agentes inteligentes y redes neuronales.\nSistemas autónomos para empresas.", stats: "NEURAL CORE" },
       { titulo: language === 'es' ? "BRANDING Y PR" : "BRANDING & PR", desc: "Arquitectura de marca e ingeniería visual.\nPosicionamiento en mercados de lujo.", stats: "TOP TIER" },
       { titulo: language === 'es' ? "FÍSICO Y EVENTOS" : "PHYSICAL & EVENTS", desc: "Experiencias inmersivas y showrooms.\nDiseño de espacios efímeros de lujo.", stats: "LIVE IMPACT" }
   ], [language]);

   const coreRef = useRef<THREE.Group>(null);

   useFrame(() => {
       if (coreRef.current && wheelDataRef.current) {
           coreRef.current.rotation.y = THREE.MathUtils.lerp(coreRef.current.rotation.y, wheelDataRef.current.rotation, 0.15);
       }
   });

   return (
       <group>
           <Sparkles count={150} scale={[20, 10, 20]} size={3} speed={0.2} color="#00ffff" />
           <group ref={coreRef}>
               {SERVICIOS_INFO.map((s, i) => (
                   <InfoBanner key={i} service={s} index={i} total={5} radius={RADIUS} size={BANNER_SIZE} wheelDataRef={wheelDataRef} />
               ))}
           </group>
       </group>
   );
}
