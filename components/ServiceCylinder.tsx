'use client';
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLanguage } from './Providers';

function InfoBanner({ service, index, total, radius, size, wheelDataRef }: any) {
   const meshRef = useRef<THREE.Mesh>(null);

   const texture = useMemo(() => {
       const c = document.createElement('canvas');
       const ctx = c.getContext('2d');
       if (!ctx) return null;
       c.width = 1600; c.height = 600; 
      
       ctx.fillStyle = 'rgba(5, 5, 10, 0.95)';
       ctx.fillRect(0, 0, 1600, 600);

       ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
       ctx.lineWidth = 8;
       ctx.strokeRect(0, 0, 1600, 600);

       ctx.textAlign = 'center';
       ctx.fillStyle = '#00ffff';
       ctx.font = 'bold 70px Montserrat, sans-serif';
       ctx.fillText(service.titulo.toUpperCase(), 800, 150);

       ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
       ctx.font = '300 38px Montserrat, sans-serif';
       const lines = service.desc.split('\n');
       lines.forEach((line: string, i: number) => ctx.fillText(line, 800, 320 + (i * 65)));

       ctx.fillStyle = '#00ffff';
       ctx.font = '800 32px Montserrat, sans-serif';
       ctx.fillText(`— ${service.stats} —`, 800, 520);
      
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
       if (!meshRef.current || !wheelDataRef.current) return;
       const isActive = wheelDataRef.current.activeIndex === index;
       const mat = meshRef.current.material as THREE.MeshBasicMaterial;
       // Suavizado de visibilidad
       mat.opacity = THREE.MathUtils.lerp(mat.opacity, isActive ? 1 : 0, 0.1);
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
   const coreRef = useRef<THREE.Group>(null);

   const RADIUS = 18; 
   const BANNER_SIZE: [number, number] = [32, 12]; // Súper Wide

   const SERVICIOS_INFO = useMemo(() => [
       { titulo: language === 'es' ? "Producción Audiovisual" : "Audiovisual Production", desc: "Cinematografía de alto impacto con narrativa inmersiva.\nResolución 8K RAW y despliegue de drones tácticos.", stats: "PREMIUM STUDIO" },
       { titulo: language === 'es' ? "Marketing de Precisión" : "Precision Marketing", desc: "Estrategias de adquisición basadas en comportamiento.\nOptimización predictiva y análisis masivo de datos.", stats: "DATA DRIVEN" },
       { titulo: language === 'es' ? "IA y Automatización" : "AI & Automation", desc: "Integración de agentes autónomos y redes neuronales.\nSistemas cognitivos para escalabilidad empresarial.", stats: "NEURAL CORE" },
       { titulo: language === 'es' ? "Branding y PR" : "Branding & PR", desc: "Ingeniería de percepción visual y autoridad de marca.\nPosicionamiento en mercados globales de alto valor.", stats: "TOP AUTHORITY" },
       { titulo: language === 'es' ? "Físico y Eventos" : "Physical & Events", desc: "Diseño de espacios efímeros y experiencias sensoriales.\nShowrooms tecnológicos y activaciones de lujo.", stats: "IMMERSIVE" }
   ], [language]);

   useFrame(() => {
       if (coreRef.current && wheelDataRef.current) {
           // Sincronización fluida con el valor de la rueda
           coreRef.current.rotation.y = THREE.MathUtils.lerp(
               coreRef.current.rotation.y, 
               wheelDataRef.current.rotation, 
               0.1
           );
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
