'use client';
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
    const textureRef = useRef<THREE.CanvasTexture>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const width = 1600;
        const height = 1000;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Intentamos cargar la fuente, pero con un fallback seguro para evitar errores
        const drawCanvas = () => {
            const COLOR_NEON_PINK = '#ff1493';
            const COLOR_TEXT_DIM = '#666';

            ctx.fillStyle = '#010101';
            ctx.fillRect(0, 0, width, height);

            ctx.font = '70px Arial, sans-serif'; // Usamos Arial como base para que no falle
            ctx.fillStyle = COLOR_NEON_PINK;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = COLOR_NEON_PINK;
            ctx.shadowBlur = 40;
            ctx.fillText('IA Y AUTOMATIZACIONES', width / 2, height / 2);

            ctx.shadowBlur = 0;
            ctx.font = '30px Arial, sans-serif';
            ctx.fillStyle = COLOR_TEXT_DIM;
            ctx.textAlign = 'left';
            ctx.fillText('ENLACE COGNITIVO', 80, 80);

            ctx.font = '50px Arial, sans-serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('AURA & VOID', width / 2, height - 120);

            // 🚀 CORRECCIÓN DE LOS ERRORES DE TYPESCRIPT:
            // En versiones nuevas de Three.js, 'encoding' ahora es 'colorSpace'
            // y 'sRGBEncoding' ahora es 'SRGBColorSpace'
            if (textureRef.current) {
                textureRef.current.image = canvas;
                textureRef.current.colorSpace = THREE.SRGBColorSpace; 
                textureRef.current.needsUpdate = true;
            }
            setIsLoading(false);
        };

        drawCanvas();
    }, []);

    return (
        <group>
            {/* Fondo de seguridad */}
            <mesh scale={0.99}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial transparent opacity={0.3} color="#000" />
            </mesh>

            {/* Malla con la textura real del canvas */}
            <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial 
                    transparent 
                    opacity={isActive ? 1 : 0.2}
                    toneMapped={false}
                >
                    <canvasTexture 
                        ref={textureRef} 
                        // Optimizaciones para que se vea nítido en el iPad
                        minFilter={THREE.LinearFilter} 
                        magFilter={THREE.LinearFilter}
                    />
                </meshBasicMaterial>
            </mesh>
        </group>
    );
}
