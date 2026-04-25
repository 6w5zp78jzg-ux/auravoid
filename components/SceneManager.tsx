'use client';
import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

function CameraRig() {
  const scroll = useScroll();
  const { viewport } = useThree();

  useFrame((state) => {
    // La cámara baja exactamente una pantalla y media para encontrarse con la rueda
    state.camera.position.y = -(scroll.offset * viewport.height * 1.5);
  });
  return null;
}

export default function SceneManager() {
  const { viewport } = useThree();

  return (
    <group>
      {/* 1. EL CONTROLADOR DE CÁMARA */}
      <CameraRig />

      {/* 2. EL CILINDRO (Fijo en la posición 0 superior) */}
      <group position={[0, 0, 0]}>
        <ServiceCylinder />
      </group>

      {/* 3. LA RUEDA (Fija en la posición inferior) */}
      <group position={[0, -viewport.height * 1.5, 0]}>
        <ServiceWheelContent />
      </group>
    </group>
  );
}
