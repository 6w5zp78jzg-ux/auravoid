'use client';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from './Providers';

export default function Chatbot() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const [messages, setMessages] = useState([
    { role: 'bot', content: '' }
  ]);

  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].content === '') {
        return [{
          role: 'bot',
          content: language === 'es' 
            ? 'ENLACE ESTABLECIDO. SOY V.O.I.D. ¿QUÉ DESEAS CREAR?' 
            : 'LINK ESTABLISHED. I AM V.O.I.D. WHAT DO YOU WISH TO CREATE?'
        }];
      }
      return prev;
    });
  }, [language]);

  // --- ESCUCHADOR DEL EVENTO CON EL NUEVO TEXTO ---
  useEffect(() => {
    const handleWake = (e: Event) => {
      const customEvent = e as CustomEvent;
      const serviceName = customEvent.detail?.serviceName;
      
      setIsOpen(true);

      if (serviceName) {
        setMessages(prev => [...prev, {
          role: 'bot',
          content: language === 'es'
            ? `> DIRECTRIZ RECIBIDA: Iniciando protocolo para [${serviceName}].\n\n¿Qué objetivo quieres alcanzar?`
            : `> DIRECTIVE RECEIVED: Initiating protocol for [${serviceName}].\n\nWhat goal do you want to achieve?`
        }]);
      }
    };

    window.addEventListener('wake-chatbot', handleWake);
    return () => window.removeEventListener('wake-chatbot', handleWake);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language: language }) 
      });

      const data = await res.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: language === 'es' ? "ERROR DE CONEXIÓN EN EL ENLACE." : "CONNECTION ERROR IN THE LINK." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: language === 'es' ? "SISTEMA CAÍDO. IMPOSIBLE PROCESAR FRECUENCIA." : "SYSTEM DOWN. UNABLE TO PROCESS FREQUENCY." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'es' ? "El enlace cognitivo de voz no está soportado en este navegador." : "Voice cognitive link is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="relative font-['Montserrat']">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-3 text-white/70 hover:text-white transition-all duration-300"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full bg-white opacity-75 animate-ping" style={{ animationDuration: '2s' }}></span>
            <span className="relative inline-flex rounded-full w-full h-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]"></span>
          </div>
          <span className="font-normal text-[0.6rem] border border-white/30 px-1 rounded-[2px] text-white">AI</span>
        </div>
        <span className="text-[0.7rem] tracking-[2px] uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
          {isOpen 
            ? (language === 'es' ? 'CERRAR V.O.I.D. ✕' : 'CLOSE V.O.I.D. ✕') 
            : (language === 'es' ? 'ENLACE COGNITIVO' : 'COGNITIVE LINK')}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-[45px] left-0 w-[320px] h-[480px] bg-black/40 backdrop-blur-2xl border border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.2)] flex flex-col z-[9999]">
          
          <div className="p-[15px_20px] text-[0.6rem] tracking-[3px] border-b border-white/20 flex justify-between items-center text-white/80">
            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {language === 'es' ? 'SISTEMA ACTIVO' : 'SYSTEM ACTIVE'}
            </span>
            <span onClick={() => setIsOpen(false)} className="cursor-pointer hover:text-white transition-all">✕</span>
          </div>

          <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto text-[0.8rem] flex flex-col gap-[15px] leading-[1.6] scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'bot' 
                ? "border-l border-white/80 pl-[15px] text-white/90 drop-shadow-[0_0_3px_rgba(255,255,255,0.3)] whitespace-pre-wrap" 
                : "self-end bg-white text-black p-[8px_12px] font-medium shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              }>
                {msg.content}
              </div>
            ))}
            
            {isTyping && (
              <div className="border-l border-white/50 pl-[15px] text-white/50 text-[0.7rem] tracking-[2px] animate-pulse uppercase">
                {language === 'es' ? 'V.O.I.D. PROCESANDO FRECUENCIA...' : 'V.O.I.D. PROCESSING FREQUENCY...'}
              </div>
            )}
          </div>

          <div className="p-4 flex gap-[10px] border-t border-white/20 bg-black/30">
            <div className="flex-1 flex items-center bg-white/5 border border-white/20 focus-within:border-white/80 focus-within:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all px-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening 
                  ? (language === 'es' ? "ESCUCHANDO..." : "LISTENING...") 
                  : (language === 'es' ? "TRANSMITIR..." : "TRANSMIT...")}
                className="flex-1 bg-transparent border-none p-[10px_5px] text-white text-[0.75rem] outline-none placeholder:text-white/30"
              />
              
              <button 
                onClick={toggleListening}
                className={`p-2 transition-all duration-300 rounded-full ${
                  isListening 
                    ? 'text-white shadow-[0_0_20px_rgba(255,255,255,1)] scale-110 animate-pulse' 
                    : 'text-white/40 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.8)]'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
            </div>

            <button 
              onClick={handleSendMessage}
              disabled={isTyping}
              className={`px-[18px] text-xl font-bold transition-all duration-300 flex items-center justify-center ${
                isTyping 
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                  : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.9)] hover:shadow-[0_0_35px_rgba(255,255,255,1)] hover:scale-110 active:scale-95'
              }`}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
