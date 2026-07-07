'use client';

import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { BarChart3, DollarSign, ShoppingBag, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  // Buscamos as ordens reais do cache do React Query para calcular os KPIs reais
  const { data: orders = [] } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: apiService.getOrders,
  });

  // Cálculos dinâmicos baseados nas ordens de venda do sistema
  const totalFaturamento = orders
    .filter(order => order.status !== 'CANCELADO')
    .reduce((acc, order) => acc + order.totalValue, 0);

  const ordensConcluidas = orders.filter(order => order.status === 'ENTREGUE').length;
  const ordensPendentes = orders.filter(order => order.status === 'PENDENTE').length;
  
  const ticketMedio = orders.length > 0 ? totalFaturamento / orders.length : 0;

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-slate-200">
      {/* Cabeçalho do Dashboard */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-emerald-500" />
          Dashboard Comercial
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Indicadores gerenciais atualizados em tempo real.
        </p>
      </div>

      {/* Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Faturamento Ativo</p>
          <p className="text-2xl font-bold text-white mt-2">
            R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="absolute right-4 bottom-4 bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total de Ordens</p>
          <p className="text-2xl font-bold text-white mt-2">{orders.length}</p>
          <div className="absolute right-4 bottom-4 bg-blue-500/10 p-2 rounded-xl text-blue-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ticket Médio</p>
          <p className="text-2xl font-bold text-white mt-2">
            R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="absolute right-4 bottom-4 bg-amber-500/10 p-2 rounded-xl text-amber-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Aguardando Envio</p>
          <p className="text-2xl font-bold text-white mt-2">{ordensPendentes}</p>
          <div className="absolute right-4 bottom-4 bg-purple-500/10 p-2 rounded-xl text-purple-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Gráfico Conceitual de Performance de Vendas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="mb-6">
          <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Evolução de Fluxo de Caixa</h3>
          <p className="text-xs text-slate-500 mt-0.5">Visão consolidada por semestre de operação logístico-comercial.</p>
        </div>
        
        <div className="h-48 flex items-end gap-3 pt-4 border-b border-slate-800">
          <div className="w-full bg-slate-800/60 rounded-t-lg h-1/4 hover:bg-emerald-500/40 transition-all duration-300"></div>
          <div className="w-full bg-slate-800/60 rounded-t-lg h-2/5 hover:bg-emerald-500/40 transition-all duration-300"></div>
          <div className="w-full bg-slate-800/60 rounded-t-lg h-3/5 hover:bg-emerald-500/40 transition-all duration-300"></div>
          <div className="w-full bg-slate-800/60 rounded-t-lg h-4/5 hover:bg-emerald-500/40 transition-all duration-300"></div>
          <div className="w-full bg-emerald-500 rounded-t-lg h-full shadow-[0_0_25px_rgba(16,185,129,0.25)]"></div>
        </div>
        
        <div className="flex justify-between text-xs font-mono text-slate-500 mt-3 px-1">
          <span>Fevereiro</span>
          <span>Março</span>
          <span>Abril</span>
          <span>Maio</span>
          <span>Junho / Julho</span>
        </div>
      </div>
    </div>
  );
}