'use client';
// 1. AÑADIDO useMemo A LA IMPORTACIÓN
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Sparkles, SpotLight } from '@react-three/drei';
import * as THREE from 'three';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

const WIDGETS = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' },
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' },
  { id: 'br', Component: BrandingWidget, color: '#ffff00' },
  { id: 'ev', Component: EventsWidget, color: '#9932cc' }
];

export default function ServiceWheelContent() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Estado para la cara activa
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  // Activamos el motor táctil tras la carga (ahorro RAM)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
      setActiveIndex(0); // Activamos la primera cara tras 2s
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // --- FÍSICA DE ARRASTRE ---
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const velocity = useRef(0);
  const targetRotation = useRef(0);

  const handlePointerDown = (e: any) => {
    isDragging.current = true;
    previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || (e.nativeEvent && e.nativeEvent.clientX) || 0;
    velocity.current = 0;
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging.current || !pageLoaded) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || (e.nativeEvent && e.nativeEvent.clientX) || 0;
    const deltaX = currentX - previousX.current;

    velocity.current = deltaX * 0.005;
    targetRotation.current += velocity.current;
    previousX.current = currentX;
  };

  const handlePointerUp = () => {
    if (!isDragging.current || !pageLoaded) return;
    isDragging.current = false;

    // Calculamos el snap magnético (72 grados)
    const faceAngle = (Math.PI * 2) / 5;
    const closestFace = Math.round(targetRotation.current / faceAngle);
    targetRotation.current = closestFace * faceAngle;

    // Matemática para saber qué panel está al frente (0-4)
    let index = (-closestFace) % 5;
    if (index < 0) index += 5; 
    
    // Solo actualizamos si cambia
    if (index !== activeIndex) {
        setActiveIndex(index);
    }
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    if (!isDragging.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current, 0.12);
    } else {
      groupRef.current.rotation.y = targetRotation.current;
    }
  });

  // Geometría del marco (metal) compartida
  const frameGeometry = useMemo(() => {
    return new THREE.BoxGeometry(9.4, 6.4, 0.3); 
  }, []);

  const crystalGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(9, 6);
  }, []);

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 🔮 --- SISTEMA DE ILUMINACIÓN VOLUMÉTRICA INTERNA --- 🔮 */}
      <SpotLight
        position={[0, 0, 0]} 
        angle={Math.PI * 2} 
        penumbra={1}
        intensity={2}
        distance={20}
        color="#3200a8" 
        castShadow={false}
      />
      
      {WIDGETS.map((widget, i) => {
        const angle = (i / 5) * Math.PI * 2;
        
        // RADIO AJUSTADO: Pasamos a 5.8 para un pilar más monolítico
        const radius = 5.8;

        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        // Solo se enciende si es la cara activa
        const isFront = pageLoaded && i === activeIndex;

        return (
          <group
            key={widget.id}
            position={[x, 0, z]}
            rotation={[0, angle, 0]}
          >
            {/* El widget híbrido HTML solo si está al frente (Holograma) */}
            <widget.Component isActive={isFront} />

            {/* 💎 ESTÉTICA "HERO": ESTRUCTURA Y CRISTAL 💎 */}
            
            {/* 1. MARCO METÁLICO MONOLÍTICO NEGRO */}
            <mesh geometry={frameGeometry} position={[0, 0, -0.21]}>
              <meshStandardMaterial
                color="#050505"
                roughness={0.8}
                metalness={1}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* 2. CRISTAL REFRACTOR ÓPTICO PREMIUM */}
            {/* 2. ELIMINADAS LAS PROPIEDADES DE DISTORSIÓN QUE DABAN ERROR */}
            <mesh geometry={crystalGeometry} position={[0, 0, -0.2]}>
              <MeshTransmissionMaterial
                backside={true}
                thickness={0.8}
                chromaticAberration={0.05} 
                anisotropy={0.1}
                clearcoat={1}
                clearcoatRoughness={0.1}
                color={isFront ? "#000000" : "#111111"} 
                transparent
                opacity={isFront ? 0.35 : 0.9} 
              />
              
              {/* Borde ultra sutil de 1 píxel que brilla con la luz central */}
              <lineSegments>
                <edgesGeometry args={[crystalGeometry]} />
                <lineBasicMaterial color={widget.color} transparent opacity={isFront ? 0.2 : 0.03} />
              </lineSegments>
            </mesh>

            {/* Partículas internas que flotan solo dentro del cristal cuando está inactivo */}
            {!isFront && (
                <Sparkles 
                    count={20} 
                    scale={[8, 5, 0.5]} 
                    size={2.5} 
                    speed={0.1} 
                    opacity={0.08} 
                    color={widget.color} 
                />
            )}
          </group>
        );
      })}
    </group>
  );
}
