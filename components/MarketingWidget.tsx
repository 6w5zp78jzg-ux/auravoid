'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. COMPONENTE: NODOS DE ADQUISICIÓN (Vida y Objetivos) ---
function NeuralNodes({ isActive }: { isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Nodos fijos con IDs para que no cambien en cada render
  const nodes = useMemo(() => [
    { pos: [4, 2, 0.2], id: "0xAF2", label: "LEAD_A" },
    { pos: [-3, 3, 0.2], id: "0xBD9", label: "CONV_X" },
    { pos: [5, -2, 0.2], id: "0xCE1", label: "ROI_UP" },
    { pos: [-4, -2.5, 0.2], id: "0x992", label: "FLUX_Z" },
    { pos: [0, -3.5, 0.2], id: "0x11B", label: "NODE_0" },
  ], []);

  useFrame((state) => {
    if (!groupRef.current || !isActive) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      // Movimiento orgánico y parpadeo
      const pulse = 0.8 + Math.sin(t * 4 + i) * 0.2;
      child.scale.set(pulse, pulse, 1);
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <group key={i} position={n.pos as any}>
          {/* Marcador táctico (Cuadrado rotado) */}
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.25, 0.25]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
          </mesh>
          {/* Etiquetas de datos nativas (No fallan como el HTML) */}
          <Text position={[0.4, 0, 0]} fontSize={0.14} color="#00ffff" anchorX="left" font="/fonts/GeistMono-Bold.woff">
            {`${n.label}\n${n.id}`}
          </Text>
        </group>
      ))}
    </group>
  );
}

// --- 2. COMPONENTE: BARRAS DE RENDIMIENTO (Infografías) ---
function MarketBars({ isActive }: { isActive: boolean }) {
  const barsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!barsRef.current || !isActive) return;
    const t = state.clock.getElapsedTime();
    barsRef.current.children.forEach((bar, i) => {
      // Cada barra tiene su propia frecuencia de movimiento
      const scaleY = 0.5 + Math.abs(Math.sin(t * 5 + i * 0.3)) * 2;
      bar.scale.y = scaleY;
    });
  });

  return (
    <group ref={barsRef} position={[-7.5, -3.8, 0.2]}>
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} position={[i * 0.2, 0, 0]}>
          <planeGeometry args={[0.08, 1]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#00ffff" : "#ffffff"} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// --- 3. COMPONENTE PRINCIPAL ---
export default function MarketingWidget({ isActive }: { isActive: boolean }) {
  const sweepRef = useRef<THREE.Mesh>(null);
  const [hex, setHex] = useState('0x000000');

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setHex('0x' + Math.random().toString(16).slice(2, 8).toUpperCase());
    }, 100);
    return () => clearInterval(interval);
  }, [isActive]);

  useFrame((_, delta) => {
    if (sweepRef.current && isActive) sweepRef.current.rotation.z -= delta * 3;
  });

  return (
    <group>
      {/* 🛑 FONDO DE SEGURIDAD (Evita colapsos visuales) */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[16.5, 9.5]} />
        <meshBasicMaterial color="#010810" />
      </mesh>

      {/* 1. REJILLA MILIMÉTRICA TÁCTICA */}
      <group position={[0, 0, 0.01]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Line key={`v-${i}`} points={[[(i - 10) * 0.8, -5, 0], [(i - 10) * 0.8, 5, 0]]} color="#00ffff" lineWidth={0.5} transparent opacity={0.1} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <Line key={`h-${i}`} points={[[-9, (i - 6) * 0.8, 0], [9, (i - 6) * 0.8, 0]]} color="#00ffff" lineWidth={0.5} transparent opacity={0.1} />
        ))}
      </group>

      {/* 2. RADAR Y ESCÁNER (Puro WebGL) */}
      <group position={[0, 0, 0.05]}>
        {[2.5, 4, 5.2].map((r, i) => (
          <Line key={i} points={new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0).getPoints(64).map(p => [p.x, p.y, 0]) as any} color="#00ffff" lineWidth={1} transparent opacity={0.2} />
        ))}
        <mesh ref={sweepRef}>
          <planeGeometry args={[5.2, 0.05]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
          {/* Pivote del barrido */}
          <primitive object={new THREE.Object3D()} position={[-2.6, 0, 0]} />
        </mesh>
      </group>

      {/* 3. VIDA: NODOS Y BARRAS */}
      <NeuralNodes isActive={isActive} />
      <MarketBars isActive={isActive} />

      {/* 4. TEXTOS HUD (Inmunes a Safari) */}
      <group position={[-7.8, 4.2, 0.3]}>
        <Text fontSize={0.5} color="#00ffff" anchorX="left" font="/fonts/GeistMono-Bold.woff">
          MARKETING_NEURAL_UPLINK
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.18} color="#ffffff" anchorX="left" fillOpacity={0.6}>
          {`SYS_STATUS: ACTIVE\nACQUIRING_HASH: ${hex}`}
        </Text>
      </group>

      <group position={[7.8, -4, 0.3]}>
        <Text fontSize={0.9} color="#ffffff" anchorX="right">
          99.8%
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.15} color="#00ffff" anchorX="right" fillOpacity={0.5}>
          CONVERSION_OPTIMIZATION
        </Text>
      </group>

      <pointLight position={[0, 0, 5]} intensity={isActive ? 15 : 0} color="#00ffff" />
    </group>
  );
}
