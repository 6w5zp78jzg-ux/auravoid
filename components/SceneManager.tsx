'use client';
import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

// 🌐 EL NÚCLEO ÚNICO
import UnifiedServiceSystem from './UnifiedServiceSystem';

// --- CONTROLADOR DE CÁMARA CINEMATOGRÁFICA ---
function CameraRig() {
  const scroll = useScroll();

  useFrame((state) => {
    // 🎥 Aproximación Cinematográfica basada en Scroll (Lerp para fluidez extrema)
    // Cuando el scroll es 0 (inicio): Cámara más alta, más lejos, mirando ligeramente hacia abajo.
    // Cuando el scroll es 1 (fin): Cámara frente al monolito, en posición de interacción.
    
    const targetY = THREE.MathUtils.lerp(12, 0, scroll.offset);
    const targetZ = THREE.MathUtils.lerp(45, 28, scroll.offset); // Ajusta 28 según qué tan cerca quieras el Hero
    const targetRotX = THREE.MathUtils.lerp(-Math.PI / 10, 0, scroll.offset);
    
    // Suavizado (Damping) para que el movimiento no sea rígido
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.08);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.08);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.08);
  });

  return null;
}

export default function SceneManager() {
  const { viewport } = useThree();

  return (
    <group>
      {/* 💡 --- SISTEMA DE ILUMINACIÓN VANGUARDISTA --- 💡 */}
      {/* Iluminación base para dar volumen al cristal */}
      <ambientLight intensity={0.6} />
      
      {/* Luz focal volumétrica (Key light) para resaltar reflejos y el Glassmorphism */}
      <spotLight 
        position={[0, 20, 20]} 
        angle={0.5} 
        penumbra={0.8} 
        intensity={2.5} 
        color="#8b5cf6" // Tono púrpura premium
      />
      
      {/* Luz de contra (Backlight) para separar el monolito del fondo negro */}
      <pointLight 
        position={[0, -5, -15]} 
        intensity={2} 
        color="#4c1d95" 
        distance={60} 
        decay={2} 
      />

      {/* Rig de Cámara Dinámico */}
      <CameraRig />

      {/* EL ECOSISTEMA UNIFICADO (Centro del Escenario) */}
      <group position={[0, 0, 0]}>
        <UnifiedServiceSystem />
      </group>
    </group>
  );
}
