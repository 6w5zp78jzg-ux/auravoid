'use client';
import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import SystemCore from './ServiceWheelContent';

function CameraRig() {
  const scroll = useScroll();
  useFrame((state) => {
    // Zoom y Enfoque
    const zoomProgress = Math.min(scroll.offset * 2, 1);
    
    // Y: 12 (Panorámica) -> 6.5 (Centro Rueda)
    // Z: 45 (Lejos) -> 26.5 (Encuadre)
    const targetY = THREE.MathUtils.lerp(12, 6.5, zoomProgress);
    const targetZ = THREE.MathUtils.lerp(45, 26.5, zoomProgress); 
    const targetRotX = THREE.MathUtils.lerp(-Math.PI / 10, 0, zoomProgress);
    
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.1);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.1);
  });
  return null;
}

export default function SceneManager() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <group>
      <ambientLight intensity={0.6} />
      <spotLight position={[0, 20, 20]} angle={0.5} penumbra={0.8} intensity={2.5} color="#8b5cf6" />
      <pointLight position={[0, -5, -15]} intensity={2} color="#4c1d95" distance={60} decay={2} />

      <CameraRig />

      <group position={[0, 0, 0]}>
        <SystemCore activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      </group>
    </group>
  );
}
