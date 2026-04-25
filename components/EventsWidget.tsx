'use client';
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

function LuxuryGeometry() {
    const groupRef = useRef<THREE.Group>(null);
    
    // Referencias para la física manual (¡Intactas!)
    const isDragging = useRef(false);
    const previousMouse = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const rotation = useRef({ x: 0, y: 0 });

    const onPointerDown = (e: any) => {
        // e.nativeEvent nos da las coordenadas reales del ratón/dedo en la pantalla
        isDragging.current = true;
        previousMouse.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
    };

    const onPointerUp = () => {
        isDragging.current = false;
    };

    const onPointerMove = (e: any) => {
        if (!isDragging.current) return;

        const deltaX = e.clientX - previousMouse.current.x;
        const deltaY = e.clientY - previousMouse.current.y;

        const sensitivity = 0.005;
        velocity.current.y = deltaX * sensitivity;
        velocity.current.x = deltaY * sensitivity;

        previousMouse.current = { x: e.clientX, y: e.clientY };
    };

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

        rotation.current.y += velocity.current.y;
        rotation.current.x += velocity.current.x;

        velocity.current.y *= 0.95;
        velocity.current.x *= 0.95;

        const t = state.clock.getElapsedTime();
        const autoRotate = Math.sin(t * 0.2) * 0.001;

        groupRef.current.rotation.y = rotation.current.y + autoRotate;
        groupRef.current.rotation.x = THREE.MathUtils.clamp(rotation.current.x, -Math.PI / 3, Math.PI / 3);
    });

    return (
        // Añadimos el evento onPointerDown al grupo para capturar el click en el entorno 3D
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
        <group>
            {/* CAPA 1: EL FONDO HTML (Detrás de la geometría) */}
            <Html transform center distanceFactor={12} position={[0, 0, -0.5]}>
                <div className="relative w-[500px] h-[350px] border border-black/5 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing shadow-inner pointer-events-none">
                    <div 
                        className="absolute inset-0 z-0" 
                        style={{ background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #FAF9F6 70%, #e8e5df 100%)' }} 
                    />
                    <div className="absolute bottom-4 w-full text-center text-[8px] tracking-[4px] text-black/40 uppercase font-mono z-20">
                        Swipe to rotate // Gold Standard
                    </div>
                </div>
            </Html>

            {/* CAPA 2: LUCES Y 3D (Flotan sobre el fondo perla) */}
            {/* Solo dejamos la luz puntual. El ambiente ya lo provee el SceneManager. */}
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            
            <LuxuryGeometry />
            
            {/* Sombra proyectada en el fondo para dar más volumen */}
            <ContactShadows position={[0, -1.5, 0.1]} opacity={0.3} scale={10} blur={3} color="#000000" />
        </group>
    );
}
