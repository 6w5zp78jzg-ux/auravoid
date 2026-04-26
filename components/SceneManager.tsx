'use client';
import React, { useRef, Suspense } from 'react';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    <Suspense fallback={null}>
        {/* 1. LUZ AMBIENTAL MUY FUERTE (Para ver todo sin sombras) */}
        <ambientLight intensity={2} />
        <pointLight position={[0, 0, 10]} intensity={2} />

        <group position={[0, 0, 0]}>
          
          {/* 🎡 LA RUEDA: Forzamos que ignore su posición interna y esté en el centro */}
          <group position={[0, 1, 0]} scale={0.8}>
            <ServiceWheelContent wheelDataRef={wheelDataRef} />
          </group>

          {/* 🧪 EL CILINDRO: Justo debajo, pegado a la rueda */}
          <group position={[0, -5, 0]} scale={0.8}>
            <ServiceCylinder wheelDataRef={wheelDataRef} />
          </group>

          {/* 🔍 OBJETO DE PRUEBA: Si no ves esto, el problema es la cámara */}
          <mesh position={[0, 0, -5]}>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="yellow" />
          </mesh>

        </group>
    </Suspense>
  );
}
