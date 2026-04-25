'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Importamos tus widgets 3D (asegúrate de que los nombres coincidan con tus archivos)
import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

const WIDGETS = [
  { id: 'av', Component: AudiovisualWidget },
  { id: 'mk', Component: MarketingWidget },
  { id: 'ai', Component: IARobotTracker },
  { id: 'br', Component: BrandingWidget },
  { id: 'ev', Component: EventsWidget }
];

export default function ServiceWheelContent() {
  const groupRef = useRef<THREE.Group>(null);

  // Giro constante estilo exposición
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {WIDGETS.map((widget, i) => {
        // Pentágono: 5 caras = 72 grados de separación
        const angle = (i / 5) * Math.PI * 2;
        const radius = 25; // Radio para dar espacio a los widgets
        
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <group 
            key={widget.id} 
            position={[x, 0, z]} 
            rotation={[0, angle, 0]}
          >
            {/* Renderizamos tu widget directamente en el espacio 3D */}
            <widget.Component isActive={true} />
            
            {/* Plano de apoyo visual (Cristal oscuro) */}
            <mesh position={[0, 0, -1]}>
              <planeGeometry args={[18, 12]} />
              <meshStandardMaterial 
                color="#000000" 
                transparent 
                opacity={0.4} 
                roughness={0.1} 
                metalness={0.8} 
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
