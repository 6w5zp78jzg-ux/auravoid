'use client';
import React, { useRef, Suspense, useEffect } from 'react';
import { useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const recRef = useRef<THREE.Mesh>(null);
  
  const texture = useVideoTexture("/video/alpha.mp4", { muted: true, loop: true, start: true });

  // Si isActive es true, el video corre, si no, se para (Ahorro de CPU en iPad)
  useEffect(() => {
    if (texture.image) {
      isActive ? texture.image.play() : texture.image.pause();
    }
  }, [isActive, texture]);

  return (
    <group>
      {/* 1. EL PANEL DE VIDEO */}
      <mesh ref={meshRef}>
        <planeGeometry args={[24, 10]} />
        <meshBasicMaterial map={texture} toneMapped={false} transparent opacity={isActive ? 1 : 0.2} />
      </mesh>

      {/* 2. EL HUD (REC) - Ahora es una Malla 3D pegada, NO ES HTML */}
      <group position={[0, 0, 0.2]} visible={isActive}>
        {/* El cuadrado rojo del REC (Si esto se mueve, el panel entero se mueve) */}
        <mesh position={[-10, 4, 0]} ref={recRef}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="red" />
        </mesh>
        
        {/* Línea de marco superior */}
        <mesh position={[0, 4.8, 0]}>
          <planeGeometry args={[23, 0.05]} />
          <meshBasicMaterial color="white" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
