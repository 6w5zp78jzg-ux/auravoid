'use client';
import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function AudiovisualWidget({ isActive }: { isActive: boolean }) {
    
    // 🎨 CREAMOS EL DISEÑO DIRECTAMENTE
    const texture = useMemo(() => {
        const width = 1600;
        const height = 1000;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Fondo Negro profundo
            ctx.fillStyle = '#020202';
            ctx.fillRect(0, 0, width, height);

            // Dibujar rejilla sutil de fondo
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 1;
            for(let i=0; i<width; i+=40) {
                ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke();
            }

            // TÍTULO NEÓN (IA Y AUTOMATIZACIONES)
            ctx.shadowColor = '#ff1493';
            ctx.shadowBlur = 30;
            ctx.fillStyle = '#ff1493';
            ctx.font = 'bold 80px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('IA Y AUTOMATIZACIONES', width / 2, height / 2);

            // DETALLES HUD
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#666';
            ctx.font = '30px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('ENLACE COGNITIVO', 100, 100);
            
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 50px sans-serif';
            ctx.fillText('AURA & VOID', width / 2, height - 120);

            ctx.fillStyle = '#444';
            ctx.font = '20px monospace';
            ctx.fillText('LABORATORIO DE INGENIERÍA PSICOLÓGICA', width / 2, height - 70);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, []);

    return (
        <group>
            {/* 1. Placa de fondo sólida (para evitar que se vea a través) */}
            <mesh>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* 2. Placa con el diseño (Textura) */}
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial 
                    map={texture} 
                    transparent={true}
                    opacity={isActive ? 1 : 0.3}
                />
            </mesh>
        </group>
    );
}
