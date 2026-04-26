'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AuraVoidBackground() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Optimizamos el paso de variables al shader
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) }
  }), []);

  // 🚀 VANGUARD UPGRADE: Usamos el motor interno de R3F para el ratón
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.getElapsedTime();
      
      // state.pointer va de -1 a 1. Lo mapeamos de 0 a 1 para tu shader.
      material.uniforms.u_mouse.value.set(
        (state.pointer.x + 1) / 2,
        (state.pointer.y + 1) / 2
      );
    }
  });

  return (
    // 1. Z=-50 para mandarlo al fondo absoluto
    // 2. renderOrder={-1} para que la GPU lo pinte antes que la rueda
    <mesh ref={meshRef} position={[0, 0, -50]} renderOrder={-1}>
      {/* Hacemos el plano masivo para que cubra todo el campo de visión */}
      <planeGeometry args={[200, 200]} />
      <shaderMaterial
        transparent
        // REGLA DE ORO: No escribir en el Depth Buffer para no tapar los objetos 3D
        depthWrite={false} 
        depthTest={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv; 
          void main() { 
            vUv = uv; 
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
          }
        `}
        fragmentShader={`
          precision mediump float; 
          varying vec2 vUv; 
          uniform float u_time; 
          uniform vec2 u_mouse;

          float voronoi(vec2 x) { 
            vec2 n = floor(x); vec2 f = fract(x); float m = 8.0; 
            for(int j=-1; j<=1; j++) for(int i=-1; i<=1; i++) {
              vec2 g = vec2(float(i),float(j)); 
              float d = dot(g+fract(sin(dot(n+g,vec2(127.1,311.7)))*43758.5453)-f, g+fract(sin(dot(n+g,vec2(127.1,311.7)))*43758.5453)-f);
              if(d<m) m=d; 
            } return sqrt(m); 
          }

          void main() { 
            float v = voronoi(vUv * 4.0 + u_time * 0.04); 
            float glow = pow(1.0 - smoothstep(0.0, 0.55, length(vUv - u_mouse)), 3.0);
            vec3 dynamicColor = 0.6 + 0.4 * cos(u_time * 0.15 + vec3(0.0, 2.0, 4.0));
            gl_FragColor = vec4(vec3(v * 1.1) * dynamicColor, glow * 0.40); 
          }
        `}
      />
    </mesh>
  );
}
