'use client';
import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

// 🌐 IMPORTACIÓN DEL NÚCLEO UNIFICADO (Ruta y nombre corregidos)
import SystemCore from './SystemCore';

// --- CONTROLADOR DE CÁMARA CINEMATOGRÁFICA ---
function CameraRig() {
  const scroll = useScroll();

  useFrame((state) => {
    // 🎥 Interpolación (Lerp) para un desplazamiento suave y premium
    // Scroll 0: Vista panorámica superior | Scroll 1: Enfoque frontal interactivo
    const targetY = THREE.MathUtils.lerp(12, 0, scroll.offset);
    const targetZ = THREE.MathUtils.lerp(45, 28, scroll.offset); 
    const targetRotX = THREE.MathUtils.lerp(-Math.PI / 10, 0, scroll.offset);
    
    // Suavizado de cámara para eliminar la rigidez del scroll
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.07);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.07);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.07);
  });

  return null;
}

export default function SceneManager() {
  return (
    <group>
      {/* 💡 ILUMINACIÓN DE ESCENA VANGUARDISTA */}
      <ambientLight intensity={0.6} />
      
      {/* Luz clave para realzar el Glassmorphism del SystemCore */}
      <spotLight 
        position={[0, 20, 20]} 
        angle={0.5} 
        penumbra={0.8} 
        intensity={2.5} 
        color="#8b5cf6" 
      />
      
      {/* Luz de acento trasera para profundidad visual */}
      <pointLight 
        position={[0, -5, -15]} 
        intensity={2} 
        color="#4c1d95" 
        distance={60} 
        decay={2} 
      />

      {/* Controlador de viaje visual */}
      <CameraRig />

      {/* EL MONOLITO INTERACTIVO (SystemCore) */}
      <group position={[0, 0, 0]}>
        <SystemCore />
      </group>
    </group>
  );
}
