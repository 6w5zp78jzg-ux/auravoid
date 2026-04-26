'use client';
import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Edges, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
// Asumiendo que tus widgets están exportados y disponibles
import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

// --- DATA UNIFICADA ---
const SERVICES_DATA = [
  { id: 'av', title: 'PRODUCCIÓN AUDIOVISUAL', Component: AudiovisualWidget, color: '#ff1493' },
  { id: 'mk', title: 'MARKETING DE PRECISIÓN', Component: MarketingWidget, color: '#4169e1' },
  { id: 'ai', title: 'IA Y AUTOMATIZACIONES', Component: IARobotTracker, color: '#00fa9a' },
  { id: 'br', title: 'BRANDING Y PR', Component: BrandingWidget, color: '#ffff00' },
  { id: 'ev', title: 'FÍSICO Y EVENTOS', Component: EventsWidget, color: '#9932cc' }
];

// --- SUBCOMPONENTE: PANEL DE CRISTAL VANGUARDISTA ---
function GlassBanner({ title, isActive }: { title: string, isActive: boolean }) {
  // Animación de opacidad y escala basada en si está activo
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!materialRef.current || !groupRef.current) return;
    const targetOpacity = isActive ? 1 : 0.15;
    const targetScale = isActive ? 1 : 0.85;
    
    // Interpolación suave (Lerp) para transiciones premium
    materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, delta * 5);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 5));
  });

  return (
    <group ref={groupRef} position={[0, 9, 0]}> {/* Posicionado arriba del chasis */}
      {/* Cristal Físico Avanzado */}
      <mesh>
        <planeGeometry args={[12, 4]} />
        <meshPhysicalMaterial 
          ref={materialRef}
          transmission={1} 
          roughness={0.2} 
          thickness={0.5} 
          ior={1.5} 
          transparent
          color="#ffffff"
        />
        {isActive && <Edges color="#ffffff" threshold={15} opacity={0.8} transparent />}
      </mesh>
      
      {/* Texto Flotante */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.8}
        color="#ffffff"
        font="/fonts/Montserrat-Medium.ttf" // Asegúrate de tener esta fuente en public/fonts
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {title}
      </Text>
    </group>
  );
}

// --- COMPONENTE PRINCIPAL UNIFICADO ---
export default function UnifiedServiceSystem() {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const radius = isMobile ? 8 : 11.35; // Responsive extremo
  const faceAngle = (Math.PI * 2) / SERVICES_DATA.length;

  const systemRef = useRef<THREE.Group>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Físicas Maestras
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const rotationRef = useRef(0);
  const velocity = useRef(0);

  // --- CONTROLADOR DE EVENTOS UNIFICADO ---
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if(e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
    isDragging.current = true;
    previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    velocity.current = 0;
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging.current) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = currentX - previousX.current;
    velocity.current = deltaX * (isMobile ? 0.008 : 0.005);
    rotationRef.current += velocity.current;
    previousX.current = currentX;
  };

  const handlePointerUp = (e: any) => {
    isDragging.current = false;
    if(e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
  };

  useFrame(() => {
    if (!systemRef.current) return;
    
    // Inercia y anclaje (Snap)
    if (!isDragging.current) {
      velocity.current *= 0.95; // Fricción
      rotationRef.current += velocity.current;
      
      // Anclaje magnético al widget más cercano
      const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
      rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, 0.08);

      // Calcular índice activo actual
      let index = Math.round(-rotationRef.current / faceAngle) % SERVICES_DATA.length;
      if (index < 0) index += SERVICES_DATA.length;
      if (index !== activeIndex) setActiveIndex(index);
    }
    
    // Aplicar rotación maestra a todo el sistema
    systemRef.current.rotation.y = rotationRef.current;
  });

  return (
    <group position={[0, isMobile ? 4 : 6.5, 0]}>
      {/* Ambiente inmersivo */}
      <Sparkles count={200} scale={[radius * 2.5, 20, radius * 2.5]} size={2} speed={0.3} opacity={0.4} color="#ffffff" />

      {/* HITBOX MAESTRO: Captura eventos en toda el área sin interferir visualmente */}
      <mesh 
        visible={false} 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <cylinderGeometry args={[radius + 2, radius + 2, 25, 32]} />
      </mesh>

      {/* SISTEMA ROTATORIO CENTRAL */}
      <group ref={systemRef}>
        {SERVICES_DATA.map((service, i) => {
          const angle = (i / SERVICES_DATA.length) * Math.PI * 2;
          const isFront = i === activeIndex;

          return (
            <group 
              key={service.id} 
              position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} 
              rotation={[0, angle, 0]}
            >
              {/* 1. EL CILINDRO/BANNER INFORMATIVO (Adherido y sincronizado) */}
              <GlassBanner title={service.title} isActive={isFront} />

              {/* 2. LA RUEDA: ESTRUCTURA FÍSICA (Chasis) */}
              <mesh position={[0, -2, 0]}>
                <boxGeometry args={[16.5, 9.5, 0.4]} />
                <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.1} />
                <Edges color={service.color} threshold={15} transparent opacity={isFront ? 1 : 0.2} />
              </mesh>

              {/* 3. EL WIDGET INTERNO */}
              <group position={[0, -2, 0.3]}>
                <service.Component isActive={isFront} />
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
}
