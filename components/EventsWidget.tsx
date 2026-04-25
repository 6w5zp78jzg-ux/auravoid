'use client';
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

function LuxuryGeometry({ isActive }: { isActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const { size } = useThree();
    
    // --- ESTADO FÍSICO LÍQUIDO ---
    const isDragging = useRef(false);
    const pointerPos = useRef({ x: 0, y: 0 });
    const velocity = useRef(new THREE.Vector2(0, 0));
    // Usamos un Cuaternión para rotación libre sin Gimbal Lock (omnidireccional)
    const currentQuaternion = useRef(new THREE.Quaternion());
    const rotationAxis = useRef(new THREE.Vector3());

    const handlePointerDown = (e: any) => {
        if (!isActive) return;
        // 🚀 BLOQUEO DE RUEDA: Detiene el giro de la web para jugar con la bola
        e.stopPropagation(); 
        e.target.setPointerCapture(e.pointerId);
        
        isDragging.current = true;
        pointerPos.current = { x: e.clientX, y: e.clientY };
        velocity.current.set(0, 0);
    };

    const handlePointerMove = (e: any) => {
        if (!isDragging.current || !isActive) return;

        const deltaX = e.clientX - pointerPos.current.x;
        const deltaY = e.clientY - pointerPos.current.y;

        // Sensibilidad líquida
        const sensitivity = 0.005;
        velocity.current.set(deltaX * sensitivity, deltaY * sensitivity);

        pointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: any) => {
        isDragging.current = false;
        if(e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
    };

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // 🌊 CÁLCULO DE ROTACIÓN OMNIDIRECCIONAL
        if (velocity.current.length() > 0.0001) {
            // El eje de rotación es perpendicular a la dirección del movimiento del dedo
            rotationAxis.current.set(velocity.current.y, velocity.current.x, 0).normalize();
            
            const angle = velocity.current.length();
            const incrementalQuaternion = new THREE.Quaternion().setFromAxisAngle(
                rotationAxis.current, 
                angle
            );
            
            // Multiplicamos el cuaternión actual por el incremento
            currentQuaternion.current.multiplyQuaternions(incrementalQuaternion, currentQuaternion.current);
            
            // Fricción líquida (Inercia)
            // Si el dedo no está tocando, la bola sigue girando y decae suavemente
            if (!isDragging.current) {
                velocity.current.multiplyScalar(0.96); 
            }
        }

        // Aplicamos la rotación de forma suave (SLERP) para que se sienta fluido
        groupRef.current.quaternion.slerp(currentQuaternion.current, 0.2);

        // Movimiento de flotación sutil adicional
        const t = state.clock.getElapsedTime();
        groupRef.current.position.y = Math.sin(t * 0.5) * 0.15;
    });

    return (
        <group 
            ref={groupRef} 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <Environment preset="city" />
            
            {/* NÚCLEO ORO */}
            <mesh scale={1.5}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial 
                    color="#c5a059" 
                    metalness={1} 
                    roughness={0.05} 
                    emissive="#c5a059" 
                    emissiveIntensity={0.15} 
                />
            </mesh>
            
            {/* CORAZA CRISTAL LÍQUIDO */}
            <mesh scale={2.4}>
                <icosahedronGeometry args={[1, 1]} />
                <meshPhysicalMaterial 
                    transmission={1} 
                    thickness={2.5} 
                    roughness={0.01} 
                    ior={1.5} 
                    color="#ffffff" 
                    transparent 
                    opacity={isActive ? 1 : 0.3} 
                />
            </mesh>

            {/* WIREFRAME DE PRECISIÓN */}
            <mesh scale={2.42}>
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial color="#c5a059" metalness={1} wireframe />
            </mesh>
        </group>
    );
}

export default function EventsWidget({ isActive }: { isActive: boolean }) {
    
    // Fondo claro Perla (Textura de alto rendimiento)
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
            {/* LUCES DINÁMICAS */}
            <pointLight position={[5, 5, 5]} intensity={isActive ? 65 : 0} color="#ffffff" />
            <ambientLight intensity={isActive ? 0.7 : 0} />

            {/* FONDO: No detiene eventos (Permite girar la rueda) */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial map={pearlTexture} transparent opacity={isActive ? 1 : 0.4} />
            </mesh>

            {/* LA JOYA: Sí detiene eventos (Física de arrastre) */}
            <group position={[0, 0, 1.4]}>
                <LuxuryGeometry isActive={isActive} />
            </group>
            
            <ContactShadows position={[0, -4.6, 0]} opacity={isActive ? 0.6 : 0} scale={18} blur={3} color="#c5a059" />
        </group>
    );
}
