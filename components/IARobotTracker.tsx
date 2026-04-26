'use client';
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. TÚNEL DE DATOS INFINITO ---
function CyberTunnel({ isActive }: { isActive: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 2000;
    
    const LIMIT_X = 8.15;
    const LIMIT_Y = 4.65;
    const START_Z = 2;
    const END_Z = -15;
    const ROBOT_SAFE_ZONE = 3.2;

    const [positions, speeds] = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            spawnParticle(p, i, true); 
            s[i] = 4 + Math.random() * 6; 
        }
        return [p, s];
    }, []);

    function spawnParticle(arr: Float32Array, i: number, randomZ = false) {
        let x, y, dist;
        do {
            x = (Math.random() - 0.5) * (LIMIT_X * 2);
            y = (Math.random() - 0.5) * (LIMIT_Y * 2);
            dist = Math.sqrt(x * x + y * y);
        } while (dist < ROBOT_SAFE_ZONE);

        arr[i * 3 + 0] = x;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = randomZ ? (Math.random() * (START_Z - END_Z) + END_Z) : START_Z;
    }

    useFrame((state, delta) => {
        if (!pointsRef.current || !isActive) return;
        const attr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;

        for (let i = 0; i < count; i++) {
            let z = attr.getZ(i);
            z -= speeds[i] * delta;

            if (z < END_Z) {
                spawnParticle(attr.array as Float32Array, i, false);
            } else {
                attr.setZ(i, z);
            }
        }
        attr.needsUpdate = true;
    });

    return (
        // 🚀 CORTAFUEGOS DE GPU: Si no está activo, la tarjeta gráfica ignora las 2000 partículas
        <points ref={pointsRef} visible={isActive}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial 
                size={0.18} 
                color="#00ffff" 
                transparent 
                opacity={isActive ? 0.8 : 0} 
                blending={THREE.AdditiveBlending} 
                depthWrite={false}
                sizeAttenuation={true}
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
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.mouse.x * 0.3, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -state.mouse.y * 0.15, 0.1);
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    });

    return (
        // 🚀 CORTAFUEGOS DE GPU: Ocultar el grupo del robot elimina miles de polígonos de la memoria de render
        <group ref={groupRef} position={[0, -1.8, 0]} visible={isActive}>
            <primitive object={scene} scale={3.8} />
        </group>
    );
}

// --- 3. HALO DE LUZ INTERACTIVO ---
function CyberHalo({ isActive }: { isActive: boolean }) {
    const ref = useRef<THREE.Group>(null);
    const spriteRef = useRef<THREE.Sprite>(null);

    const texture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        const ctx = c.getContext('2d')!;
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'white'); g.addColorStop(0.2, 'cyan'); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
    }, []);

    useFrame((state) => {
        if (!ref.current || !isActive) return;
        ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, state.mouse.x * 7.5, 0.1);
        ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, state.mouse.y * 4, 0.1);
        const s = 4 + Math.sin(state.clock.elapsedTime * 4) * 0.4;
        if (spriteRef.current) spriteRef.current.scale.set(s, s, 1);
    });

    return (
        // 🚀 CORTAFUEGOS DE GPU: Apaga las texturas de luz que requieren mezcla
        <group ref={ref} position={[0, 0, 2.5]} visible={isActive}>
            <sprite ref={spriteRef}>
                <spriteMaterial map={texture} transparent blending={THREE.AdditiveBlending} opacity={isActive ? 0.7 : 0} />
            </sprite>
            <pointLight intensity={isActive ? 60 : 0} color="#00ffff" distance={15} />
        </group>
    );
}

// --- 4. EXPORTACIÓN ---
export default function IARobotTracker({ isActive }: { isActive: boolean }) {
    return (
        <group>
            {/* 🚀 CORTAFUEGOS DE ENTORNO: El mapa HDRI solo existe cuando lo miramos */}
            {isActive && <Environment preset="night" />}
            
            <mesh position={[0, 0, -0.6]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#010204" />
            </mesh>

            <CyberTunnel isActive={isActive} />

            <group position={[0, 0, 0.5]}>
                <Suspense fallback={null}>
                    <RobotModel isActive={isActive} />
                </Suspense>
            </group>

            <CyberHalo isActive={isActive} />
        </group>
    );
}

useGLTF.preload('/robot_optimus.glb');
