import './globals.css';
import { Providers } from '@/components/Providers'; 

export const metadata = {
  title: 'AURA & VOID',
  description: 'Laboratorio de ingeniería psicológica',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: 'black' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
