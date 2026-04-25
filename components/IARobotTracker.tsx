'use client';
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. TÚNEL DE PARTÍCULAS (Grosor x3) ---
function CyberTunnel({ isActive }: { isActive: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 1500;
    const [positions] = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 2.5 + Math.random() * 5;
            p[i*3] = Math.cos(a) * r; p[i*3+1] = Math.sin(a) * r; p[i*3+2] = Math.random() * -15;
        }
        return [p];
    }, []);

    useFrame((_, delta) => {
        if (!pointsRef.current || !isActive) return;
        const attr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
            let z = attr.getZ(i); z += delta * 4;
            if (z > 5) z = -15;
            attr.setZ(i, z);
        }
        attr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
            <pointsMaterial 
                // 🚀 GROSOR TRIPLICADO: De 0.06 a 0.18
                size={0.18} 
                color="#00ffff" 
                transparent 
                opacity={isActive ? 0.6 : 0} 
                blending={THREE.AdditiveBlending} 
                depthWrite={false} 
            />
        </points>
    );
}

// --- 2. MODELO ROBOT (Centrado) ---
function RobotModel({ isActive }: { isActive: boolean }) {
    const { scene } = useGLTF('/robot_optimus.glb');
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        const targetX = state.mouse.x * 0.4;
        const targetY = -state.mouse.y * 0.2;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.1);
        const t = state.clock.getElapsedTime();
        groupRef.current.position.y = Math.sin(t * 0.5) * 0.1;
    });

    return (
        <group ref={groupRef} position={[0, -1.5, 0]}>
            <primitive object={scene} scale={3.8} />
        </group>
    );
}

// --- 3. HALO DE LUZ (ORBE) ---
function CyberHalo({ isActive }: { isActive: boolean }) {
    const mainRef = useRef<THREE.Group>(null);
    const spriteRef = useRef<THREE.Sprite>(null);

    const haloTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.2, 'rgba(0, 255, 255, 0.6)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(canvas);
    }, []);

    useFrame((state) => {
        if (!mainRef.current || !isActive) return;
        mainRef.current.position.x = THREE.MathUtils.lerp(mainRef.current.position.x, state.mouse.x * 7, 0.1);
        mainRef.current.position.y = THREE.MathUtils.lerp(mainRef.current.position.y, state.mouse.y * 4, 0.1);
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        if (spriteRef.current) spriteRef.current.scale.set(4 * pulse, 4 * pulse, 1);
    });

    return (
        <group ref={mainRef} position={[0, 0, 3]}>
            <sprite ref={spriteRef}>
                <spriteMaterial map={haloTexture} transparent blending={THREE.AdditiveBlending} opacity={isActive ? 0.8 : 0} />
            </sprite>
            <pointLight intensity={isActive ? 45 : 0} color="#00ffff" distance={12} />
        </group>
    );
}

// --- 4. EXPORTACIÓN ---
export default function IARobotTracker({ isActive }: { isActive: boolean }) {
    return (
        <group>
            <Environment preset="night" />
            <mesh position={[0, 0, -0.5]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#02040a" />
            </mesh>
            <CyberTunnel isActive={isActive} />
            <group position={[0, 0, 1]}>
                <Suspense fallback={null}>
                    <RobotModel isActive={isActive} />
                </Suspense>
            </group>
            <CyberHalo isActive={isActive} />
        </group>
    );
}

useGLTF.preload('/robot_optimus.glb');
