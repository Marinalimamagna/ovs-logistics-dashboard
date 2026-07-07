import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../app/globals.css';
import { Sidebar } from '../components/Sidebar';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Logix Senior - Painel de Controle',
  description: 'Sistema integrado de monitoramento e ordens de venda',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full bg-slate-950">
      <head>
        {/* Força o navegador a carregar o ícone limpando o cache com uma query string */}
        <link rel="icon" href="/icon.png?v=1" type="image/png" />
      </head>
      <body 
        className={`${inter.className} h-full antialiased text-slate-200`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="flex h-full w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-950">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}