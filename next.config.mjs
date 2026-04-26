/** @type {import('next').NextConfig} */
const nextConfig = {
    // CRÍTICO: Transforma tu app dinámica en un paquete estático
    output: 'export',
    
    // GitLab Pages no tiene un servidor de imágenes nativo para Next.js.
    // Esto evita que el build colapse si usas la etiqueta <Image> de 'next/image'.
    images: {
      unoptimized: true,
    },
  };
  
  export default nextConfig;
  