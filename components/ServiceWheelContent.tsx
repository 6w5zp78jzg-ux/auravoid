'use client';
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, useScroll, Text } from '@react-three/drei';
import * as THREE from 'three';

import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

// Privado para este archivo, sin exportaciones peligrosas
const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493', title: 'VISUAL ENGINE' },
  { id: 'mk', Component: MarketingWidget, color: '#4169e1', title: 'NEURO MKT' },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a', title: 'AI CORE' },
  { id: 'br', Component: BrandingWidget, color: '#ffff00', title: 'BRANDING' },
  { id: 'ev', Component: EventsWidget, color: '#9932cc', title: 'EVENTS' }
];

export default function ServiceWheelContent({ activeIndex, setActiveIndex }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  
  const isDragging = useRef(false);
  const rotationRef = useRef(0);
  const velocity = useRef(0);
  const faceAngle = (Math.PI * 2) / 5;

  const onPointerDown = (e: any) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
  };

  const onPointerMove = (e: any) => {
    if (!isDragging.current) return;
    const delta = e.movementX * 0.005; 
    velocity.current = delta;
    rotationRef.current += delta;
  };

  const onPointerUp = (e: any) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  useFrame(() => {
    if (!groupRef.current) return;

    if (!isDragging.current) {
      velocity.current *= 0.92;
      rotationRef.current += velocity.current;
      const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
      const lerpFactor = scroll.offset > 0.1 ? 0.15 : 0.04;
      rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, lerpFactor);
    }

    let index = Math.round(-rotationRef.current / faceAngle) % 5;
    if (index < 0) index += 5;
    if (index !== activeIndex) setActiveIndex(index);

    groupRef.current.rotation.y = rotationRef.current;
  });

  return (
    <group ref={groupRef} position={[0, 6.5, 0]}>
      <mesh 
        visible={false} 
        onPointerDown={onPointerDown} 
        onPointerMove={onPointerMove} 
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <cylinderGeometry args={[15, 15, 12, 16]} />
      </mesh>

      {WIDGETS_DATA.map((widget, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 11.35;
        const isFront = i === activeIndex;

        return (
          <group 
            key={widget.id} 
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} 
            rotation={[0, angle, 0]}
          >
            {/* CHASIS */}
            <mesh>
              <boxGeometry args={[16.5, 9.5, 0.4]} />
              <meshStandardMaterial color="#050505" metalness={1} roughness={0.4} />
              <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.1} />
            </mesh>

            {/* TÍTULO 3D NATIVO (Seguro contra colapsos) */}
            <Text
              position={[0, 5.8, 0]}
              fontSize={1.2}
              color={isFront ? widget.color : '#333333'}
              anchorX="center"
              anchorY="bottom"
              letterSpacing={0.1}
            >
              {widget.title}
            </Text>

            {/* WIDGET ORIGINAL */}
            <group position={[0, 0, 0.35]}>
              <widget.Component isActive={isFront} />
            </group>
          </group>
        );
      })}
    </group>
  );
}
