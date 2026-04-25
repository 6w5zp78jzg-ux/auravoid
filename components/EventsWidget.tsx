'use client';
import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function LuxuryGeometry() {
    const groupRef = useRef<THREE.Group>(null);
    const { size } = useThree();
    
    // Referencias para la física manual
    const isDragging = useRef(false);
    const previousMouse = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const rotation = useRef({ x: 0, y: 0 });

    // Capturamos eventos directamente en el canvas para máxima precisión
    const onPointerDown = (e: any) => {
        isDragging.current = true;
        previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
        isDragging.current = false;
    };

    const onPointerMove = (e: any) => {
        if (!isDragging.current) return;

        // Calculamos cuánto se ha movido el dedo/ratón
        const deltaX = e.clientX - previousMouse.current.x;
        const deltaY = e.clientY - previousMouse.current.y;

        // Sensibilidad: Ajustamos según el tamaño de la pantalla
        const sensitivity = 0.005;
        velocity.current.y = deltaX * sensitivity;
        velocity.current.x = deltaY * sensitivity;

        previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    // Adjuntamos los eventos al window para que no se corte el arrastre al salir del widget
    React.useEffect(() => {
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointermove', onPointerMove);
        return () => {
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointermove', onPointerMove);
        };
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;

        // Aplicamos la velocidad a la rotación actual
        rotation.current.y += velocity.current.y;
        rotation.current.x += velocity.current.x;

        // Fricción: La velocidad decae lentamente para dar fluidez (Inercia)
        velocity.current.y *= 0.95;
        velocity.current.x *= 0.95;

        // Rotación automática base (muy sutil)
        const t = state.clock.getElapsedTime();
        const autoRotate = Math.sin(t * 0.2) * 0.001;

        // Aplicamos al objeto
        groupRef.current.rotation.y = rotation.current.y + autoRotate;
        groupRef.current.rotation.x = THREE.MathUtils.clamp(rotation.current.x, -Math.PI / 3, Math.PI / 3);
    });

    return (
        <group ref={groupRef} onPointerDown={onPointerDown}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                {/* NÚCLEO: Oro */}
                <mesh scale={0.65}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.1} />
                </mesh>
                
                {/* CORAZA: Cristal */}
                <mesh scale={1.1}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshPhysicalMaterial 
                        transmission={1}
                        roughness={0.02}
                        thickness={1.5}
                        ior={1.5}
                        clearcoat={1}
                        clearcoatRoughness={0.02}
                        color="#ffffff"
                    />
                </mesh>

                {/* ESTRUCTURA: Oro Wireframe */}
                <mesh scale={1.102}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.1} wireframe />
                </mesh>
            </Float>
        </group>
    );
}

export default function EventsWidget({ isActive }: { isActive: boolean }) {
    if (!isActive) return null;

    return (
        <div className="relative w-full h-[350px] mb-12 border border-black/5 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing shadow-inner">
            <div 
                className="absolute inset-0 z-0" 
                style={{ background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #FAF9F6 70%, #e8e5df 100%)' }} 
            />

            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4.5], fov: 45 }} className="z-10">
                <ambientLight intensity={0.7} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <LuxuryGeometry />
                    <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={10} blur={3} />
                </Suspense>
            </Canvas>

            <div className="absolute bottom-4 w-full text-center text-[7px] tracking-[4px] text-black/20 uppercase font-mono pointer-events-none z-20">
                Swipe to rotate // Gold Standard
            </div>
        </div>
    );
}
