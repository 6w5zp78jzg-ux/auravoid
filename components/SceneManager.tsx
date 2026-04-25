'use client';
import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

// --- EL PILOTO DE LA CÁMARA ---
function CameraRig() {
  const scroll = useScroll();
  const { viewport } = useThree();

  useFrame((state) => {
    // Al hacer scroll, la cámara desciende desde 0 hasta el piso de abajo
    const targetY = -(scroll.offset * viewport.height * 1.5);
    // Añadimos lerp (suavizado) para que el movimiento sea lujoso y fluido
    state.camera.position.y = targetY;
  });

  return null;
}

export default function SceneManager() {
  const { viewport } = useThree();

  return (
    <group>
      {/* 1. Nuestro piloto que mueve la cámara hacia abajo */}
      <CameraRig />

      {/* 2. CILINDRO SUPERIOR (Fijo en el techo del universo) */}
      <group position={[0, 0, 0]}>
        <ServiceCylinder />
      </group>

      {/* 3. RUEDA PENTAGONAL (Fija en el sótano del universo) */}
      <group position={[0, -viewport.height * 1.5, 0]}>
        <ServiceWheelContent />
      </group>
    </group>
  );
}
