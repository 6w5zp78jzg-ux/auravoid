'use client';

import Chatbot from './Chatbot';
import { useLanguage } from './Providers';

export default function UIOverlay() {
  const { language, setLanguage } = useLanguage();

  return (
    // Mantenemos el fixed y el z-index para que el menú de idiomas sea clicable sobre el Canvas
    <div className="fixed inset-0 z-[100] pointer-events-none p-6 sm:p-10">
      
      {/* SECCIÓN SUPERIOR: Único elemento que queda en el overlay HTML */}
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

      {/* La sección inferior ha sido eliminada. 
          Ahora el Branding vive dentro del SceneManager.tsx como objetos 3D.
      */}

    </div>
  );
}
