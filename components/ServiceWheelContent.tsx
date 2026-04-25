'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Edges } from '@react-three/drei';
import * as THREE from 'three';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

const WIDGETS = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' }, // Rosa Neón
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' }, // Azul Real
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' }, // Verde Esmeralda
  { id: 'br', Component: BrandingWidget, color: '#ffff00' }, // Amarillo
  { id: 'ev', Component: EventsWidget, color: '#9932cc' } // Púrpura
];

export default function ServiceWheelContent() {
  const groupRef = useRef<THREE.Group>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
      setActiveIndex(0);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const isDragging = useRef(false);
  const previousX = useRef(0);
  const velocity = useRef(0);
  const targetRotation = useRef(0);

  const handlePointerDown = (e: any) => {
    isDragging.current = true;
    previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging.current || !pageLoaded) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = currentX - previousX.current;
    velocity.current = deltaX * 0.005;
    targetRotation.current += velocity.current;
    previousX.current = currentX;
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const faceAngle = (Math.PI * 2) / 5;
    const closestFace = Math.round(targetRotation.current / faceAngle);
    targetRotation.current = closestFace * faceAngle;
    let index = (-closestFace) % 5;
    if (index < 0) index += 5; 
    if (index !== activeIndex) setActiveIndex(index);
  };

  useFrame(() => {
    if (!groupRef.current) return;
    if (!isDragging.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current, 0.1);
    } else {
      groupRef.current.rotation.y = targetRotation.current;
    }
  });

  // GEOMETRÍAS "HERO" (Más gruesas y masivas)
  const frameGeo = useMemo(() => new THREE.BoxGeometry(9.6, 6.6, 0.5), []);
  const glassGeo = useMemo(() => new THREE.PlaneGeometry(9, 6), []);

  return (
    <group>
      {/* 💡 LUCES AUTÓNOMAS: La rueda trae su propia iluminación escénica */}
      {/* Luz Frontal: Ilumina el panel que el usuario está mirando */}
      <spotLight position={[0, 5, 15]} angle={0.6} penumbra={0.5} intensity={5} color="#ffffff" distance={40} />
      {/* Luz del Núcleo: Brilla desde el centro del pentágono hacia afuera */}
      <pointLight position={[0, 0, 0]} intensity={3} color="#4B0082" distance={15} decay={2} />

      {/* EL GRUPO ROTATORIO */}
      <group
        ref={groupRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {WIDGETS.map((widget, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const radius = 6.2; // Radio ampliado para mayor impacto
          const isFront = pageLoaded && i === activeIndex;

          return (
            <group key={widget.id} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]}>
              
              {/* WIDGET HÍBRIDO (Se enciende al estar de frente) */}
              <widget.Component isActive={isFront} />

              {/* 1. MARCO MONOLÍTICO DE OBSIDIANA */}
              <mesh geometry={frameGeo} position={[0, 0, -0.21]}>
                <meshStandardMaterial color="#020202" metalness={0.8} roughness={0.3} />
                {/* Bordes de neón del color de la categoría */}
                <Edges scale={1} threshold={15} color={widget.color} transparent opacity={isFront ? 1 : 0.3} />
              </mesh>

              {/* 2. PANTALLA INACTIVA (Negro absoluto y pulido) */}
              <mesh geometry={glassGeo} position={[0, 0, -0.2]}>
                <meshStandardMaterial
                  color="#000000"
                  metalness={0.9}
                  roughness={0.1}
                  transparent
                  // Cuando se activa (isFront), la pantalla oscura desaparece para mostrar tu widget HTML
                  opacity={isFront ? 0.0 : 0.95} 
                />
              </mesh>

              {/* Partículas flotando dentro del marco inactivo */}
              {!isFront && (
                  <Sparkles count={25} scale={[8, 5, 1]} size={4} speed={0.4} opacity={0.5} color={widget.color} />
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
}
