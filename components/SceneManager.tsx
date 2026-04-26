'use client';
import React, { useRef, Suspense } from 'react';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  // El Ref es vital para que no crashee
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    <group>
      {/* Luz básica que no puede fallar */}
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} intensity={2} />

      {/* FORZAMOS TODO AL CENTRO [0,0,0] 
          Si no los ves aquí, es que no se están renderizando 
      */}
      <group position={[0, 0, 0]}>
        
        {/* Rueda arriba (Posición fija segura) */}
        <group position={[0, 3, 0]}>
          <ServiceWheelContent wheelDataRef={wheelDataRef} />
        </group>

        {/* Cilindro abajo (Posición fija segura) */}
        <group position={[0, -5, 0]}>
          <ServiceCylinder wheelDataRef={wheelDataRef} />
        </group>

      </group>
    </group>
  );
}
