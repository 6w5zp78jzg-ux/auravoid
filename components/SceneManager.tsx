'use client';
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const scroll = useScroll();
  const { viewport } = useThree();

  const cylinderGroup = useRef<THREE.Group>(null);
  const wheelGroup = useRef<THREE.Group>(null);

  useFrame(() => {
    const offset = scroll.offset;
    const travelDistance = viewport.height * 1.5;

    if (cylinderGroup.current) {
      cylinderGroup.current.position.y = offset * travelDistance;
      cylinderGroup.current.visible = offset < 0.7;
    }

    if (wheelGroup.current) {
      wheelGroup.current.position.y = -travelDistance + (offset * travelDistance);
    }
  });

  return (
    <group>
      {/* 🌍 --- MAPA DE ENTORNO (EL SECRETO DEL CRISTAL) --- 🌍 */}
      {/* Esto da reflejos al cristal para que deje de verse negro */}
      <Environment preset="city" />

      {/* 💡 --- ILUMINACIÓN HERO --- 💡 */}
      <ambientLight intensity={0.5} />
      
      {/* Luz frontal fuerte para resaltar los bordes metálicos */}
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        castShadow 
      />

      {/* SECCIÓN 1: CILINDRO */}
      <group ref={cylinderGroup}>
        <ServiceCylinder />
      </group>

      {/* SECCIÓN 2: PENTÁGONO HERO */}
      <group ref={wheelGroup}>
        <ServiceWheelContent />
        
        {/* Sombra de contacto en el "suelo" invisible para dar peso */}
        <ContactShadows 
          position={[0, -4, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2.4} 
          far={4.5} 
        />
      </group>
    </group>
  );
}
