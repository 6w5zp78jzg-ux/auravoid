'use client';
import React, { useRef, Suspense } from 'react';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  // 🧠 EL CEREBRO DE DATOS
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    // 🛡️ EL ESCUDO: Si cualquier archivo hijo (textura, gltf) falla, 
    // veremos un cubo rojo brillante gigante en lugar de borrar la pantalla.
    <Suspense fallback={
        <mesh>
            <boxGeometry args={[4, 4, 4]} />
            <meshBasicMaterial color="red" wireframe />
        </mesh>
    }>
        <group>
          {/* LUZ FUERTE PARA ASEGURARNOS DE QUE SE VE ALGO */}
          <ambientLight intensity={1} />
          <pointLight position={[0, 0, 20]} intensity={3} color="#ffffff" />
          
          {/* 🚀 EL REACTOR EN EL CENTRO ABSOLUTO (Sin offsets de Y) */}
          <group position={[0, 0, 0]}>
            
            {/* EL CILINDRO (Justo en el centro, un poquito hacia atrás) */}
            <group position={[0, 0, -2]}> 
              <ServiceCylinder wheelDataRef={wheelDataRef} />
            </group>

            {/* LA RUEDA (Justo en el centro) */}
            <group position={[0, 0, 0]}>
              <ServiceWheelContent wheelDataRef={wheelDataRef} />
            </group>

          </group>
        </group>
    </Suspense>
  );
}
