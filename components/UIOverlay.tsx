'use client';

import Chatbot from './Chatbot';
import { useLanguage } from './Providers';

export default function UIOverlay() {
  const { language, setLanguage, t } = useLanguage();

  return (
    // "fixed" asegura que la interfaz flote sobre el 3D y el contenido scrolleable
    <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-between p-6 sm:p-10">
      
      {/* SECCIÓN SUPERIOR: Chatbot e Idiomas */}
      <div className="flex justify-between items-start w-full pointer-events-auto">
        {/* Chatbot a la izquierda */}
        <Chatbot />

        {/* Selector de Idiomas a la derecha */}
        <div 
          className="flex gap-4 text-[10px] tracking-[0.2em] mt-2" 
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <span 
            onClick={() => setLanguage('es')}
            className={`cursor-pointer transition-all duration-300 ${
              language === 'es' ? 'text-white font-bold opacity-100' : 'text-white/20 hover:text-white/50'
            }`}
          >
            ES
          </span>
          <span className="text-white/10">|</span>
          <span 
            onClick={() => setLanguage('en')}
            className={`cursor-pointer transition-all duration-300 ${
              language === 'en' ? 'text-white font-bold opacity-100' : 'text-white/20 hover:text-white/50'
            }`}
          >
            EN
          </span>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Logo y Slogan Dinámico */}
      <div className="flex flex-col items-center text-center w-full pb-8 sm:pb-12">
        {/* CAMBIO CLAVE: 
            - text-2xl en móvil para que quepa en una línea.
            - sm:text-4xl en tablets.
            - md:text-5xl en escritorio.
            - whitespace-nowrap para prohibir el salto de línea.
        */}
        <h1 
          className="text-2xl sm:text-4xl md:text-5xl tracking-[0.3em] text-white whitespace-nowrap"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
    
        </h1>
        
        {/* Slogan traducido con Montserrat */}
        <p 
          className="uppercase mt-4 max-w-[90vw] leading-relaxed transition-opacity duration-500"
          style={{ 
            fontFamily: 'Montserrat, sans-serif', 
            fontSize: '10px', 
            letterSpacing: '0.4em', 
            color: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          {t('slogan')}
        </p>
      </div>

    </div>
  );
}
