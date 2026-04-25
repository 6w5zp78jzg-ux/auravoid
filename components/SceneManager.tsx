'use client';
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  // useScroll lee el progreso de la barra de navegación (de 0 a 1)
  const scroll = useScroll();
  const { viewport } = useThree();

  // Referencias para mover los grupos independientemente de la cámara
  const cylinderGroup = useRef<THREE.Group>(null);
  const wheelGroup = useRef<THREE.Group>(null);

  useFrame(() => {
    const offset = scroll.offset;
    
    // Distancia que recorrerán los elementos (1.5 veces el alto de la pantalla)
    const travelDistance = viewport.height * 1.5;

    if (cylinderGroup.current) {
      // El cilindro empieza en Y=0 y sube hacia el infinito positivo al hacer scroll
      cylinderGroup.current.position.y = offset * travelDistance;
    }

    if (wheelGroup.current) {
      // El pentágono empieza oculto abajo (Y negativo) y sube hasta Y=0
      wheelGroup.current.position.y = -travelDistance + (offset * travelDistance);
    }
  });

  return (
    <group>
      {/* SECCIÓN 1: EL CILINDRO */}
      <group ref={cylinderGroup}>
        <ServiceCylinder />
      </group>

      {/* SECCIÓN 2: LA RUEDA PENTAGONAL */}
      <group ref={wheelGroup}>
        <ServiceWheelContent />
      </group>
    </group>
  );
}
