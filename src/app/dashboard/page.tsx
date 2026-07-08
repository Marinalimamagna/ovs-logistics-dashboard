'use client';

import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { AnalyticsCharts } from '../../components/AnalyticsCharts';
import { 
  DollarSign, 
  BarChart3, 
  Package, 
  RefreshCw, 
  Users, 
  Truck, 
  Boxes, 
  ArrowUpRight, 
  Clock 
} from 'lucide-react';

export default function DashboardPage() {
  const { data: orders, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: apiService.getOrders,
  });

  const totalOrdens = orders?.length || 0;

  const faturamentoTotal = orders?.reduce((acc, order: any) => {
    const valorReal = order.value ?? order.totalValue ?? 0;
    return acc + (Number(valorReal) || 0);
  }, 0) || 0;

  const ticketMedio = totalOrdens > 0 ? faturamentoTotal / totalOrdens : 0;

  const totalClientes = 42;
  const totalTransportadoras = 8;
  const totalItens = 156;

  const ultimasOrdens = orders?.slice(-4).reverse() || [];

  return (
    <div className="space-y-6 md:space-y-8 w-full p-4 md:p-6 text-slate-200 overflow-x-hidden">
      
      {/* 1. CABEÇALHO DA INTERFACE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-teal-400" />
            Dashboard Executivo
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">Análise de performance, volumetria de cadastros e fluxo de suprimentos.</p>
        </div>
        <button 
          onClick={() => refetch()} 
          disabled={isLoading || isFetching} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-300 border border-slate-800 transition text-xs w-full sm:w-auto font-medium shadow-sm active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-teal-400 ${isFetching ? 'animate-spin' : ''}`} />
          Sincronizar Dados
        </button>
      </div>

      {/* 2. METRICAS PRINCIPAIS (RESPONSIVAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Card 1: Faturamento Total */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faturamento Bruto</span>
            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400/90 border border-orange-500/10">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {isLoading ? (
                <span className="inline-block w-32 h-7 bg-slate-800 animate-pulse rounded"></span>
              ) : (
                faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              )}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-medium bg-orange-500/10 text-orange-400/80 px-1.5 py-0.5 rounded">META 94%</span>
              <p className="text-xs text-slate-500">Receita total liquidada</p>
            </div>
          </div>
        </div>

        {/* Card 2: Ticket Médio */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Médio / OV</span>
            <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/10">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {isLoading ? (
                <span className="inline-block w-32 h-7 bg-slate-800 animate-pulse rounded"></span>
              ) : (
                ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              )}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-medium bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded">ESTÁVEL</span>
              <p className="text-xs text-slate-500">Média por ordem gerada</p>
            </div>
          </div>
        </div>

        {/* Card 3: Total de Ordens */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden group col-span-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline de Ordens</span>
            <div className="p-2.5 bg-slate-800 rounded-xl text-slate-300 border border-slate-700/50">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {isLoading ? (
                <span className="inline-block w-16 h-7 bg-slate-800 animate-pulse rounded"></span>
              ) : (
                `${totalOrdens} OVs`
              )}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">ATIVAS</span>
              <p className="text-xs text-slate-500">Volume em circulação</p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. VOLUMETRIA DE CADASTROS */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-4 md:p-5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          🗂️ Volumetria de Cadastros Estruturais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-slate-900/60 border border-slate-800/40 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/5 rounded-lg text-amber-500/70 border border-amber-500/10"><Users className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Clientes</p>
                <p className="text-sm md:text-base font-bold text-slate-200 mt-0.5">{totalClientes} <span className="text-xs font-normal text-slate-500">ativos</span></p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-700 hidden sm:block" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/40 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/5 rounded-lg text-teal-400/70 border border-teal-500/10"><Truck className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Frota / Transp.</p>
                <p className="text-sm md:text-base font-bold text-slate-200 mt-0.5">{totalTransportadoras} <span className="text-xs font-normal text-slate-500">homologadas</span></p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-700 hidden sm:block" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/40 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/5 rounded-lg text-rose-400/70 border border-rose-500/10"><Boxes className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Itens / SKU</p>
                <p className="text-sm md:text-base font-bold text-slate-200 mt-0.5">{totalItens} <span className="text-xs font-normal text-slate-500">em catálogo</span></p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-700 hidden sm:block" />
          </div>

        </div>
      </div>

      {/* 4. BLOCO DE ANÁLISE GRÁFICA E HISTÓRICO */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        <div className="xl:col-span-3 w-full overflow-hidden max-w-full">
          {isLoading ? (
            <div className="h-72 md:h-80 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
          ) : (
            <AnalyticsCharts orders={orders || []} />
          )}
        </div>

        <div className="xl:col-span-1 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm w-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-teal-400" /> Registro de Atividades
            </h3>
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-800/40 rounded-xl animate-pulse" />)
            ) : ultimasOrdens.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Nenhum registro recente.</p>
            ) : (
              ultimasOrdens.map((order: any, idx: number) => {
                const val = order.value ?? order.totalValue ?? 0;
                return (
                  <div key={order.id || idx} className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-slate-800 transition">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-200 font-semibold">{order.id || `OV-00${totalOrdens - idx}`}</span>
                      <span className="text-slate-500 text-[10px]">{order.date || 'Hoje'}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-1">{order.clientName || 'Cliente Geral'}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/60">
                      <span className="text-xs text-teal-400 font-semibold">
                        {Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        {order.status || 'CRIADA'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}