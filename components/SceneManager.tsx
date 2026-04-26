'use client';
import React, { useRef, Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei'; // Float le da un movimiento orgánico
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={1.5} />
      <pointLight position={[0, 10, 10]} intensity={2} color="#00ffff" />

      {/* --- EL TÓTEM UNIFICADO --- */}
      <group position={[0, 0, 0]}>
        
        {/* 1. BRANDING (ARRIBA DE TODO) */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={[0, 11, 0]}>
                <Text
                    fontSize={1.2}
                    color="white"
                    font="/fonts/GeistMono-Bold.woff" // Asegúrate de que esta ruta existe
                    anchorX="center"
                    anchorY="middle"
                >
                    AURA & VOID
                </Text>
                <Text
                    position={[0, -1, 0]}
                    fontSize={0.25}
                    color="white"
                    fillOpacity={0.5}
                    maxWidth={8}
                    textAlign="center"
                    font="/fonts/GeistMono-Bold.woff"
                >
                    LABORATORIO DE INGENIERÍA PSICOLÓGICA Y ARQUITECTURA DEL DESEO
                </Text>
            </group>
        </Float>

        {/* 2. LA RUEDA (CENTRO SUPERIOR) */}
        <group position={[0, 4.5, 0]} scale={0.75}>
          <ServiceWheelContent wheelDataRef={wheelDataRef} />
        </group>

        {/* 3. EL CILINDRO (CENTRO INFERIOR) */}
        <group position={[0, -6, 0]} scale={0.75}>
          <ServiceCylinder wheelDataRef={wheelDataRef} />
        </group>

        {/* 4. EJE DE ENERGÍA (Visual) */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 25, 8]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.1} />
        </mesh>

      </group>
    </Suspense>
  );
}
