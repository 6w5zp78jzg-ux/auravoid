'use client';
import React, { useRef, Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={1.2} />
      <pointLight position={[0, 5, 20]} intensity={2.5} color="#00ffff" />
      <pointLight position={[0, -5, 20]} intensity={1.5} color="#ffffff" />

      <group position={[0, 0, 0]}>
        {/* 🎡 RUEDA SUPERIOR (Selector) - Más estilizada */}
        <group position={[0, 5.5, 0]} scale={0.7}>
          <ServiceWheelContent wheelDataRef={wheelDataRef} />
        </group>

        {/* 🧪 CILINDRO INFERIOR (Información) - Bajado para dar aire */}
        <group position={[0, -6, 0]} scale={0.7}>
          <ServiceCylinder wheelDataRef={wheelDataRef} />
        </group>

        {/* EJE DE CONEXIÓN ULTRA FINO */}
        <mesh position={[0, 0, -2]}>
          <cylinderGeometry args={[0.01, 0.01, 35, 8]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.15} />
        </mesh>
      </group>
    </Suspense>
  );
}
