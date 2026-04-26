'use client';
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

function CameraRig() {
  const scroll = useScroll();
  const { viewport } = useThree();

  useFrame((state) => {
    const targetY = -(scroll.offset * (viewport.height * 1.5));
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.1);
  });

  return null;
}

export default function SceneManager() {
  const { viewport } = useThree();

  // 🧠 EL NUEVO CEREBRO (Súper rápido y no crashea nunca)
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    <group>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, -viewport.height * 1.5, 20]} intensity={2} color="#00ffff" distance={50} />
      
      <CameraRig />

      {/* REACTOR DE SERVICIOS */}
      <group position={[0, -viewport.height * 1.5, 0]}>
        
        {/* EL CILINDRO. Lo subimos a 6.5 para que esté dentro de la rueda */}
        <group position={[0, 6.5, -2]}> 
          <ServiceCylinder wheelDataRef={wheelDataRef} />
        </group>

        {/* LA RUEDA */}
        <group position={[0, 0, 0]}>
          <ServiceWheelContent wheelDataRef={wheelDataRef} />
        </group>

      </group>
    </group>
  );
}
