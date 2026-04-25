'use client';
import React, { useRef } from 'react';
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

  // --- FÍSICA DE ARRASTRE Y SNAP ---
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const velocity = useRef(0);
  const targetRotation = useRef(0);

  // 1. Dedo toca la pantalla
  const handlePointerDown = (e: any) => {
    isDragging.current = true;
    // Capturamos la X sea con ratón o táctil
    previousX.current = e.clientX || (e.touches && e.touches[0].clientX) || (e.nativeEvent && e.nativeEvent.clientX) || 0;
    velocity.current = 0;
  };

  // 2. Dedo arrastra
  const handlePointerMove = (e: any) => {
    if (!isDragging.current) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || (e.nativeEvent && e.nativeEvent.clientX) || 0;
    const deltaX = currentX - previousX.current;

    // Sensibilidad del giro
    velocity.current = deltaX * 0.005;
    targetRotation.current += velocity.current;
    previousX.current = currentX;
  };

  // 3. Dedo se levanta (El "Snap" Magnético)
  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Calculamos a qué cara debe "pegarse". Un pentágono tiene 5 caras = 72º (Math.PI * 2 / 5)
    const faceAngle = (Math.PI * 2) / 5;
    const closestFace = Math.round(targetRotation.current / faceAngle);
    
    // Fijamos la rotación objetivo exactamente en esa cara
    targetRotation.current = closestFace * faceAngle;
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isDragging.current) {
      // Cuando soltamos, viaja suavemente hacia la cara "pegada"
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current, 0.1);
    } else {
      // Mientras arrastramos, sigue al dedo al instante
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
        
        // 🚀 RADIO AJUSTADO: Pasamos de 25 a 5.5 para compactarlos en un pilar sólido
        const radius = 5.5;

        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <group
            key={widget.id}
            position={[x, 0, z]}
            rotation={[0, angle, 0]}
          >
            {/* El Widget híbrido que diseñaste */}
            <widget.Component isActive={true} />

            {/* CRISTAL TRASERO: Da solidez estructural para que no parezcan flotando en la nada */}
            <mesh position={[0, 0, -0.2]}>
              <planeGeometry args={[9, 6]} />
              <meshStandardMaterial
                color="#050505"
                transparent
                opacity={0.8}
                roughness={0.9}
                side={THREE.DoubleSide}
              />
              {/* Borde sutil para delimitar la cara física */}
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
