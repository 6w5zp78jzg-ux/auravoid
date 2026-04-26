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
    if (isActive) {
      texture.image.play().catch(() => {});
    } else {
      texture.image.pause();
    }
  }, [isActive, texture]);

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
      <planeGeometry args={[24, 10]} />
      <meshBasicMaterial 
        map={texture} 
        toneMapped={false} 
        transparent 
        opacity={isActive ? 1 : 0.15} 
      />
    </mesh>
  );
}

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
  const videoPath = "/video/alpha.mp4"; 
  const recLightRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    // 🛡️ FIX TYPESCRIPT: Casteamos el material a MeshBasicMaterial
    if (recLightRef.current && isActive) {
      const s = 0.4 + Math.sin(clock.getElapsedTime() * 5) * 0.4;
      const mat = recLightRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = s;
    }
  });

  return (
    <group>
      <Suspense fallback={<mesh><planeGeometry args={[24, 10]} /><meshBasicMaterial color="#020202" /></mesh>}>
        <CinemaScreen videoUrl={videoPath} isActive={isActive} />
      </Suspense>

      {/* INTERFAZ HUD (Totalmente soldada al panel) */}
      <group position={[0, 0, 0.1]} visible={isActive}>
        
        {/* Esquinas de cámara */}
        <group>
           <mesh position={[-11, 4.5, 0]}><planeGeometry args={[2, 0.05]} /><meshBasicMaterial color="white" transparent opacity={0.3} /></mesh>
           <mesh position={[-11.95, 3.5, 0]}><planeGeometry args={[0.05, 2]} /><meshBasicMaterial color="white" transparent opacity={0.3} /></mesh>
           <mesh position={[11, 4.5, 0]}><planeGeometry args={[2, 0.05]} /><meshBasicMaterial color="white" transparent opacity={0.3} /></mesh>
           <mesh position={[11.95, 3.5, 0]}><planeGeometry args={[0.05, 2]} /><meshBasicMaterial color="white" transparent opacity={0.3} /></mesh>
        </group>

        {/* INDICADOR REC */}
        <group position={[-10.2, 3.8, 0]}>
          <mesh ref={recLightRef}>
            <circleGeometry args={[0.2, 32]} />
            <meshBasicMaterial color="#ff0000" transparent />
          </mesh>
          <Text
            position={[0.5, 0, 0]}
            fontSize={0.45}
            color="#ff0000"
            font="/fonts/GeistMono-Bold.woff"
            anchorX="left"
          >
            REC 00:12:45:22
          </Text>
        </group>

        {/* BARRA INFERIOR DE DATOS */}
        <group position={[0, -4.2, 0]}>
          <Text
            position={[-11.5, 0, 0]}
            fontSize={0.25}
            color="white"
            anchorX="left"
            font="/fonts/GeistMono-Bold.woff"
            fillOpacity={0.5}
          >
            STORAGE: 128GB // RAW          AURA & VOID // UNIT_01
          </Text>
          <Text
            position={[11.5, 0, 0]}
            fontSize={0.25}
            color="white"
            anchorX="right"
            font="/fonts/GeistMono-Bold.woff"
            fillOpacity={0.5}
          >
            24 FPS // 800 ISO
          </Text>
        </group>
      </group>
    </group>
  );
}
