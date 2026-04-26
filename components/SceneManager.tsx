'use client';
import React, { useRef, Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const { viewport } = useThree();
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    <Suspense fallback={null}>
      {/* 1. LUZ TOTAL: Si esto no los ilumina, nada lo hará */}
      <ambientLight intensity={2} />
      <pointLight position={[0, 0, 15]} intensity={3} />

      {/* 2. POSICIONAMIENTO EN EL CENTRO (Y=0) */}
      <group position={[0, 0, 0]}>
        
        {/* LA RUEDA: Un poco arriba del centro */}
        <group position={[0, 3, 0]} scale={0.7}>
          <ServiceWheelContent wheelDataRef={wheelDataRef} />
        </group>

        {/* EL CILINDRO: Un poco abajo del centro */}
        <group position={[0, -4, 0]} scale={0.7}>
          <ServiceCylinder wheelDataRef={wheelDataRef} />
        </group>

      </group>
    </Suspense>
  );
}
