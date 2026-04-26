'use client';
import React, { useRef } from 'react';
import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    <group>
      <ambientLight intensity={2} />
      <pointLight position={[0, 10, 20]} intensity={2} />

      <group position={[0, 0, 0]}>
        <group position={[0, 4, 0]}>
          <ServiceWheelContent wheelDataRef={wheelDataRef} />
        </group>
        <group position={[0, -6, 0]}>
          <ServiceCylinder wheelDataRef={wheelDataRef} />
        </group>
      </group>
    </group>
  );
}
