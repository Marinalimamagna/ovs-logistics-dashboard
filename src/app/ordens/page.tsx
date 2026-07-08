'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api'; // Ajustado para o caminho correto
import { X, RefreshCw, ChevronDown } from 'lucide-react';

// ==========================================
// INTERFACE DO MODAL
// ==========================================
interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ==========================================
// COMPONENTE DO MODAL
// ==========================================
export function CreateOrderModal({ isOpen, onClose }: CreateOrderModalProps) {
  const queryClient = useQueryClient();
  
  const [clientName, setClientName] = useState('');
  const [transportType, setTransportType] = useState('Caminhão'); 
  const [totalValue, setTotalValue] = useState('');
  const [quantity, setQuantity] = useState('1'); 
  const [deliveryDate, setDeliveryDate] = useState('');

  const createOrderMutation = useMutation({
    mutationFn: (newOrder: any) => apiService.createOrder(newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      setClientName('');
      setTransportType('Caminhão');
      setTotalValue('');
      setQuantity('1');
      setDeliveryDate('');
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !totalValue || !deliveryDate) return;

    createOrderMutation.mutate({
      clientName,
      transportType,
      totalValue: Number(totalValue),
      deliveryDate,
      status: 'CRIADA',
      items: [
        {
          name: 'Item Geral Padrão',
          quantity: Number(quantity) || 1,
        }
      ]
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <style dangerouslySetInnerHTML={{__html: `
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
      `}} />

      <div className="bg-[#0b1324] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            ✨ Emitir Nova Ordem de Venda
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 transition border border-slate-800/50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium uppercase tracking-wider block text-[10px]">
              Nome do Cliente *
            </label>
            <input 
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: CD Atacadista Central"
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition font-sans text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium uppercase tracking-wider block text-[10px]">
                Tipo de Transporte
              </label>
              <div className="relative">
                <select 
                  value={transportType}
                  onChange={(e) => setTransportType(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50 transition font-sans text-sm cursor-pointer appearance-none"
                >
                  <option value="Caminhão">Caminhão</option>
                  <option value="Carreta">Carreta</option>
                  <option value="Bi-truck">Bi-truck</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium uppercase tracking-wider block text-[10px]">
                Quantidade (Itens)
              </label>
              <input 
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50 transition font-sans text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium uppercase tracking-wider block text-[10px]">
                Valor Comercial (R$)
              </label>
              <input 
                type="number"
                step="0.01"
                required
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                placeholder="0,00"
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50 transition font-sans text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium uppercase tracking-wider block text-[10px]">
                Previsão de Entrega
              </label>
              <div className="relative flex items-center">
                <input 
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50 transition font-sans text-sm pr-10"
                />
                <div className="absolute right-3 pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-slate-400 px-4 py-2 rounded-xl font-bold transition text-sm font-sans border border-slate-800/80 cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={createOrderMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-xl font-bold transition text-sm font-sans disabled:opacity-50 cursor-pointer"
            >
              {createOrderMutation.isPending ? 'Emitindo...' : 'Salvar Ordem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE DA PÁGINA PRINCIPAL
// ==========================================
export default function OrdensPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Lista oficial e restrita de status (Sem o intruso PENDENTE!)
  const AVAILABLE_STATUSES = ['CRIADA', 'PLANEJADA', 'AGENDADA', 'EM TRANSPORTE', 'ENTREGUE'];

  // Procurar ordens cadastradas
  const { data: orders = [], isLoading, isFetching } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: () => apiService.getOrders(),
  });

  // Mutation para atualizar o status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: string }) => 
      apiService.updateOrderStatus(orderId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      setActiveDropdown(null);
    },
  });

  // Função auxiliar para normalizar dados legados "PENDENTE" -> "PLANEJADA"
  const normalizeStatus = (status: string): string => {
    const s = status?.toUpperCase();
    if (s === 'PENDENTE') return 'PLANEJADA';
    return s || 'CRIADA';
  };

  const getStatusStyle = (status: string) => {
    switch (normalizeStatus(status)) {
      case 'CRIADA':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'PLANEJADA':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'AGENDADA':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'EM TRANSPORTE':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'ENTREGUE':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto flex flex-col space-y-6">
        
        {/* Cabeçalho da Página */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              📦 Gestão de Ordens de Venda
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Monitorização, controle e emissão ativa de ordens comerciais.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['sales-orders'] })}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl border border-slate-800 transition cursor-pointer"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-500/10 flex items-center gap-2 cursor-pointer"
            >
              <span>+</span> Nova Ordem
            </button>
          </div>
        </div>

        {/* Linha do Fluxo Operacional Unificado */}
        <div className="bg-[#0b1324]/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-2 text-[10px] font-mono tracking-wider">
          <span className="text-slate-500 font-bold uppercase mr-2">Fluxo Operacional Garantido:</span>
          {AVAILABLE_STATUSES.map((status, index) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded border ${getStatusStyle(status)} font-bold`}>
                {status}
              </span>
              {index < AVAILABLE_STATUSES.length - 1 && <span className="text-slate-700">→</span>}
            </div>
          ))}
        </div>

        {/* Tabela de Ordens */}
        <div className="bg-[#0b1324] border border-slate-800 rounded-2xl shadow-xl overflow-visible p-2">
          {isLoading ? (
            <div className="text-center py-12 text-xs text-slate-500 font-mono animate-pulse">
              Carregando ordens de venda de forma segura...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 font-mono">
              Nenhuma ordem registada no sistema. Clique em "+ Nova Ordem" para começar.
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0e172a]/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">ID Ordem</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Data Entrega</th>
                    <th className="px-6 py-4">Transporte</th>
                    <th className="px-6 py-4">Valor Total</th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm font-sans">
                  {orders.map((order: any, idx: number) => {
                    const currentId = order.id || order.orderId || String(idx);
                    const currentStatus = normalizeStatus(order.status);

                    return (
                      <tr key={currentId} className="hover:bg-[#121b2e]/40 transition text-slate-300">
                        <td className="px-6 py-4 font-mono text-xs text-emerald-400 font-bold">
                          {order.orderId || `OV-${String(idx + 1).padStart(3, '0')}`}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          {order.clientName}
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                          {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('pt-PT') : '---'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-xs text-slate-300 font-mono">
                            {order.transportType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-bold font-mono text-xs">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue)}
                        </td>
                        
                        {/* Status Tratado & Corrigido */}
                        <td className="px-6 py-4 text-left relative overflow-visible">
                          <button
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === currentId ? null : currentId)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide uppercase transition hover:scale-105 active:scale-95 cursor-pointer ${getStatusStyle(currentStatus)}`}
                          >
                            <span>{currentStatus}</span>
                            <ChevronDown className="h-3 w-3 opacity-60" />
                          </button>

                          {/* Menu suspenso restrito ao fluxo real */}
                          {activeDropdown === currentId && (
                            <div className="absolute left-6 mt-1 w-40 bg-[#0e172a] border border-slate-800 rounded-xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                              {AVAILABLE_STATUSES.map((statusOption) => (
                                <button
                                  key={statusOption}
                                  type="button"
                                  onClick={() => updateStatusMutation.mutate({ orderId: order.id, newStatus: statusOption })}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase transition mb-0.5 last:mb-0 cursor-pointer ${
                                    currentStatus === statusOption 
                                      ? 'bg-[#1e293b] text-emerald-400 font-extrabold' 
                                      : 'text-slate-400 hover:bg-[#111c30] hover:text-white'
                                  }`}
                                >
                                  {statusOption}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <CreateOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}