'use client';
import React from 'react';
import { Text } from '@react-three/drei';

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
    return (
        <group>
            {/* Si el componente carga, verás una esfera blanca flotando */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color={isActive ? "white" : "grey"} />
            </mesh>
            
            <Text
                position={[0, 2, 0]}
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {isActive ? "WIDGET AV ACTIVO" : "AV"}
            </Text>
        </group>
    );
}
