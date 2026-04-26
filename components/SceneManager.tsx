'use client';
import React, { useRef, Suspense } from 'react';
import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    <group>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} intensity={2} />

      <group position={[0, 0, 0]}>
        {/* RUEDA ARRIBA */}
        <group position={[0, 4, 0]}>
          <ServiceWheelContent wheelDataRef={wheelDataRef} />
        </group>

        {/* CILINDRO ABAJO */}
        <group position={[0, -5, 0]}>
          <ServiceCylinder wheelDataRef={wheelDataRef} />
        </group>
      </group>
    </group>
  );
}
