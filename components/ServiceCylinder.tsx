'use client';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from './Providers';

// --- SUBCOMPONENTE: CRISTAL DE INFORMACIÓN ---
function InfoBanner({ service, index, total, radius, size, isActive }: {
   service: { titulo: string, desc: string, stats: string },
   index: number,
   total: number,
   radius: number,
   size: [number, number],
   isActive: boolean
}) {
   const meshRef = useRef<THREE.Mesh>(null);

   // Generación de la textura del banner (Cristal + Info Detallada)
   const texture = useMemo(() => {
       const c = document.createElement('canvas');
       const ctx = c.getContext('2d');
       if (!ctx) return null;
       c.width = 1024; c.height = 512; // Más alto para caber la descripción
      
       const margin = 20;
       const pWidth = 1024 - (margin * 2);
       const pHeight = 512 - (margin * 2);
      
       // 1. FONDO DE CRISTAL (Tu diseño original)
       const rainbowGrad = ctx.createLinearGradient(margin, margin, 1024 - margin, 512 - margin);
       rainbowGrad.addColorStop(0, 'rgba(255, 0, 0, 0.08)');   
       rainbowGrad.addColorStop(0.2, 'rgba(255, 255, 0, 0.08)');
       rainbowGrad.addColorStop(0.4, 'rgba(0, 255, 0, 0.08)');  
       rainbowGrad.addColorStop(0.6, 'rgba(0, 255, 255, 0.08)');
       rainbowGrad.addColorStop(0.8, 'rgba(0, 0, 255, 0.08)');  
       rainbowGrad.addColorStop(1, 'rgba(255, 0, 255, 0.08)');  
      
       ctx.fillStyle = 'rgba(10, 10, 15, 0.5)'; // Un poco más oscuro para leer mejor
       ctx.fillRect(margin, margin, pWidth, pHeight);
      
       ctx.fillStyle = rainbowGrad;
       ctx.fillRect(margin, margin, pWidth, pHeight);
      
       const shine = ctx.createLinearGradient(margin, margin, margin, 512 - margin);
       shine.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
       shine.addColorStop(0.5, 'transparent');
       shine.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
       ctx.fillStyle = shine;
       ctx.fillRect(margin, margin, pWidth, pHeight);

       // 2. BORDE TÁCTICO
       ctx.shadowColor = 'rgba(0, 255, 255, 0.5)';
       ctx.shadowBlur = 15;                         
       ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
       ctx.lineWidth = 2;                           
       ctx.strokeRect(margin, margin, pWidth, pHeight);
       ctx.shadowBlur = 0;

       // 3. TEXTOS MAESTRO-DETALLE
       ctx.textAlign = 'center';
       
       // Título
       ctx.fillStyle = '#ffffff';
       ctx.font = '800 45px "Montserrat", sans-serif';
       ctx.fillText(service.titulo, 512, 120);

       // Línea separadora
       ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
       ctx.fillRect(312, 160, 400, 2);

       // Descripción (multilínea)
       ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
       ctx.font = '400 32px "Montserrat", sans-serif';
       const lines = service.desc.split('\n');
       lines.forEach((line, i) => {
           ctx.fillText(line, 512, 240 + (i * 45));
       });

       // Estadística destacada
       ctx.fillStyle = '#00ffff';
       ctx.font = '700 45px "Montserrat", sans-serif';
       ctx.fillText(service.stats, 512, 420);
      
       return new THREE.CanvasTexture(c);
   }, [service]);

   // Posicionamiento en Anillo (Dentro de la rueda)
   useEffect(() => {
       if (!meshRef.current) return;
       const angle = (index / total) * Math.PI * 2;
       meshRef.current.position.x = Math.sin(angle) * radius;
       meshRef.current.position.z = Math.cos(angle) * radius;
       meshRef.current.position.y = 0; // Lo mantenemos plano para que encaje en el centro
       
       // Orientar el panel hacia afuera
       meshRef.current.lookAt(0, 0, 0);
       meshRef.current.rotateY(Math.PI);
   }, [index, total, radius]);

   // Destacar el panel activo
   useFrame(() => {
       if (!meshRef.current) return;
       const mat = meshRef.current.material as THREE.MeshBasicMaterial;
       // Si es el activo, es 100% visible. Si no, se difumina a 0.15
       const targetOpacity = isActive ? 1 : 0.15;
       mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);
   });

   return (
       <mesh ref={meshRef}>
           <planeGeometry args={size} />
           <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
       </mesh>
   );
}

