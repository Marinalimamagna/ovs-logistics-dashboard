'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { Plus, RefreshCw, ArrowRight, X, Info, CheckCircle } from 'lucide-react';
import { CreateOrderModal } from '../../components/CreateOrderModal';
import { SalesOrder } from '../../services/mockData';

export default function OrdensPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Busca as ordens de venda via React Query
  const { data: orders, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: apiService.getOrders,
  });

  // Mutação para atualizar o status e invalidar o cache
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      apiService.updateOrderStatus(id, nextStatus),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      setSelectedOrder(updatedData); // Atualiza os detalhes no painel lateral
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Erro ao atualizar o status.');
    },
  });

  // Define de forma estrita qual o próximo passo do fluxo linear do projeto
  const getNextStatusLabel = (currentStatus: string): string | null => {
    const status = currentStatus.toUpperCase().trim();
    if (status === 'CRIADA' || status === 'PENDENTE') return 'PLANEJADA';
    if (status === 'PLANEJADA') return 'AGENDADA';
    if (status === 'AGENDADA') return 'EM_TRANSPORTE';
    if (status === 'EM_TRANSPORTE' || status === 'EM_TRANS_ITO' || status === 'EM_TRANSITO') return 'ENTREGUE';
    return null;
  };

  return (
    <div className="space-y-6 w-full relative p-4 md:p-0 pb-16 md:pb-0">
      {/* Alerta de Erro de Transição */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start justify-between text-sm animate-in fade-in duration-200 z-50">
          <div className="flex gap-2">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-300 ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Cabeçalho Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">📦 Gestão de Ordens de Venda</h1>
          <p className="text-slate-400 text-sm mt-1">Monitorização, controle e emissão activa de ordens comerciais.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            onClick={() => refetch()} 
            disabled={isLoading || isFetching} 
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/10 transition flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Nova Ordem
          </button>
        </div>
      </div>

      {/* Linha do Tempo Visual do Fluxo */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
        <span className="text-slate-500 font-bold uppercase tracking-wider mr-1">Fluxo Operacional Garantido:</span>
        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-blue-400">CRIADA</span>
        <ArrowRight className="h-3 w-3 text-slate-600" />
        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-purple-400">PLANEJADA</span>
        <ArrowRight className="h-3 w-3 text-slate-600" />
        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-cyan-400">AGENDADA</span>
        <ArrowRight className="h-3 w-3 text-slate-600" />
        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-400">EM TRANSPORTE</span>
        <ArrowRight className="h-3 w-3 text-slate-600" />
        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-emerald-400">ENTREGUE</span>
      </div>

      {/* Tabela de Ordens */}
      {isLoading ? (
        <div className="border border-slate-800 bg-slate-900/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-mono">Carregando dados da API...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
          <div className={`${selectedOrder ? 'lg:col-span-2' : 'lg:col-span-3'} bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl w-full transition-all`}>
            
            {/* ADICIONADA PROTEÇÃO DE SCROLL HORIZONTAL AQUI */}
            <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-800">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-xs uppercase tracking-wider">
                    <th className="py-4 px-6 font-medium">ID Ordem</th>
                    <th className="py-4 px-6 font-medium">Cliente</th>
                    <th className="py-4 px-6 font-medium">Data Entrega</th>
                    <th className="py-4 px-6 font-medium">Transporte</th>
                    <th className="py-4 px-6 font-medium">Valor Total</th>
                    <th className="py-4 px-6 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                  {orders?.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => { setSelectedOrder(order); setErrorMsg(null); }}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${selectedOrder?.id === order.id ? 'bg-slate-800/30' : ''}`}
                    >
                      <td className="py-4 px-6 font-mono font-medium text-emerald-400">{order.id}</td>
                      <td className="py-4 px-6 font-medium text-white">{order.clientName}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {order.deliveryDate && !isNaN(Date.parse(order.deliveryDate))
                          ? new Date(order.deliveryDate).toLocaleDateString('pt-BR')
                          : 'Não agendada'}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                          {(order as any).transportType || 'Não definido'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-mono border ${
                          (order.status as string) === 'EM_TRANSITO' || (order.status as string) === 'EM_TRANSPORTE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          (order.status as string) === 'PENDENTE' || (order.status as string) === 'CRIADA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          (order.status as string) === 'PLANEJADA' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          (order.status as string) === 'AGENDADA' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Painel Lateral de Controle Operacional */}
          {selectedOrder && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in slide-in-from-right duration-200 w-full">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{selectedOrder.id}</span>
                  <h2 className="text-lg font-bold text-white mt-0.5">Detalhes da Ordem</h2>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-mono">Cliente</span>
                  <span className="text-white font-medium">{selectedOrder.clientName}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-mono">Transporte</span>
                    <span className="text-slate-300 font-medium">{(selectedOrder as any).transportType || 'Não definido'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-mono">Data Entrega</span>
                    <span className="text-slate-300">
                      {selectedOrder.deliveryDate && !isNaN(Date.parse(selectedOrder.deliveryDate))
                        ? new Date(selectedOrder.deliveryDate).toLocaleDateString('pt-BR')
                        : 'Não definida'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-slate-500 block text-xs uppercase font-mono">Itens da Ordem (SKU)</span>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 divide-y divide-slate-800/50 max-h-40 overflow-y-auto">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between text-xs font-mono">
                        <span className="text-slate-400 font-medium">{item.name || `Item SKU-${item.sku || '00' + idx}`}</span>
                        <span className="text-slate-500">Qtd: {item.quantity || 1}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 text-center py-2">Item Geral Padrão Vinculado</div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-slate-500 block text-xs uppercase font-mono">Controle Operacional</span>
                {getNextStatusLabel(selectedOrder.status) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = getNextStatusLabel(selectedOrder.status);
                      if (next) updateStatusMutation.mutate({ id: selectedOrder.id, nextStatus: next });
                    }}
                    disabled={updateStatusMutation.isPending}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 py-2.5 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2 shadow-inner disabled:opacity-50"
                  >
                    {updateStatusMutation.isPending ? (
                      <div className="h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        AVANÇAR PARA: {getNextStatusLabel(selectedOrder.status)?.replace('_', ' ')}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2 text-xs font-mono text-emerald-400 justify-center">
                    <CheckCircle className="h-4 w-4" />
                    ORDEM TOTALMENTE CONCLUÍDA
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}