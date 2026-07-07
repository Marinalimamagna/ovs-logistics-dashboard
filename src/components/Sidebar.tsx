'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Activity, Calendar, Layers, ShieldAlert } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Ordens de Venda', href: '/ordens', icon: ShoppingCart },
    { name: 'Monitoramento', href: '/monitoramento', icon: Activity },
    { name: 'Agendamentos', href: '/agendamento', icon: Calendar },
    { name: 'Cadastros Básicos', href: '/cadastros', icon: Layers },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Brand / Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            L
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-wider leading-none">Logix Senior</h1>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5 block">Control Center</span>
          </div>
        </div>
      </div>

      {/* Links de Navegação */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
              <span>{item.name}</span>
              
              {isActive && (
                <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="h-3 w-3 text-slate-600" />
          <span>v1.4.0 // Modo Operador</span>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      </div>
    </aside>
  );
}