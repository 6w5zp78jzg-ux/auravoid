'use client';
import React, { useRef, Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const { viewport } = useThree();
  // El cerebro compartido para la rotación síncrona
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    <Suspense fallback={null}>
      {/* Iluminación Táctica */}
      <ambientLight intensity={1.2} />
      <pointLight position={[0, 5, 15]} intensity={2} color="#00ffff" />
      <pointLight position={[0, -5, 15]} intensity={2} color="#ffffff" />

      {/* 🛠️ ESTRUCTURA UNIFICADA AURA VOID */}
      <group position={[0, 0, 0]}>
        
        {/* NIVEL SUPERIOR: LA RUEDA (Selector) */}
        <group position={[0, 4.5, 0]} scale={0.75}>
          <ServiceWheelContent wheelDataRef={wheelDataRef} />
        </group>

        {/* NIVEL INFERIOR: EL CILINDRO (Información) */}
        {/* Lo hemos subido un poco para que no haya tanto hueco vacío */}
        <group position={[0, -5, 0]} scale={0.75}>
          <ServiceCylinder wheelDataRef={wheelDataRef} />
        </group>

        {/* NÚCLEO CENTRAL: Eje de conexión visual */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 22, 12]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
        </mesh>
      </group>
    </Suspense>
  );
}
