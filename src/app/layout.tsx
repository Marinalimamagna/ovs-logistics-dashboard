import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../app/globals.css';
import { Sidebar } from '../components/Sidebar';
import { Providers } from './providers';
import { Toaster } from 'sonner'; // 1. Importa o provedor de Toasts

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
          {/* Mudança para flex-col no mobile e flex-row no desktop */}
          <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
            <Sidebar />
            {/* p-4 no mobile, p-8 no desktop, e pb-24 para dar folga do menu inferior fixo */}
            <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 pb-24 md:pb-8">
              {children}
            </main>
          </div>
        </Providers>
        
        {/* 2. Injeta o componente global de Toasts com tema Dark e estilização profissional */}
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </body>
    </html>
  );
}