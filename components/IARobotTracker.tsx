'use client';
import React, { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. SISTEMA DE PARTÍCULAS "TÚNEL" (Optimizado para Hero) ---
function StarfieldParticles({ count = 2000, visible = true }) {
    const pointsRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const radius = 2 + Math.random() * 8; 
            const theta = Math.random() * Math.PI * 2;
            positions[i * 3 + 0] = Math.cos(theta) * radius; 
            positions[i * 3 + 1] = Math.sin(theta) * radius; 
            positions[i * 3 + 2] = Math.random() * -20;        
        }
        return positions;
    }, [count]);

    useFrame((state, delta) => {
        if (!pointsRef.current || !visible) return;
        const positionAttribute = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
            let z = positionAttribute.getZ(i);
            z += delta * 5; // Más velocidad para sensación de potencia
            if (z > 2) z = -20; 
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
                size={0.1}             
                color="#00ffff" 
                transparent
                opacity={0.4}           
                blending={THREE.AdditiveBlending} 
                depthWrite={false}
            />
        </points>
    );
}

// --- 2. EL ROBOT REAL (Escalado Masivo) ---
function RobotModel({ visible, mousePos }: { visible: boolean, mousePos: { x: number, y: number } }) {
    const { scene } = useGLTF('/robot_optimus.glb'); 
    const groupRef = useRef<THREE.Group | null>(null);

    useFrame(() => {
        if (!visible || !groupRef.current) return;
        // Rotación sutil que sigue al ratón
        const targetRotY = mousePos.x * (Math.PI / 10);
        const targetRotX = mousePos.y * (Math.PI / 20);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={groupRef} position={[0, -3.5, -0.5]} visible={visible}> 
                <primitive object={scene} scale={4.2} /> {/* 🚀 Escalado imponente */}
            </group>
        </Float>
    );
}

// --- 3. PANEL PRINCIPAL HÍBRIDO ---
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
            {/* CAPA 1: EL MARCO HTML (HUD Tecnológico) */}
            <Html 
                transform 
                center 
                distanceFactor={8} 
                position={[0, 0, 0.2]} // 🚀 Un poco por delante del robot
                style={{
                    pointerEvents: isActive ? 'auto' : 'none',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out'
                }}
            >
                <div 
                    className="relative w-[850px] h-[550px] border border-cyan-500/20 bg-black/40 rounded-3xl overflow-hidden cursor-crosshair touch-none backdrop-blur-[2px]"
                    onPointerMove={handlePointerMove}
                >
                    {/* UI HUD: Esquinas y datos técnicos */}
                    <div className="absolute inset-0 p-10 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h2 className="text-7xl font-black text-cyan-400 tracking-tighter uppercase italic">AI ENGINE</h2>
                                <p className="text-cyan-400/50 font-mono text-sm tracking-[0.3em]">CORE V.O.I.D // NEURAL LINK</p>
                            </div>
                            <div className="text-right font-mono text-[10px] text-cyan-400/30">
                                <p>STATUS: ACTIVE</p>
                                <p>LATENCY: 0.002ms</p>
                                <p>SYNC: STABLE</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-end border-t border-cyan-500/10 pt-6">
                            <div className="text-cyan-400/40 font-mono text-[10px] uppercase">
                                Neural Architecture // 2026
                            </div>
                            <div className="w-32 h-1 bg-cyan-900/50 overflow-hidden">
                                <div className="h-full bg-cyan-400 w-1/2 animate-[pulse_2s_infinite]" />
                            </div>
                        </div>
                    </div>

                    {/* Efecto de escaneo horizontal sutil */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-20 w-full animate-[scan_4s_linear_infinite] pointer-events-none" />

                    {/* ORBE DE LUZ TÁCTIL */}
                    <div ref={lightBallRef} className="absolute left-0 top-0 w-0 h-0 pointer-events-none z-50">
                        <div className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
                    </div>
                </div>
            </Html>

            {/* CAPA 2: LUCES Y MOTOR 3D */}
            <spotLight position={[5, 5, 10]} intensity={isActive ? 10 : 0} color="#00ffff" angle={0.5} />
            <pointLight position={[0, 0, 5]} intensity={isActive ? 2 : 0} color="#ffffff" />
            
            <Suspense fallback={null}>
                <StarfieldParticles count={2500} visible={isActive} />
                <RobotModel visible={isActive} mousePos={mousePos} />
            </Suspense>
        </group>
    );
}

useGLTF.preload('/robot_optimus.glb');
