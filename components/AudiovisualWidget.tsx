'use client';
import React from 'react';
import { Text, Html } from '@react-three/drei';

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
    return (
        <group>
            {/* 1. TEST DE TEXTO 3D (Si ves esto, el componente está vivo) */}
            <Text
                position={[0, 2, 0.5]}
                fontSize={0.8}
                color={isActive ? "#ff1493" : "#444"}
                font="/fonts/Geist-Bold.json" // O el que tengas, sino usa el default
            >
                AUDIOVISUAL UNIT
            </Text>

            {/* 2. PLACA DE COLOR SÓLIDA (En lugar de HTML por ahora) */}
            <mesh position={[0, 0, 0.1]}>
                <planeGeometry args={[10, 6]} />
                <meshBasicMaterial color={isActive ? "#111" : "#050505"} />
            </mesh>

            {/* 3. INTENTO FINAL DE HTML (Con configuración de máxima prioridad) */}
            <Html 
                transform 
                center
                distanceFactor={6}
                occlude={false}
                style={{
                    width: '800px',
                    height: '500px',
                    display: isActive ? 'flex' : 'none',
                    opacity: isActive ? 1 : 0,
                    pointerEvents: 'none', // Para que no bloquee el giro
                }}
            >
                <div style={{
                    width: '800px',
                    height: '500px',
                    background: 'linear-gradient(45deg, #ff1493, #000)',
                    border: '10px solid white',
                    borderRadius: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <h1 style={{ fontSize: '60px', margin: 0 }}>SISTEMA ACTIVO</h1>
                    <p style={{ fontSize: '20px' }}>CARGANDO ALPHA.MP4...</p>
                </div>
            </Html>
        </group>
    );
}
