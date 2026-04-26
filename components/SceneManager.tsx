'use client';
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const { viewport } = useThree();
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    <group position={[0, -viewport.height * 1.5, 0]}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} />

      {/* 🎡 LA RUEDA (MAESTRO - NIVEL SUPERIOR) */}
      <group position={[0, 5, 0]}> 
        <ServiceWheelContent wheelDataRef={wheelDataRef} />
      </group>

      {/* 🧪 EL CILINDRO (DETALLE - NIVEL INFERIOR) */}
      {/* Lo bajamos en Y para que parezca una extensión de la rueda */}
      <group position={[0, -5, 0]}> 
        <ServiceCylinder wheelDataRef={wheelDataRef} />
      </group>

      {/* EFECTO DE CONEXIÓN: Un haz de luz central que une ambos */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 20, 8]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