// --- COMPONENTE PRINCIPAL (Receptor de datos) ---
// Recibe wheelRotation (ángulo actual de la rueda) y activeIndex (índice del servicio seleccionado)
export default function InformationCore({ wheelRotation, activeIndex }: { wheelRotation: number, activeIndex: number }) {
   const { language } = useLanguage();
   const { size } = useThree();
   const isMobile = size.width < 768;
   
   // Factor de escala: lo hacemos MÁS PEQUEÑO que tu rueda principal para que quepa dentro
   const scaleFactor = isMobile ? 0.4 : 0.7; 

   const RADIUS = 4.5 * scaleFactor; // Radio interior
   const BANNER_SIZE: [number, number] = [8 * scaleFactor, 4 * scaleFactor]; 
  
   // Datos Extendidos
   const SERVICIOS_INFO = useMemo(() => [
       { 
           titulo: language === 'es' ? "PRODUCCIÓN AUDIOVISUAL" : "AUDIOVISUAL PRODUCTION",
           desc: language === 'es' ? "Cinematografía de alto impacto.\nResolución 8K RAW y Drones FPV." : "High-impact cinematography.\n8K RAW resolution and FPV Drones.",
           stats: "CINEMA STANDARD"
       },
       { 
           titulo: language === 'es' ? "MARKETING DE PRECISIÓN" : "PRECISION MARKETING",
           desc: language === 'es' ? "Adquisición de usuarios táctica.\nOptimización predictiva Data Driven." : "Tactical user acquisition.\nPredictive optimization Data Driven.",
           stats: "MAX ROI"
       },
       { 
           titulo: language === 'es' ? "IA Y AUTOMATIZACIONES" : "AI & AUTOMATIONS",
           desc: language === 'es' ? "Agentes autónomos y LLMs.\nSistemas cognitivos para empresas." : "Autonomous agents and LLMs.\nCognitive systems for enterprise.",
           stats: "NEURAL CORE"
       },
       { 
           titulo: language === 'es' ? "BRANDING Y PR" : "BRANDING & PR",
           desc: language === 'es' ? "Ingeniería de percepción visual.\nPosicionamiento de marca global." : "Visual perception engineering.\nGlobal brand positioning.",
           stats: "TOP TIER"
       },
       { 
           titulo: language === 'es' ? "FÍSICO Y EVENTOS" : "PHYSICAL & EVENTS",
           desc: language === 'es' ? "Espacios efímeros y showrooms.\nExperiencias inmersivas de lujo." : "Ephemeral spaces & showrooms.\nLuxury immersive experiences.",
           stats: "IMMERSIVE"
       }
   ], [language]);

   const coreRef = useRef<THREE.Group>(null);

   // SINCRONIZACIÓN SUAVE CON LA RUEDA EXTERNA
   useFrame(() => {
       if (!coreRef.current) return;
       // El núcleo sigue la rotación de la rueda, pero le aplicamos lerp 
       // para que tenga un ligero "retraso elástico" orgánico
       coreRef.current.rotation.y = THREE.MathUtils.lerp(
           coreRef.current.rotation.y, 
           wheelRotation, 
           0.1
       );
   });

   return (
       // Z = -1 para meterlo un poco hacia el fondo de la pantalla y dar profundidad
       <group position={[0, 0, -1]}> 
           <Sparkles 
               count={100} 
               scale={[RADIUS * 2, 8, RADIUS * 2]} 
               size={2 * scaleFactor} 
               speed={0.1} 
               opacity={0.5} 
               color="#00ffff" 
           />

           <group ref={coreRef}>
               {SERVICIOS_INFO.map((s, i) => (
                   <InfoBanner
                       key={`${s.titulo}-${i}`}
                       service={s}
                       index={i}
                       total={SERVICIOS_INFO.length}
                       radius={RADIUS}
                       size={BANNER_SIZE}
                       isActive={activeIndex === i}
                   />
               ))}
           </group>
       </group>
   );
}
