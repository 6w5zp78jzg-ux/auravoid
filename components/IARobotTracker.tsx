'use client';
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. TÚNEL CON REPELSIÓN (Evita al robot y respeta el marco) ---
function CyberTunnel({ isActive }: { isActive: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 1800;

    // Dimensiones del marco: 16.5 x 9.5
    const BOUNDS_X = 8.25;
    const BOUNDS_Y = 4.75;
    const ROBOT_RADIUS = 3.5; // Radio de protección para que no atraviesen el busto

    const [positions, speeds] = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            // Spawn inicial fuera del radio del robot
            resetParticle(p, s, i, true);
        }
        return [p, s];
    }, []);

    function resetParticle(p: Float32Array, s: Float32Array, i: number, fullReset = false) {
        let x, y, dist;
        // Buscamos una posición que no esté dentro del radio del robot
        do {
            x = (Math.random() - 0.5) * 16.2;
            y = (Math.random() - 0.5) * 9.2;
            dist = Math.sqrt(x * x + y * y);
        } while (dist < ROBOT_RADIUS);

        p[i * 3] = x;
        p[i * 3 + 1] = y;
        p[i * 3 + 2] = fullReset ? (Math.random() * -15) : -15;
        s[i] = 0.05 + Math.random() * 0.1;
    }

    useFrame((_, delta) => {
        if (!pointsRef.current || !isActive) return;
        const attr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;

        for (let i = 0; i < count; i++) {
            let x = attr.getX(i);
            let y = attr.getY(i);
            let z = attr.getZ(i);

            z += delta * 6; // Velocidad de avance

            // 1. RESTRICCIÓN DE MARCO: Si se sale de los bordes 16.5x9.5
            const isOutsideFrame = Math.abs(x) > BOUNDS_X || Math.abs(y) > BOUNDS_Y;
            
            // 2. EVITAR ROBOT: Si entra en el radio central mientras avanza
            const distToCenter = Math.sqrt(x * x + y * y);
            const isCollidingWithRobot = distToCenter < ROBOT_RADIUS && z > -5;

            if (z > 5 || isOutsideFrame || isCollidingWithRobot) {
                resetParticle(attr.array as Float32Array, speeds, i);
            } else {
                attr.setZ(i, z);
            }
        }
        attr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial 
                size={0.18} // Grosor x3
                color="#00ffff" 
                transparent 
                opacity={isActive ? 0.7 : 0} 
                blending={THREE.AdditiveBlending} 
                depthWrite={false} 
            />
        </points>
    );
}

// --- 2. ROBOT CENTRADO ---
function RobotModel({ isActive }: { isActive: boolean }) {
    const { scene } = useGLTF('/robot_optimus.glb');
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !isActive) return;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.mouse.x * 0.4, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -state.mouse.y * 0.2, 0.1);
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    });

    return (
        // Posición ajustada para centro absoluto (y=0 o levemente inferior según busto)
        <group ref={groupRef} position={[0, -1.8, 0.5]}>
            <primitive object={scene} scale={3.8} />
        </group>
    );
}

// --- 3. HALO DE LUZ ---
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
        // Limitamos el movimiento del halo al marco
        ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, state.mouse.x * 7.5, 0.1);
        ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, state.mouse.y * 4, 0.1);
        const s = 4 + Math.sin(state.clock.elapsedTime * 5) * 0.5;
        if (spriteRef.current) spriteRef.current.scale.set(s, s, 1);
    });

    return (
        <group ref={ref} position={[0, 0, 3]}>
            <sprite ref={spriteRef}>
                <spriteMaterial map={texture} transparent blending={THREE.AdditiveBlending} opacity={isActive ? 0.8 : 0} />
            </sprite>
            <pointLight intensity={isActive ? 50 : 0} color="#00ffff" distance={10} />
        </group>
    );
}

export default function IARobotTracker({ isActive }: { isActive: boolean }) {
    return (
        <group>
            <Environment preset="night" />
            
            {/* FONDO OPACO PARA BLOQUEAR OVERFLOW */}
            <mesh position={[0, 0, -0.6]}>
                <planeGeometry args={[16.5, 9.5]} />
                <meshBasicMaterial color="#010205" />
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
