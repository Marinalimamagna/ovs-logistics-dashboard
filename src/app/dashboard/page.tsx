'use client';

import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { AnalyticsCharts } from '../../components/AnalyticsCharts';
import { DollarSign, BarChart3, Package, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  // Consome os dados reais das ordens de venda sincronizadas
  const { data: orders, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: apiService.getOrders,
  });

  // --- CÁLCULO DOS INDICADORES EM TEMPO REAL (TRATADO CONTRA ERROS) ---
  const totalOrdens = orders?.length || 0;

  const faturamentoTotal = orders?.reduce((acc, order: any) => {
    // Garante a leitura correta independente de o campo se chamar value ou totalValue
    const valorReal = order.value ?? order.totalValue ?? 0;
    return acc + (Number(valorReal) || 0);
  }, 0) || 0;

  const ticketMedio = totalOrdens > 0 ? faturamentoTotal / totalOrdens : 0;

  return (
    <div className="space-y-6 w-full p-6">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">📊 Dashboard Executivo</h1>
          <p className="text-slate-400 text-sm mt-1">Análise de performance financeira, volumetria e status da cadeia logística.</p>
        </div>
        <button 
          onClick={() => refetch()} 
          disabled={isLoading || isFetching} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 transition font-mono text-xs w-full sm:w-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar Indicadores
        </button>
      </div>

      {/* --- GRID DE CARDS INDICADORES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Faturamento Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Faturamento Total</span>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isLoading ? (
                <span className="inline-block w-32 h-7 bg-slate-800 animate-pulse rounded"></span>
              ) : (
                faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              )}
            </h3>
            <p className="text-xs text-emerald-400 font-mono mt-1">● Receita bruta acumulada</p>
          </div>
        </div>

        {/* Card 2: Ticket Médio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Ticket Médio por OV</span>
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isLoading ? (
                <span className="inline-block w-32 h-7 bg-slate-800 animate-pulse rounded"></span>
              ) : (
                ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              )}
            </h3>
            <p className="text-xs text-cyan-400 font-mono mt-1">● Valor médio por pedido</p>
          </div>
        </div>

        {/* Card 3: Total de Ordens */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Total de Ordens (OVs)</span>
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isLoading ? (
                <span className="inline-block w-16 h-7 bg-slate-800 animate-pulse rounded"></span>
              ) : (
                `${totalOrdens} unidades`
              )}
            </h3>
            <p className="text-xs text-purple-400 font-mono mt-1">● Volume total no pipeline</p>
          </div>
        </div>

      </div>

      {/* --- SEÇÃO DOS GRÁFICOS ANALÍTICOS --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
          <div className="lg:col-span-1 h-80 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <AnalyticsCharts orders={orders || []} />
      )}
    </div>
  );
}