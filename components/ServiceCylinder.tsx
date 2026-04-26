'use client';
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useLanguage } from './Providers';

function InfoBanner({ service, index, total, radius, size, wheelDataRef }: any) {
   const meshRef = useRef<THREE.Mesh>(null);

   const texture = useMemo(() => {
       const c = document.createElement('canvas');
       const ctx = c.getContext('2d');
       if (!ctx) return null;
       // 📐 Aumentamos resolución para nitidez
       c.width = 1600; c.height = 600; 
      
       // Fondo Deep Black con degradado sutil
       const grad = ctx.createLinearGradient(0, 0, 0, 600);
       grad.addColorStop(0, 'rgba(5, 5, 10, 0.95)');
       grad.addColorStop(1, 'rgba(10, 10, 20, 0.95)');
       ctx.fillStyle = grad;
       ctx.fillRect(0, 0, 1600, 600);

       // Borde Tecnológico (solo arriba y abajo para estilo wide)
       ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
       ctx.lineWidth = 8;
       ctx.beginPath(); ctx.moveTo(100, 0); ctx.lineTo(1500, 0); ctx.stroke();
       ctx.beginPath(); ctx.moveTo(100, 600); ctx.lineTo(1500, 600); ctx.stroke();

       ctx.textAlign = 'center';
       
       // TÍTULO (Más elegante)
       ctx.fillStyle = '#00ffff';
       ctx.font = 'bold 70px Montserrat, sans-serif';
       ctx.letterSpacing = "10px";
       ctx.fillText(service.titulo.toUpperCase(), 800, 150);

       // DESCRIPCIÓN (Más limpia y ancha)
       ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
       ctx.font = '300 38px Montserrat, sans-serif';
       const lines = service.desc.split('\n');
       lines.forEach((line: string, i: number) => {
           ctx.fillText(line, 800, 300 + (i * 60));
       });

       // STATS (Botón estilizado abajo)
       ctx.fillStyle = '#00ffff';
       ctx.font = '800 32px Montserrat, sans-serif';
       ctx.fillText(`// ${service.stats} //`, 800, 520);
      
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
       mat.opacity = THREE.MathUtils.lerp(mat.opacity, isActive ? 1 : 0.03, 0.1);
   });

   return (
       <mesh ref={meshRef}>
           <planeGeometry args={size} />
           <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
       </mesh>
   );
}

export default function ServiceCylinder({ wheelDataRef }: any) {
   const { language } = useLanguage();
   const scale = 1.3; 
   const RADIUS = 14 * scale; 
   const BANNER_SIZE: [number, number] = [24 * scale, 9 * scale]; // 📐 Proporción mucho más ancha

   const SERVICIOS_INFO = useMemo(() => [
       { titulo: language === 'es' ? "Producción Audiovisual" : "Audiovisual Production", desc: "Cinematografía de alto impacto con narrativa inmersiva.\nResolución 8K RAW y despliegue de drones tácticos.", stats: "PREMIUM CINEMA" },
       { titulo: language === 'es' ? "Marketing de Precisión" : "Precision Marketing", desc: "Estrategias de adquisición basadas en comportamiento.\nOptimización predictiva y análisis masivo de datos.", stats: "DATA DRIVEN" },
       { titulo: language === 'es' ? "IA y Automatización" : "AI & Automation", desc: "Integración de agentes autónomos y redes neuronales.\nSistemas cognitivos para escalabilidad empresarial.", stats: "NEURAL CORE" },
       { titulo: language === 'es' ? "Branding y PR" : "Branding & PR", desc: "Ingeniería de percepción visual y autoridad de marca.\nPosicionamiento en mercados globales de alto valor.", stats: "TOP AUTHORITY" },
       { titulo: language === 'es' ? "Físico y Eventos" : "Physical & Events", desc: "Diseño de espacios efímeros y experiencias sensoriales.\nShowrooms tecnológicos y activaciones de lujo.", stats: "IMMERSIVE LIVE" }
   ], [language]);

   const coreRef = useRef<THREE.Group>(null);
   useFrame(() => {
       if (coreRef.current && wheelDataRef.current) {
           coreRef.current.rotation.y = THREE.MathUtils.lerp(coreRef.current.rotation.y, wheelDataRef.current.rotation, 0.1);
       }
   });

   return (
       <group ref={coreRef}>
           {SERVICIOS_INFO.map((s, i) => (
               <InfoBanner key={i} service={s} index={i} total={5} radius={RADIUS} size={BANNER_SIZE} wheelDataRef={wheelDataRef} />
           ))}
       </group>
   );
}
