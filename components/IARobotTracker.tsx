'use client';
import React, { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. SISTEMA DE PARTÍCULAS "TÚNEL" ---
function StarfieldParticles({ count = 3000, visible = true }) {
    const pointsRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const radius = 1.5 + Math.random() * 6; 
            const theta = Math.random() * Math.PI * 2;
            positions[i * 3 + 0] = Math.cos(theta) * radius; 
            positions[i * 3 + 1] = Math.sin(theta) * radius; 
            positions[i * 3 + 2] = Math.random() * -15;        
        }
        return positions;
    }, [count]);

    useFrame((state, delta) => {
        if (!pointsRef.current || !visible) return;
        const positionAttribute = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
            let z = positionAttribute.getZ(i);
            z += delta * 3; 
            if (z > 0) z = -15; 
            positionAttribute.setZ(i, z);
        }
        positionAttribute.needsUpdate = true;
    });

    return (
        <points ref={pointsRef} visible={visible}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[particles, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}             
                color="#00ffff" 
                transparent
                opacity={0.6}           
                blending={THREE.AdditiveBlending} 
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

// --- 2. LUZ DINÁMICA ---
function DynamicLight({ mousePos, visible }: { mousePos: { x: number, y: number }, visible: boolean }) {
    const lightRef = useRef<THREE.PointLight | null>(null);
    useFrame(() => {
        if (!lightRef.current || !visible) return;
        lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, mousePos.x * 2.5, 0.1);
        lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, mousePos.y * 2, 0.1);
    });
    return <pointLight ref={lightRef} intensity={visible ? 35 : 0} color="#00ffff" distance={10} decay={2} />;
}

// --- 3. EL ROBOT REAL ---
function RobotModel({ visible, mousePos }: { visible: boolean, mousePos: { x: number, y: number } }) {
    const { scene } = useGLTF('/robot_optimus.glb'); 
    const groupRef = useRef<THREE.Group | null>(null);

    useFrame(() => {
        if (!visible || !groupRef.current) return;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mousePos.x * (Math.PI / 8), 0.08);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mousePos.y * (Math.PI / 15), 0.08);
    });

    return (
        <group ref={groupRef} position={[0, -2, -1.5]} visible={visible}> 
            <primitive object={scene} scale={2.8} /> 
        </group>
    );
}

// --- 4. PANEL PRINCIPAL HÍBRIDO ---
export default function IARobotTracker({ isActive }: { isActive: boolean }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const lightBallRef = useRef<HTMLDivElement>(null);

    const handlePointerMove = (e: React.PointerEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        setMousePos({ x, y });

        if (lightBallRef.current) {
            lightBallRef.current.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px)`;
        }
    };

    return (
        <group>
            {/* CAPA 1: EL MARCO HTML (Siempre montado, pero invisible si no es su turno) */}
            <Html 
                transform 
                center 
                distanceFactor={8} 
                position={[0, 0, 0.1]}
                style={{
                    pointerEvents: isActive ? 'auto' : 'none',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out'
                }}
            >
                <div 
                    className="relative w-[800px] h-[500px] border border-cyan-500/30 bg-[#030303]/80 rounded-xl overflow-hidden cursor-crosshair touch-none"
                    onPointerMove={handlePointerMove}
                >
                    {/* TEXTO DE SERVICIO SIEMPRE VISIBLE */}
                    <div className="absolute top-10 left-10 z-30">
                        <h2 className="text-6xl font-bold text-cyan-400 tracking-tighter uppercase">IA & Robot</h2>
                        <div className="h-1 w-20 bg-cyan-400 mt-2" />
                    </div>

                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-[#030303] to-black pointer-events-none z-0" />

                    {/* ORBE HTML */}
                    <div ref={lightBallRef} className="absolute left-0 top-0 w-0 h-0 pointer-events-none z-20">
                        <div className="absolute -translate-x-1/2 -translate-y-1/2">
                            <div className="w-10 h-10 bg-white rounded-full blur-[2px] shadow-[0_0_40px_#00ffff]" />
                        </div>
                    </div>
                </div>
            </Html>

            {/* CAPA 2: EL MOTOR WEBGL */}
            <DynamicLight mousePos={mousePos} visible={isActive} />

            <Suspense fallback={null}>
                <StarfieldParticles count={2000} visible={isActive} />
                <RobotModel visible={isActive} mousePos={mousePos} />
            </Suspense>
        </group>
    );
}

useGLTF.preload('/robot_optimus.glb');
