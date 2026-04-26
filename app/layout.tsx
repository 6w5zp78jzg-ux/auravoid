import './globals.css';
import { Providers } from '../components/Providers'; 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
