'use client';
import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';
import SystemCore, { WIDGETS_DATA } from './ServiceWheelContent';

// DATA DE LA INFOGRAFÍA HUD
const SCAN_DATA: any = {
  av: { metrics: ["FREQ: 440Hz", "RENDER: WEBGL", "GL_LAYER: ACTIVE"] },
  mk: { metrics: ["BIAS: DETECTED", "CTR_PROJ: 12%", "NEURO: SYNC"] },
  ai: { metrics: ["NODES: 1024", "LATENCY: 2ms", "PREDICT: 98%"] },
  br: { metrics: ["BRUT_IDX: 0.9", "GRID: CUSTOM", "VIBE: MAX"] },
  ev: { metrics: ["LOAD: MAX", "NODES: CLUSTER", "SYNC: OK"] }
};

// --- EL HUD GLOBAL (Inmune a la cámara) ---
function GlobalHUDOverlay({ activeIndex }: { activeIndex: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scroll = useScroll();
  
  const currentWidget = WIDGETS_DATA[activeIndex];
  const currentScan = SCAN_DATA[currentWidget.id];

  useFrame(() => {
    if (!containerRef.current) return;
    
    // Aparece progresivamente del 40% al 70% del scroll
    const progress = scroll.offset;
    let opacity = 0;
    if (progress > 0.4) {
      opacity = Math.min((progress - 0.4) * 3.33, 1);
    }
    
    containerRef.current.style.opacity = opacity.toString();
    containerRef.current.style.pointerEvents = opacity > 0.8 ? 'auto' : 'none';
  });

  return (
    <Html fullscreen zIndexRange={[100, 0]}>
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-8 transition-opacity duration-75"
        style={{ opacity: 0 }} // Valor inicial
      >
        {/* MARCO DE LA INFOGRAFÍA */}
        <div className="relative w-full max-w-5xl h-[70vh] flex flex-col justify-between p-8 font-mono text-white pointer-events-none">
          
          {/* TOP INFO */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs tracking-[0.4em] opacity-50">SYS.SCAN // ENTITY</div>
              <div className="text-4xl font-light tracking-widest uppercase mt-2" style={{ color: currentWidget.color, textShadow: `0 0 20px ${currentWidget.color}80` }}>
                {currentWidget.title}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs tracking-widest opacity-60">HUD_ACTIVE</span>
              <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: currentWidget.color }} />
            </div>
          </div>

          {/* LATERALES MÉTIRCOS */}
          <div className="flex justify-between items-end w-full">
            <div className="flex flex-col space-y-4 bg-black/40 backdrop-blur-md p-6 border-l-2" style={{ borderColor: currentWidget.color }}>
              {currentScan?.metrics.map((m: string, i: number) => {
                const [label, value] = m.split(':');
                return (
                  <div key={i} className="flex justify-between items-center w-48 border-b border-white/10 pb-2">
                    <span className="text-[10px] tracking-widest opacity-50">[{label}]</span>
                    <span className="text-[14px] font-bold tracking-tighter" style={{ color: currentWidget.color }}>{value}</span>
                  </div>
                );
              })}
            </div>

            {/* BOTÓN INTERACTIVO */}
            <button 
              className="px-8 py-4 text-xs tracking-[0.3em] uppercase bg-black/50 backdrop-blur-md border hover:bg-white hover:text-black transition-all duration-300 pointer-events-auto"
              style={{ borderColor: currentWidget.color }}
            >
              Initialize Protocol
            </button>
          </div>

          {/* ESQUINAS BRUTALISTAS GLOBALES */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 opacity-50" style={{ borderColor: currentWidget.color }} />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 opacity-50" style={{ borderColor: currentWidget.color }} />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 opacity-50" style={{ borderColor: currentWidget.color }} />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 opacity-50" style={{ borderColor: currentWidget.color }} />
        </div>
      </div>
    </Html>
  );
}

// --- RIG DE CÁMARA ---
function CameraRig() {
  const scroll = useScroll();
  useFrame((state) => {
    const zoomProgress = Math.min(scroll.offset * 2, 1);
    const targetY = THREE.MathUtils.lerp(12, 6.5, zoomProgress);
    const targetZ = THREE.MathUtils.lerp(45, 26.5, zoomProgress); 
    const targetRotX = THREE.MathUtils.lerp(-Math.PI / 10, 0, zoomProgress);
    
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.1);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.1);
  });
  return null;
}

export default function SceneManager() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <group>
      <ambientLight intensity={0.6} />
      <spotLight position={[0, 20, 20]} angle={0.5} penumbra={0.8} intensity={2.5} color="#8b5cf6" />
      <pointLight position={[0, -5, -15]} intensity={2} color="#4c1d95" distance={60} decay={2} />

      <CameraRig />

      <group position={[0, 0, 0]}>
        <SystemCore activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      </group>

      {/* 🔮 EL HUD SUPERPUESTO */}
      <GlobalHUDOverlay activeIndex={activeIndex} />
    </group>
  );
}
