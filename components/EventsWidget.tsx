'use client';
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

function LuxuryGeometry({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const { size } = useThree();
    
    // --- MOTOR FÍSICO LÍQUIDO ---
    const isDragging = useRef(false);
    const lastPointer = useRef(new THREE.Vector2());
    const velocity = useRef(new THREE.Vector2(0, 0));
    const quaternion = useRef(new THREE.Quaternion());

    // Iniciar arrastre
    const handleDown = (e: any) => {
        if (!isActive) return;
        e.stopPropagation(); // 🚀 BLOQUEA EL GIRO DE LA RUEDA
        e.target.setPointerCapture(e.pointerId);
        isDragging.current = true;
        lastPointer.current.set(e.clientX, e.clientY);
        velocity.current.set(0, 0);
    };

    // Mover (Física de fluido)
    const handleMove = (e: any) => {
        if (!isDragging.current || !isActive) return;

        const dx = e.clientX - lastPointer.current.x;
        const dy = e.clientY - lastPointer.current.y;

        // Sensibilidad líquida adaptada al iPad
        const sens = 0.008;
        velocity.current.lerp(new THREE.Vector2(dx * sens, dy * sens), 0.2);

        lastPointer.current.set(e.clientX, e.clientY);
    };

    const handleUp = (e: any) => {
        isDragging.current = false;
        if(e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
    };

    useFrame((state) => {
        if (!groupRef.current) return;

        if (velocity.current.length() > 0.0005) {
            // Eje de rotación perpendicular al movimiento (Omnidireccional)
            const axis = new THREE.Vector3(velocity.current.y, velocity.current.x, 0).normalize();
            const angle = velocity.current.length();
            
            const incrementalQuat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
            quaternion.current.multiplyQuaternions(incrementalQuat, quaternion.current);
            
            // Fricción suave (Inercia)
            if (!isDragging.current) {
                velocity.current.multiplyScalar(0.95);
            }
        }

        // Aplicamos la rotación con suavizado tipo "mercurio"
        groupRef.current.quaternion.slerp(quaternion.current, 0.15);

        // Flotación constante
        const t = state.clock.getElapsedTime();
        groupRef.current.position.y = Math.sin(t * 0.4) * 0.1;
    });

    return (
        <group ref={groupRef}>
            {/* 🎯 EL COLISIONADOR: Una esfera invisible que captura TODO el toque */}
            <mesh 
                onPointerDown={handleDown}
                onPointerMove={handleMove}
                onPointerUp={handleUp}
                onPointerCancel={handleUp}
            >
                <sphereGeometry args={[3, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            <Environment preset="city" />
            
            {/* JOYERÍA 3D */}
            <mesh scale={1.5}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.05} emissive="#c5a059" emissiveIntensity={0.2} />
            </mesh>
            
            <mesh scale={2.4}>
                <icosahedronGeometry args={[1, 1]} />
                <meshPhysicalMaterial 
                    transmission={1} thickness={2.5} roughness={0.01} ior={1.5} color="#ffffff" 
                    transparent opacity={isActive ? 1 : 0.3} 
                />
            </mesh>

            <mesh scale={2.42}>
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial color="#c5a059" metalness={1} wireframe />
            </mesh>
        </group>
    );
}

export default function EventsWidget({ isActive }: { isActive: boolean }) {
    
    // FONDO CLARO (Perla de alto rendimiento)
    const pearlTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const grad = ctx.createRadialGradient(512, 0, 0, 512, 0, 1024);
            grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, '#FAF9F6'); grad.addColorStop(1, '#d1cfc8');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 1024);
            ctx.fillStyle = '#44403c'; ctx.font = '300 85px sans-serif'; ctx.textAlign = 'left';
            ctx.fillText('EVENTS', 100, 220);
            ctx.fillStyle = '#a8a29e'; ctx.fillRect(100, 260, 400, 3);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, []);

    return (
        <group>
            {/* LUCES */}
            <pointLight position={[5, 5, 5]} intensity={isActive ? 60 : 0} color="#ffffff" />
            <ambientLight intensity={isActive ? 0.7 : 0} />

            {/* FONDO: No captura eventos para que la rueda pueda girar */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial map={pearlTexture} transparent opacity={isActive ? 1 : 0.4} />
            </mesh>

            {/* LA JOYA: Sí captura eventos (Z adelantado) */}
            <group position={[0, 0, 1.5]}>
                <LuxuryGeometry isActive={isActive} />
            </group>
            
            <ContactShadows position={[0, -4.6, 0]} opacity={isActive ? 0.6 : 0} scale={18} blur={3} color="#c5a059" />
        </group>
    );
}
