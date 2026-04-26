'use client';
import React, { useRef, Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

import ServiceCylinder from './ServiceCylinder';
import ServiceWheelContent from './ServiceWheelContent';

export default function SceneManager() {
  const { viewport } = useThree();
  const wheelDataRef = useRef({ rotation: 0, activeIndex: 0 });

  return (
    // Quitamos el fallback={null} para evitar que la pantalla se quede negra
    <Suspense fallback={<mesh><boxGeometry args={[1,1,1]}/><meshBasicMaterial color="navy" wireframe/></mesh>}>
      <ambientLight intensity={1.2} />
      <pointLight position={[0, 5, 15]} intensity={2} color="#00ffff" />

      <group position={[0, 0, 0]}>
        
        {/* 1. BRANDING INTEGRADO (Subido a Y=12 para que no tape la rueda) */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <group position={[0, 12, -2]}>
                <Text
                    fontSize={1.4}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    // Usamos una fuente estándar mientras verificas tus archivos locales
                    font="https://fonts.gstatic.com/s/cinzel/v11/8vXU7ww4uV_P8-6_QjXv.woff"
                >
                    AURA & VOID
                </Text>
                <Text
                    position={[0, -1.2, 0]}
                    fontSize={0.22}
                    color="white"
                    fillOpacity={0.4}
                    maxWidth={12}
                    textAlign="center"
                    lineHeight={1.5}
                    font="https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4MV96gxNqM.woff"
                >
                    LABORATORIO DE INGENIERÍA PSICOLÓGICA{"\n"}Y ARQUITECTURA DEL DESEO
                </Text>
            </group>
        </Float>

        {/* 2. LA RUEDA (Posición Central-Superior) */}
        <group position={[0, 4, 0]} scale={0.75}>
          <ServiceWheelContent wheelDataRef={wheelDataRef} />
        </group>

        {/* 3. EL CILINDRO (Posición Inferior) */}
        <group position={[0, -6.5, 0]} scale={0.75}>
          <ServiceCylinder wheelDataRef={wheelDataRef} />
        </group>

        {/* 4. EJE DE CONEXIÓN */}
        <mesh position={[0, 1, -1]}>
          <cylinderGeometry args={[0.02, 0.02, 30, 8]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.1} />
        </mesh>
      </group>
    </Suspense>
  );
}
