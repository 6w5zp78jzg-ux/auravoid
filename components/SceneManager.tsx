'use client';
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

// --- CONTROLADOR DE CÁMARA CINEMATOGRÁFICA ---
function CameraRig() {
  const scroll = useScroll();
  const { viewport } = useThree();

  useFrame((state) => {
    // scroll.offset va de 0 (arriba) a 1 (abajo de la página).
    // Usamos viewport.height * 1.5 para bajar exactamente hasta la Rueda Pentagonal.
    const targetY = -(scroll.offset * (viewport.height * 1.5));
    
    // Mantenemos la X (0) y la Z (30) fijas para un efecto scrollytelling puro.
    state.camera.position.y = targetY;
  });

  return null;
}

export default function SceneManager() {
  const { viewport } = useThree();

  return (
    <group>
      {/* 💡 --- SISTEMA DE ILUMINACIÓN NATIVA (Para ver el pentágono) --- 💡 */}
      <ambientLight intensity={0.4} />
      {/* Luz focal fuerte sobre la zona de la Rueda Pentagonal */}
      <pointLight position={[0, -viewport.height * 1.5, 30]} intensity={1.5} color="#4c1d95" distance={60} decay={2} />
      
      {/* Nuestro Rig de Cámara que lee el scroll y pilota el viaje visual */}
      <CameraRig />

      {/* SECCIÓN 1: EL CILINDRO INICIAL */}
      {/* Está anclado en Y=0 (centro de la pantalla superior) */}
      <group position={[0, 0, 0]}>
        <ServiceCylinder />
      </group>

      {/* SECCIÓN 2: LA RUEDA PENTAGONAL "HERO" */}
      {/* Está anclada más abajo en el espacio 3D (Y = -viewport.height * 1.5) */}
      {/* Cuando el Rig de Cámara baje, se encontrará de frente con ella. */}
      <group position={[0, -viewport.height * 1.5, 0]}>
        <ServiceWheelContent />
      </group>
    </group>
  );
}
