'use client';
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. PARTÍCULAS DE TÚNEL (Locales del panel) ---
function CyberTunnel({ isActive }: { isActive: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 2000;

    const [positions, sizes] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const s = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            // Efecto de anillo/túnel
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 5; 
            pos[i * 3 + 0] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = Math.sin(angle) * radius;
            pos[i * 3 + 2] = Math.random() * -15; 
            s[i] = Math.random();
        }
        return [pos, s];
    }, [count]);

    useFrame((state, delta) => {
        if (!pointsRef.current || !isActive) return;
        const attr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;

        for (let i = 0; i < count; i++) {
            let z = attr.getZ(i);
            z += delta * 5; // Velocidad del túnel
            if (z > 5) z = -15; // Reinicio al fondo
            attr.setZ(i, z);
        }
        attr.needsUpdate = true;
        // Rotación leve del túnel completo
        pointsRef.current.rotation.z += delta * 0.1;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.06}
                color="#00ffff"
                transparent
                opacity={isActive ? 0.6 : 0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

// --- 2. MODELO ROBOT ---
function RobotModel({ isActive }: { isActive: boolean }) {
    const { scene } = useGLTF('/robot_optimus.glb');
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        // Seguimiento suave del cursor
        const x = state.mouse.x * 0.4;
        const y = -state.mouse.y * 0.2;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, y, 0.1);
    });

    return (
        <group ref={groupRef} position={[0, -2.8, 0]}>
            <primitive object={scene} scale={3.8} />
        </group>
    );
}

// --- 3. WIDGET PRINCIPAL ---
export default function IARobotTracker({ isActive }: { isActive: boolean }) {
    
    // Fondo semitransparente para dejar ver las partículas globales de atrás
    const techBg = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
            grad.addColorStop(0, 'rgba(15, 23, 42, 0.9)'); // Azul tech
            grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');     // Transparencia en bordes
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 512, 512);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <group>
            {/* Iluminación Cyberpunk */}
            <pointLight position={[2, 2, 5]} intensity={isActive ? 45 : 0} color="#00ffff" />
            <Environment preset="night" />

            {/* Fondo del panel (Semitransparente) */}
            <mesh position={[0, 0, -0.5]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial map={techBg} transparent opacity={isActive ? 0.8 : 0.2} />
            </mesh>

            {/* Capa de partículas NUEVAS (Túnel) */}
            <CyberTunnel isActive={isActive} />

            {/* El Robot */}
            <group position={[0, 0, 1]}>
                <Suspense fallback={null}>
                    <RobotModel isActive={isActive} />
                </Suspense>
            </group>

            {/* Orbe de luz interactivo */}
            <CyberOrbe isActive={isActive} />
        </group>
    );
}

function CyberOrbe({ isActive }: { isActive: boolean }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!ref.current || !isActive) return;
        ref.current.position.set(state.mouse.x * 7, state.mouse.y * 4, 3);
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
            <pointLight intensity={isActive ? 30 : 0} color="#00ffff" distance={10} />
        </mesh>
    );
}

useGLTF.preload('/robot_optimus.glb');
