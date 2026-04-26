import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ServicePanel from './ServicePanel';

gsap.registerPlugin(ScrollTrigger);

export default function ZoomScrollArena({ services }) {
  const containerRef = useRef(null);
  const wheelRef = useRef(null);
  const panelsRef = useRef([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=4000", // 4000px de scroll profundo
          scrub: 1,      // Suavidad en el scrub
          pin: true,     // Fija la pantalla
          anticipatePin: 1,
        }
      });

      // Paso 1: Zoom extremo a la rueda (atravesamos el Void)
      tl.to(wheelRef.current, {
        scale: 30, // Escala masiva
        opacity: 0, // Se desvanece al cruzar la cámara
        ease: "power2.inOut",
        duration: 2
      });

      // Paso 2: Secuencia de aparición de los paneles (El Aura)
      panelsRef.current.forEach((panel, index) => {
        tl.fromTo(panel, 
          { y: 100, opacity: 0, scale: 0.9, filter: "blur(10px)" },
          { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: "expo.out" },
          "-=0.5" // Overlap para que fluya natural
        )
        // Desaparece el panel actual para dar paso al siguiente (si no es el último)
        .to(panel, {
          y: -100, opacity: 0, filter: "blur(10px)", duration: 1, ease: "expo.in"
        }, "+=0.5");
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup quirúrgico para React
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* La Rueda Vectorial */}
      <div 
        ref={wheelRef} 
        className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform"
      >
        <svg viewBox="0 0 100 100" className="w-[40vw] h-[40vw] max-w-[500px]">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4" strokeWidth="0.5" />
          {/* Aquí puedes añadir paths abstractos de tu "Aura" */}
        </svg>
      </div>

      {/* Los Paneles de Servicios */}
      <div className="absolute inset-0 flex items-center justify-center">
        {services.map((service, index) => (
          <div 
            key={index} 
            ref={el => panelsRef.current[index] = el}
            className="absolute w-full max-w-2xl px-6 opacity-0 will-change-transform"
          >
            <ServicePanel data={service} />
          </div>
        ))}
      </div>
    </section>
  );
}
