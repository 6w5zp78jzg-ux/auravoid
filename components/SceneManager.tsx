'use client';
import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

// --- CONTROLADOR DE CÁMARA ---
function CameraRig() {
  const scroll = useScroll();
  const { viewport } = useThree();

  useFrame((state) => {
    // scroll.offset va de 0 (arriba del todo) a 1 (abajo del todo de la página)
    // Calculamos cuánto debe bajar la cámara en total.
    // Usamos viewport.height * 1.5 para asegurarnos de que baja exactamente hasta la Rueda
    const targetY = -(scroll.offset * (viewport.height * 1.5));
    
    // Mantenemos la X (0) y la Z (45) que definiste en tu page.tsx, y solo alteramos la Y
    state.camera.position.y = targetY;
  });

  return null;
}

export default function SceneManager() {
  const { viewport } = useThree();

  return (
    <group>
      {/* Nuestro piloto automático que lee el scroll y mueve la cámara */}
      <CameraRig />
      
      {/* SECCIÓN 1: EL CILINDRO INICIAL */}
      {/* Está anclado fijamente en el centro del universo (Y = 0) */}
      <group position={[0, 0, 0]}>
        <ServiceCylinder />
      </group>

      {/* SECCIÓN 2: LA RUEDA PENTAGONAL */}
      {/* Está anclada fijamente más abajo en el espacio 3D */}
      <group position={[0, -viewport.height * 1.5, 0]}>
        <ServiceWheelContent />
      </group>
    </group>
  );
}
