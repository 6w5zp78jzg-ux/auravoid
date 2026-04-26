'use client';
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';

// 🌐 IMPORTACIONES DE WIDGETS
import AudiovisualWidget from './AudiovisualWidget';
import MarketingWidget from './MarketingWidget';
import IARobotTracker from './IARobotTracker';
import BrandingWidget from './BrandingWidget';
import EventsWidget from './EventsWidget';

// 🧠 DATA HUD (AURA & VOID)
const SCAN_DATA: any = {
  av: { tag: "VISUAL_ENGINE", metrics: ["FREQ: 440Hz", "GL_LAYER: ACTIVE"] },
  mk: { tag: "MARKETING_CORE", metrics: ["BIAS: DETECTED", "NEURO: SYNC"] },
  ai: { tag: "AI_CORE", metrics: ["NODES: 1024", "LATENCY: 2ms"] },
  br: { tag: "BRAND_CORE", metrics: ["BRUT_IDX: 0.9", "VIBE: 100"] },
  ev: { tag: "EVENT_CORE", metrics: ["LOAD: MAX", "SYNC: OK"] }
};

const WIDGETS_DATA = [
  { id: 'av', Component: AudiovisualWidget, color: '#ff1493' },
  { id: 'mk', Component: MarketingWidget, color: '#4169e1' },
  { id: 'ai', Component: IARobotTracker, color: '#00fa9a' },
  { id: 'br', Component: BrandingWidget, color: '#ffff00' },
  { id: 'ev', Component: EventsWidget, color: '#9932cc' }
];

// --- 🔮 VANGUARD UPGRADE: INFOGRAFÍA HUD DE ALTO RENDIMIENTO ---
function AuraVoidHUD({ data, color, isFront }: { data: any, color: string, isFront: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!containerRef.current) return;
    
    // Matemática balística: Solo aparece si está de frente y el scroll cruza el 50%
    let targetOpacity = 0;
    if (isFront && scroll.offset > 0.5) {
      targetOpacity = Math.min((scroll.offset - 0.5) * 5, 1); 
    }

    // Mutación directa del DOM a 60fps (Bypass virtual DOM)
    containerRef.current.style.opacity = targetOpacity.toString();
    containerRef.current.style.transform = `scale(${0.9 + (targetOpacity * 0.1)})`;
    containerRef.current.style.pointerEvents = targetOpacity > 0.5 ? 'auto' : 'none';
  });

  return (
    <Html
      transform
      center
      distanceFactor={6} // Escala calibrada
      position={[0, 0, 0.6]} // Proyectado por delante del widget
      zIndexRange={[100, 0]} // Prioridad absoluta de renderizado
    >
      <div 
        ref={containerRef}
        style={{ opacity: 0, transition: 'none' }} // Controlado por useFrame
        className="w-[500px] h-[300px] flex flex-col justify-between p-6 font-mono text-white border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl"
      >
        {/* HEADER: Escaneo */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] tracking-[0.4em] opacity-50 mb-1">AURA_VOID // SYS.SCAN</div>
            <div className="text-2xl font-light tracking-widest uppercase" style={{ color, textShadow: `0 0 15px ${color}80` }}>
              {data?.tag}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] tracking-widest opacity-40 animate-pulse">ACTIVE</span>
            <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: color }} />
          </div>
        </div>
        
        {/* BODY: Métricas */}
        <div className="flex-grow flex flex-col justify-center space-y-4 py-4">
          {data?.metrics.map((m: string, i: number) => {
            const [label, value] = m.split(':');
            return (
              <div key={i} className="flex justify-between items-end border-b border-white/5 pb-1">
                <span className="text-[12px] tracking-widest opacity-60">[{label}]</span>
                <span className="text-[14px] font-bold tracking-tighter" style={{ color }}>{value}</span>
              </div>
            );
          })}
        </div>

        {/* FOOTER: Botón */}
        <div className="pt-4 flex justify-between items-end border-t border-white/10">
          <div className="text-[8px] opacity-30 tracking-widest uppercase max-w-[50%] leading-relaxed">
            Neural link established. Ready for entity deployment.
          </div>
          <button 
            className="px-6 py-2 text-[10px] tracking-[0.2em] uppercase border hover:bg-white hover:text-black transition-colors duration-300 pointer-events-auto"
            style={{ borderColor: color }}
          >
            Deploy
          </button>
        </div>
        
        {/* Decoración Brutalista (Esquinas) */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 opacity-50" style={{ borderColor: color }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 opacity-50" style={{ borderColor: color }} />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 opacity-50" style={{ borderColor: color }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 opacity-50" style={{ borderColor: color }} />
      </div>
    </Html>
  );
}

// --- ⚙️ CORE SYSTEM: RUEDA Y FÍSICA ---
export default function ServiceWheelContent({ activeIndex, setActiveIndex }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  
  // FÍSICA INDESTRUCTIBLE
  const isDragging = useRef(false);
  const rotationRef = useRef(0);
  const velocity = useRef(0);
  const faceAngle = (Math.PI * 2) / 5;

  const onPointerDown = (e: any) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
  };

  const onPointerMove = (e: any) => {
    if (!isDragging.current) return;
    // movementX ignora el scroll y lee el arrastre crudo del ratón/dedo
    const delta = e.movementX * 0.005; 
    velocity.current = delta;
    rotationRef.current += delta;
  };

  const onPointerUp = (e: any) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  useFrame(() => {
    if (!groupRef.current) return;

    if (!isDragging.current) {
      velocity.current *= 0.92; // Fricción
      rotationRef.current += velocity.current;

      // Imán de centrado
      const targetSnap = Math.round(rotationRef.current / faceAngle) * faceAngle;
      // Más fuerza magnética si el usuario está haciendo zoom
      const lerpFactor = scroll.offset > 0.1 ? 0.15 : 0.04;
      rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetSnap, lerpFactor);
    }

    // Actualiza el índice en tiempo real para el HUD y el chasis
    let index = Math.round(-rotationRef.current / faceAngle) % 5;
    if (index < 0) index += 5;
    if (index !== activeIndex) setActiveIndex(index);

    groupRef.current.rotation.y = rotationRef.current;
  });

  return (
    <group ref={groupRef} position={[0, 6.5, 0]}>
      
      {/* 🛡️ HITBOX DE EVENTOS ABSOLUTA
          Atrapa el drag sin importar los z-index de los paneles */}
      <mesh 
        visible={false} 
        onPointerDown={onPointerDown} 
        onPointerMove={onPointerMove} 
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp} // Corta el drag si el ratón sale disparado
      >
        <cylinderGeometry args={[15, 15, 12, 16]} />
      </mesh>

      {/* RENDERIZADO DE LOS PANELES */}
      {WIDGETS_DATA.map((widget, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 11.35;
        const isFront = i === activeIndex;

        return (
          <group 
            key={widget.id} 
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} 
            rotation={[0, angle, 0]}
          >
            {/* CHASIS */}
            <mesh>
              <boxGeometry args={[16.5, 9.5, 0.4]} />
              <meshStandardMaterial color="#050505" metalness={1} roughness={0.4} />
              <Edges color={widget.color} threshold={15} transparent opacity={isFront ? 1 : 0.1} />
            </mesh>

            {/* WIDGET ORIGINAL */}
            <group position={[0, 0, 0.35]}>
              <widget.Component isActive={isFront} />
            </group>

            {/* HOLOGRAMA HUD */}
            <AuraVoidHUD 
              data={SCAN_DATA[widget.id]} 
              color={widget.color} 
              isFront={isFront} 
            />
          </group>
        );
      })}
    </group>
  );
}
