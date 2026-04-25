'use client';
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. TÚNEL CONFINADO (Muros Invisibles 16.5 x 9.5) ---
function CyberTunnel({ isActive }: { isActive: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 1500;

    const [positions] = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // 📐 LIMITAMOS EL NACIMIENTO: 
            // X debe estar entre -8.25 y 8.25
            // Y debe estar entre -4.75 y 4.75
            const x = (Math.random() - 0.5) * 16.2; // Un poco menos de 16.5 para seguridad
            const y = (Math.random() - 0.5) * 9.2;  // Un poco menos de 9.5 para seguridad
            
            // Creamos el hueco central para no tapar la cara del robot
            const dist = Math.sqrt(x*x + y*y);
            if (dist < 2) {
                p[i*3] = x * 3; p[i*3+1] = y * 3; // Las alejamos del centro
            } else {
                p[i*3] = x; p[i*3+1] = y;
            }
            
            p[i*3+2] = Math.random() * -15;
        }
        return [p];
    }, [count]);

    useFrame((_, delta) => {
        if (!pointsRef.current || !isActive) return;
        const attr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
        
        for (let i = 0; i < count; i++) {
            let z = attr.getZ(i);
            let x = attr.getX(i);
            let y = attr.getY(i);

            z += delta * 5; // Velocidad

            // 🚀 RESTRICCIÓN ESTRICTA:
            // Si la partícula se sale de los bordes del panel mientras avanza,
            // o si llega al frente (z > 5), la reseteamos al fondo.
            if (z > 5 || Math.abs(x) > 8.2 || Math.abs(y) > 4.7) {
                z = -15;
                // Al resetear, nos aseguramos de que nazca dentro del marco
                attr.setX(i, (Math.random() - 0.5) * 16.2);
                attr.setY(i, (Math.random() - 0.5) * 9.2);
            }
            
            attr.setZ(i, z);
        }
        attr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
            <pointsMaterial 
                size={0.18} // 🚀 Grosor x3 mantenido
                color="#00ffff" 
                transparent 
                opacity={isActive ? 0.6 : 0} 
                blending={THREE.AdditiveBlending} 
                depthWrite={false} 
            />
        </points>
    );
}

// --- 2. RESTO DE COMPONENTES (Robot Centrado y Halo) ---
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
        <group ref={groupRef} position={[0, -1.5, 0]}>
            <primitive object={scene} scale={3.8} />
        </group>
    );
}

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
        // 🚀 LIMITAMOS EL MOVIMIENTO DEL ORBE TAMBIÉN AL MARCO
        mainRef.current.position.x = THREE.MathUtils.lerp(mainRef.current.position.x, state.mouse.x * 7.5, 0.1);
        mainRef.current.position.y = THREE.MathUtils.lerp(mainRef.current.position.y, state.mouse.y * 4.2, 0.1);
        
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

export default function IARobotTracker({ isActive }: { isActive: boolean }) {
    return (
        <group>
            <Environment preset="night" />
            
            {/* 🛑 EL FONDO OPACO: Crucial para que no se vea nada detrás */}
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
