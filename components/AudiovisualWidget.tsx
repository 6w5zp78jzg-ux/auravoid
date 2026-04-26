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

  // Ajuste Cover perfecto para 24x10
  useEffect(() => {
    if (texture && texture.image) {
      const video = texture.image;
      const updateTexture = () => {
        const videoAspect = video.videoWidth / video.videoHeight;
        const planeAspect = 24 / 10;
        texture.center.set(0.5, 0.5);
        if (videoAspect > planeAspect) {
          texture.repeat.set(planeAspect / videoAspect, 1);
        } else {
          texture.repeat.set(1, videoAspect / planeAspect);
        }
        texture.needsUpdate = true;
      };
      if (video.readyState >= 1) updateTexture();
      else video.addEventListener('loadedmetadata', updateTexture);
      return () => video.removeEventListener('loadedmetadata', updateTexture);
    }
  }, [texture]);

  return (
    <mesh ref={meshRef}>
      {/* 📐 Panel base del vídeo */}
      <planeGeometry args={[24, 10]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent opacity={isActive ? 1 : 0.2} />
    </mesh>
  );
}

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
  const recLightRef = useRef<THREE.Mesh>(null);

  // Animación del REC 3D
  useFrame(({ clock }) => {
    if (recLightRef.current && isActive) {
      const mat = recLightRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(clock.getElapsedTime() * 4) * 0.5;
    }
  });

  return (
    <group>
      <Suspense fallback={<mesh><planeGeometry args={[24, 10]} /><meshBasicMaterial color="#111" /></mesh>}>
        <CinemaScreen videoUrl="/video/alpha.mp4" isActive={isActive} />
      </Suspense>

      {/* 🎯 HUD 100% 3D: Z=0.1 para estar justo encima del vídeo */}
      <group position={[0, 0, 0.1]} visible={isActive}>
        
        {/* REC 3D (Arriba a la izquierda) */}
        <group position={[-10.5, 4, 0]}>
          <mesh ref={recLightRef}>
             <circleGeometry args={[0.2, 32]} />
             <meshBasicMaterial color="#ff0000" transparent />
          </mesh>
          <Text position={[0.6, 0, 0]} fontSize={0.5} color="#ff0000" anchorX="left" font="https://fonts.gstatic.com/s/geistmono/v1/GeistMono-Bold.woff">
            REC 00:12:45:22
          </Text>
        </group>

        {/* Marcos (Top Left) */}
        <mesh position={[-11, 4.8, 0]}><planeGeometry args={[1.5, 0.05]} /><meshBasicMaterial color="white" transparent opacity={0.4} /></mesh>
        <mesh position={[-11.75, 4.05, 0]}><planeGeometry args={[0.05, 1.5]} /><meshBasicMaterial color="white" transparent opacity={0.4} /></mesh>
        
        {/* Marcos (Top Right) */}
        <mesh position={[11, 4.8, 0]}><planeGeometry args={[1.5, 0.05]} /><meshBasicMaterial color="white" transparent opacity={0.4} /></mesh>
        <mesh position={[11.75, 4.05, 0]}><planeGeometry args={[0.05, 1.5]} /><meshBasicMaterial color="white" transparent opacity={0.4} /></mesh>

        {/* Info Inferior (Pegada abajo) */}
        <Text position={[-11.5, -4.2, 0]} fontSize={0.3} color="white" anchorX="left" fillOpacity={0.6} font="https://fonts.gstatic.com/s/geistmono/v1/GeistMono-Bold.woff">
          STORAGE: 128GB // RAW
        </Text>
        <Text position={[11.5, -4.2, 0]} fontSize={0.3} color="white" anchorX="right" fillOpacity={0.6} font="https://fonts.gstatic.com/s/geistmono/v1/GeistMono-Bold.woff">
          24 FPS // 800 ISO
        </Text>
      </group>
    </group>
  );
}
