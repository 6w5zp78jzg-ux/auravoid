'use client';
import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. SISTEMA DE PARTÍCULAS "TÚNEL" (Más brillantes y sin colisión) ---
function StarfieldParticles({ count = 3000 }) {
    const pointsRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Creamos un efecto de túnel: las partículas no nacen en el centro (0,0)
            // para no atravesar la cara del robot.
            const radius = 1.5 + Math.random() * 6; // Radio mínimo de 1.5 para esquivar al robot
            const theta = Math.random() * Math.PI * 2;
            
            positions[i * 3 + 0] = Math.cos(theta) * radius; // X
            positions[i * 3 + 1] = Math.sin(theta) * radius; // Y
            positions[i * 3 + 2] = Math.random() * -15;        // Z (más profundidad)
        }
        return positions;
    }, [count]);

    useFrame((state, delta) => {
        if (!pointsRef.current) return;
        const positionAttribute = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;

        for (let i = 0; i < count; i++) {
            let z = positionAttribute.getZ(i);
            z += delta * 3; // Velocidad de avance aumentada
            
            if (z > state.camera.position.z) {
                z = -15; // Reiniciar al fondo del túnel
            }
            positionAttribute.setZ(i, z);
        }
        positionAttribute.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particles, 3]} 
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}             // Partículas más grandes
                color="#00ffff" 
                transparent
                opacity={0.9}           // Mucho más brillantes
                blending={THREE.AdditiveBlending} // Suma de luz para efecto neón
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

// --- 2. LUZ DINÁMICA ---
function DynamicLight({ mousePos }: { mousePos: { x: number, y: number } }) {
    const lightRef = useRef<THREE.PointLight | null>(null);

    useFrame(() => {
        if (!lightRef.current) return;
        const targetX = mousePos.x * 2.5;
        const targetY = mousePos.y * 2;
        lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, 0.1);
        lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, targetY, 0.1);
    });

    return (
        <pointLight 
            ref={lightRef} 
            position={[0, 0, 2]} 
            intensity={35} 
            color="#00ffff" 
            distance={10} 
            decay={2}
        />
    );
}

// --- 3. EL ROBOT REAL (Busto enfocado) ---
function RobotModel({ isActive, mousePos }: { isActive: boolean, mousePos: { x: number, y: number } }) {
    const { scene } = useGLTF('/robot_optimus.glb'); 
    const groupRef = useRef<THREE.Group | null>(null);

    useFrame(() => {
        if (!isActive || !groupRef.current) return;
        const targetRotationY = mousePos.x * (Math.PI / 8); 
        const targetRotationX = mousePos.y * (Math.PI / 15); 
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.08);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.08);
    });

    return (
        <group ref={groupRef} position={[0, -0.6, 0]}> 
            <primitive object={scene} scale={2.2} /> 
        </group>
    );
}

// --- 4. PANEL PRINCIPAL ---
export default function IARobotTracker({ isActive }: { isActive: boolean }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const lightBallRef = useRef<HTMLDivElement>(null);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isActive) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        setMousePos({ x, y });

        if (lightBallRef.current) {
            const pointerX = e.clientX - rect.left;
            const pointerY = e.clientY - rect.top;
            lightBallRef.current.style.transform = `translate(${pointerX}px, ${pointerY}px)`;
        }
    };

    return (
        <div 
            className="relative w-full h-[350px] mb-12 border border-white/5 bg-[#030303] rounded-xl overflow-hidden cursor-crosshair touch-none"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => {
                setMousePos({ x: 0, y: 0 });
                if (lightBallRef.current) lightBallRef.current.style.opacity = '0';
            }}
            onPointerEnter={() => {
                if (lightBallRef.current) lightBallRef.current.style.opacity = '1';
            }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0f172a] via-[#030303] to-black opacity-90 pointer-events-none z-0" />

            <div className="absolute inset-0 z-10 pointer-events-none">
                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 3.8], fov: 45 }}>
                    <ambientLight intensity={0.8} /> 
                    <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={6} color="#ffffff" castShadow />
                    <hemisphereLight intensity={0.5} groundColor="#000000" color="#ffffff" />
                    
                    <DynamicLight mousePos={mousePos} />

                    <Suspense fallback={null}>
                        {/* Partículas detrás y a los lados */}
                        <StarfieldParticles count={3500} />
                        <RobotModel isActive={isActive} mousePos={mousePos} />
                    </Suspense>
                </Canvas>
            </div>

            {/* ORBE HTML */}
            <div 
                ref={lightBallRef} 
                className="absolute left-0 top-0 w-0 h-0 pointer-events-none z-20 transition-opacity duration-300 ease-out"
                style={{ opacity: isActive ? 1 : 0 }}
            >
                <div className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="absolute w-10 h-10 bg-white rounded-full blur-[1px] shadow-[0_0_40px_#fff,0_0_80px_#fff,0_0_120px_#00ffff]" />
                    <div className="absolute w-28 h-28 bg-cyan-400/60 rounded-full blur-[15px] mix-blend-screen animate-pulse" />
                    <div className="absolute w-44 h-44 bg-blue-500/40 rounded-full blur-[30px] mix-blend-screen" />
                </div>
            </div>
        </div>
    );
}

useGLTF.preload('/robot_optimus.glb');
