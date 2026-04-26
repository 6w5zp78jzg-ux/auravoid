'use client';
import React, { useRef, useState, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

// --- CONTROLADOR DE CÁMARA ---
function CameraRig() {
  const scroll = useScroll();
  const { viewport } = useThree();

  useFrame((state) => {
    // Viaje desde el centro (0) hasta la Rueda (Y = -viewport.height * 1.5)
    const targetY = -(scroll.offset * (viewport.height * 1.5));
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.1);
  });

  return null;
}

export default function SceneManager() {
  const { viewport } = useThree();

  // 🧠 --- EL CEREBRO DE LA ESCENA --- 🧠
  // Aquí guardamos la rotación y el panel que está activo para que ambos hablen el mismo idioma
  const [wheelRotation, setWheelRotation] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <group>
      {/* ILUMINACIÓN GLOBAL */}
      <ambientLight intensity={0.4} />
      <pointLight 
        position={[0, -viewport.height * 1.5, 20]} 
        intensity={2} 
        color="#00ffff" 
        distance={50} 
      />
      
      <CameraRig />

      {/* 🚀 SECCIÓN UNIFICADA: EL REACTOR DE SERVICIOS 🚀 */}
      {/* Colocamos ambos en la misma posición Y para que se fusionen */}
      <group position={[0, -viewport.height * 1.5, 0]}>
        
        {/* 1. EL CILINDRO (DETALLE / NÚCLEO) 
            Ahora vive dentro de la rueda y recibe la información del cerebro
        */}
        <group position={[0, 0, -2]}> {/* Lo metemos un poco hacia atrás (Z=-2) */}
          <ServiceCylinder 
            wheelRotation={wheelRotation} 
            activeIndex={activeIndex} 
          />
        </group>

        {/* 2. LA RUEDA (MAESTRO / SELECTOR)
            El usuario interactúa aquí. Al girar, avisa al cerebro mediante 'onSync'
        */}
        <group position={[0, 0, 0]}>
          <ServiceWheelContent 
            onSync={(rot, index) => {
              setWheelRotation(rot);
              setActiveIndex(index);
            }} 
          />
        </group>

      </group>

      {/* OPCIONAL: Puedes dejar un elemento decorativo en la parte superior (Y=0) 
          para que el inicio no esté vacío antes de hacer scroll */}
      <group position={[0, 0, -5]}>
         {/* Unas luces o partículas de bienvenida */}
      </group>
    </group>
  );
}
