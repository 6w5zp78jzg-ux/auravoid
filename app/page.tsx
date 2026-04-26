'use client';

import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000000', 
      color: '#00ffcc', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: 'monospace',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>SISTEMA NEXT.JS ONLINE</h1>
      <p style={{ fontSize: '1.2rem' }}>
        Si puedes leer esto en tu iPad, la infraestructura de Next.js funciona perfectamente.
      </p>
      <p style={{ fontSize: '1rem', color: '#ff4444', marginTop: '2rem' }}>
        El colapso anterior fue provocado por una incompatibilidad entre React Three Fiber y React 19.
      </p>
    </div>
  );
}
