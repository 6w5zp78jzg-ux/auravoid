'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Importamos tus piezas maestras
import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const scroll = useScroll(); // Captura el scroll de ScrollControls en page.tsx
  
  const cylinderRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // scroll.offset va de 0 (inicio) a 1 (final) con damping (inercia)
    const offset = scroll.offset;

    if (cylinderRef.current && wheelRef.current) {
      // --- COREOGRAFÍA TIPO AGENCIA ---

      // 1. El Cilindro (0.0 a 0.5 del scroll)
      // Se desplaza hacia arriba y rota más rápido al scrollear
      cylinderRef.current.position.y = offset * 50; 
      cylinderRef.current.rotation.y += delta * 0.2 + (offset * 0.1);
      
      // Desvanecimiento: Si el material lo permite, podrías bajar la opacidad aquí
      // Por ahora lo alejamos en el eje Z para que desaparezca elegantemente
      cylinderRef.current.position.z = -offset * 20;

      // 2. La Rueda Pentagonal (Aparece a partir de 0.4)
      // Viene desde abajo (y = -40) hasta el centro (y = 0)
      const wheelTargetY = -40 + (offset * 40);
      wheelRef.current.position.y = THREE.MathUtils.lerp(wheelRef.current.position.y, wheelTargetY, 0.1);
      
      // Rotación sutil de entrada
      wheelRef.current.rotation.x = (1 - offset) * 0.5;
    }
  });

  return (
    <group>
      {/* SECCIÓN 1 */}
      <group ref={cylinderRef}>
        <ServiceCylinder />
      </group>

      {/* SECCIÓN 2 (PENTÁGONO) */}
      <group ref={wheelRef} position={[0, -40, 0]}>
        <ServiceWheelContent />
      </group>

      <Environment preset="city" />
    </group>
  );
}
