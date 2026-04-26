'use client';
import React, { useRef, Suspense, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVideoTexture, Text } from '@react-three/drei';
import * as THREE from 'three';

function CinemaScreen({ videoUrl, isActive }: { videoUrl: string; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useVideoTexture(videoUrl, { muted: true, loop: true, start: true });

  useEffect(() => {
    if (!texture.image) return;
    isActive ? texture.image.play().catch(() => {}) : texture.image.pause();
  }, [isActive, texture]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[24, 10]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent opacity={isActive ? 1 : 0.15} />
    </mesh>
  );
}

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
  const recLightRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (recLightRef.current && isActive) {
      const mat = recLightRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(clock.getElapsedTime() * 5) * 0.4;
    }
  });

  return (
    <group>
      <Suspense fallback={<mesh><planeGeometry args={[24, 10]} /><meshBasicMaterial color="#020202" /></mesh>}>
        <CinemaScreen videoUrl="/video/alpha.mp4" isActive={isActive} />
      </Suspense>

      {/* --- HUD SOLDADO AL PANEL --- */}
      <group position={[0, 0, 0.1]} visible={isActive}>
        {/* Esquinas (Marcos 3D) */}
        <mesh position={[-11.5, 4.5, 0]}><planeGeometry args={[1, 0.05]} /><meshBasicMaterial color="white" transparent opacity={0.3} /></mesh>
        <mesh position={[-11.95, 4, 0]}><planeGeometry args={[0.05, 1]} /><meshBasicMaterial color="white" transparent opacity={0.3} /></mesh>
        
        {/* REC 3D */}
        <group position={[-10, 3.8, 0]}>
          <mesh ref={recLightRef}>
            <circleGeometry args={[0.15, 32]} />
            <meshBasicMaterial color="red" transparent />
          </mesh>
          <Text position={[0.4, 0, 0]} fontSize={0.4} color="red" font="/fonts/GeistMono-Bold.woff" anchorX="left">
            REC 00:12:45:22
          </Text>
        </group>

        {/* Info Inferior */}
        <Text position={[-11, -4.2, 0]} fontSize={0.25} color="white" font="/fonts/GeistMono-Bold.woff" anchorX="left" fillOpacity={0.5}>
            STORAGE: 128GB // RAW
        </Text>
      </group>
    </group>
  );
}
