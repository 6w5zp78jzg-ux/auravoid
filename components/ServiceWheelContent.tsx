'use client';
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

const WIDGETS = [
  { id: 'av', Component: AudiovisualWidget },
  { id: 'mk', Component: MarketingWidget },
  { id: 'ai', Component: IARobotTracker },
  { id: 'br', Component: BrandingWidget },
  { id: 'ev', Component: EventsWidget }
];

export default function ServiceWheelContent() {
  const groupRef = useRef<THREE.Group>(null);
  
  // ESTADO: ¿Qué cara está al frente? (Empezamos en la 0)
  const [activeIndex, setActiveIndex] = useState(0);

  // --- FÍSICA DE ARRASTRE Y SNAP ---
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
    if (!isDragging.current) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || (e.nativeEvent && e.nativeEvent.clientX) || 0;
    const deltaX = currentX - previousX.current;

    velocity.current = deltaX * 0.005;
    targetRotation.current += velocity.current;
    previousX.current = currentX;
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Calculamos a qué cara debe "pegarse"
    const faceAngle = (Math.PI * 2) / 5;
    const closestFace = Math.round(targetRotation.current / faceAngle);
    targetRotation.current = closestFace * faceAngle;

    // MATEMÁTICA PURA: Saber qué panel ha quedado mirando a cámara (de 0 a 4)
    let index = (-closestFace) % 5;
    if (index < 0) index += 5; // Evitar índices negativos
    
    // Le decimos a React que despierte a este widget específico
    setActiveIndex(index);
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isDragging.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current, 0.1);
    } else {
      groupRef.current.rotation.y = targetRotation.current;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {WIDGETS.map((widget, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 5.5;

        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        // MAGIA DE RENDIMIENTO: Solo es true si es la cara activa
        const isFront = i === activeIndex;

        return (
          <group
            key={widget.id}
            position={[x, 0, z]}
            rotation={[0, angle, 0]}
          >
            {/* Si no está al frente, devuelve null y libera memoria. Cuando llega al frente, ¡BOOM!, se enciende. */}
            <widget.Component isActive={isFront} />

            {/* CRISTAL TRASERO: Este es el panel en reposo que verás en las caras inactivas */}
            <mesh position={[0, 0, -0.2]}>
              <planeGeometry args={[9, 6]} />
              <meshStandardMaterial
                color="#050505"
                transparent
                opacity={0.8}
                roughness={0.9}
                side={THREE.DoubleSide}
              />
              <lineSegments>
                <edgesGeometry args={[new THREE.PlaneGeometry(9, 6)]} />
                <lineBasicMaterial color="#ffffff" transparent opacity={0.05} />
              </lineSegments>
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
