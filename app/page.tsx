'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';

export default function Home() {
  return (
    // Usamos estilos inline crudos para saltarnos cualquier posible fallo de Tailwind
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#222222' }}>
      <Canvas>
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshBasicMaterial color="#ff0055" wireframe={true} />
        </mesh>
      </Canvas>
    </div>
  );
}
