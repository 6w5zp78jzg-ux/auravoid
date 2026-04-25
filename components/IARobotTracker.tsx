'use client';
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Float, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. MODELO DEL ROBOT (Cuello y Cabeza reactivos) ---
function RobotModel({ isActive }: { isActive: boolean }) {
    const { scene } = useGLTF('/robot_optimus.glb'); 
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        
        // El robot sigue sutilmente el movimiento del ratón/dedo
        const targetRotationY = state.mouse.x * (Math.PI / 10); 
        const targetRotationX = -state.mouse.y * (Math.PI / 20); 
        
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
        
        // Flotación sutil de respiración
        const t = state.clock.getElapsedTime();
        groupRef.current.position.y = -2.5 + Math.sin(t * 0.5) * 0.1;
    });

    return (
        <group ref={groupRef} position={[0, -2.5, 0]}> 
            {/* Escala aumentada para que el busto llene el marco */}
            <primitive object={scene} scale={3.5} /> 
        </group>
    );
}

// --- 2. EL TÚNEL DE PARTÍCULAS (Integrado) ---
function Starfield({ isActive }: { isActive: boolean }) {
    return (
        <group scale={1.5}>
            <Stars 
                radius={10} 
                depth={50} 
                count={2000} 
                factor={4} 
                saturation={0} 
                fade 
                speed={isActive ? 2 : 0.5} 
            />
        </group>
    );
}

// --- 3. COMPONENTE PRINCIPAL ---
export default function IARobotTracker({ isActive }: { isActive: boolean }) {
    
    // Generamos el fondo tecnológico (Azul profundo a Negro)
    const techBackground = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const grad = ctx.createRadialGradient(512, 512, 0, 512, 512, 800);
            grad.addColorStop(0, '#0f172a'); // Slate 900
            grad.addColorStop(1, '#000000');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1024, 1024);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, []);

    return (
        <group>
            {/* 💡 ILUMINACIÓN DE PRECISIÓN (Cian Cyberpunk) */}
            <pointLight position={[0, 0, 5]} intensity={isActive ? 40 : 0} color="#00ffff" />
            <spotLight 
                position={[5, 5, 5]} 
                angle={0.15} 
                penumbra={1} 
                intensity={isActive ? 20 : 0} 
                color="#ffffff" 
            />
            <Environment preset="night" />

            {/* CAPA 1: FONDO TÉCNICO */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial map={techBackground} transparent opacity={isActive ? 1 : 0.4} />
            </mesh>

            {/* CAPA 2: SISTEMA DE PARTÍCULAS (Z-Depth medio) */}
            <group position={[0, 0, 0.5]}>
                <Starfield isActive={isActive} />
            </group>

            {/* CAPA 3: ROBOT (Hero) */}
            <group position={[0, 0, 1.2]}>
                <Suspense fallback={null}>
                    <RobotModel isActive={isActive} />
                </Suspense>
            </group>

            {/* CAPA 4: EL ORBE DE LUZ (Ahora es un objeto 3D real) */}
            <OrbeSeguimiento isActive={isActive} />
        </group>
    );
}

// --- 4. ORBE DE LUZ 3D (Sigue al ratón en el espacio del widget) ---
function OrbeSeguimiento({ isActive }: { isActive: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current || !isActive) return;
        // Mapeamos el ratón al tamaño del widget
        const x = state.mouse.x * 7;
        const y = state.mouse.y * 4;
        meshRef.current.position.set(x, y, 2.5);
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
            <pointLight intensity={isActive ? 30 : 0} color="#00ffff" distance={10} />
            {/* Halo de resplandor */}
            <mesh scale={4}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.1} />
            </mesh>
        </mesh>
    );
}

useGLTF.preload('/robot_optimus.glb');
