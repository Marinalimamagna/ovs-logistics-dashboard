
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { mockClients } from '../../services/mockData';
import { RefreshCw, SlidersHorizontal, Calendar, Truck, User, Info } from 'lucide-react';

export default function MonitoramentoPage() {
  // Estados para cada um dos filtros exigidos pelo documento
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClientId, setFilterClientId] = useState('');
  const [filterTransport, setFilterTransport] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Busca as ordens de venda via React Query
  const { data: orders, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: apiService.getOrders,
  });

  // Lógica de filtragem combinada em tempo real (Memoizada para máxima performance)
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      // 1. Filtro por Status
      if (filterStatus) {
        const orderStatus = order.status.toUpperCase();
        if (filterStatus === 'CRIADA_PENDENTE') {
          if (orderStatus !== 'CRIADA' && orderStatus !== 'PENDENTE') return false;
        } else if (orderStatus !== filterStatus) {
          return false;
        }
      }

      // 2. Filtro por Cliente
      if (filterClientId && order.clientId !== filterClientId) {
        return false;
      }

      // 3. Filtro por Tipo de Transporte
      if (filterTransport) {
        const transport = (order as any).transportType || 'Não definido';
        if (transport !== filterTransport) {
          return false;
        }
      }

      // 4. Filtro por Data (Compara o ano-mês-dia bruto)
      if (filterDate && order.deliveryDate !== filterDate) {
        return false;
      }

      return true;
    });
  }, [orders, filterStatus, filterClientId, filterTransport, filterDate]);

  // Função simples para limpar todos os filtros de uma vez
  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterClientId('');
    setFilterTransport('');
    setFilterDate('');
  };

  return (
    <div className="space-y-6 w-full p-4 md:p-0 pb-16 md:pb-0">
      {/* Cabeçalho Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">📊 Monitoramento Operacional</h1>
          <p className="text-slate-400 text-sm mt-1">Consulta avançada de cargas e ordens com filtros direcionados.</p>
        </div>
        <button 
          type="button"
          onClick={() => refetch()} 
          disabled={isLoading || isFetching} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 transition font-mono text-xs w-full sm:w-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      {/* Barra de Filtros Avançados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
          <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
          <span className="font-bold uppercase tracking-wider">Painel de Filtros Direcionados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro 1: Status */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase mb-1.5">
              <Info className="h-3.5 w-3.5 text-blue-400" /> Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="">Todos os Status</option>
              <option value="CRIADA_PENDENTE">CRIADA / PENDENTE</option>
              <option value="PLANEJADA">PLANEJADA</option>
              <option value="AGENDADA">AGENDADA</option>
              <option value="EM_TRANSPORTE">EM TRANSPORTE</option>
              <option value="ENTREGUE">ENTREGUE</option>
            </select>
          </div>

          {/* Filtro 2: Cliente */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase mb-1.5">
              <User className="h-3.5 w-3.5 text-purple-400" /> Cliente
            </label>
            <select
              value={filterClientId}
              onChange={(e) => setFilterClientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="">Todos os Clientes</option>
              {mockClients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro 3: Tipo de Transporte */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase mb-1.5">
              <Truck className="h-3.5 w-3.5 text-cyan-400" /> Transporte
            </label>
            <select
              value={filterTransport}
              onChange={(e) => setFilterTransport(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="">Todos os Veículos</option>
              <option value="Não definido">Não definido</option>
              <option value="Caminhão">Caminhão</option>
              <option value="Carreta">Carreta</option>
              <option value="Bi-truck">Bi-truck</option>
            </select>
          </div>

          {/* Filtro 4: Data de Entrega */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase mb-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" /> Data Prevista
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            />
          </div>
        </div>

        {/* Botão de Reset de Filtros */}
        {(filterStatus || filterClientId || filterTransport || filterDate) && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-red-400 hover:text-red-300 font-mono underline transition"
            >
              Limpar todos os filtros ativos
            </button>
          </div>
        )}
      </div>

      {/* Resultados da Tabela Monitorada com Proteção Mobile */}
      {isLoading ? (
        <div className="border border-slate-800 bg-slate-900/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="h-7 w-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-mono">Processando dados filtrados...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-medium">ID Ordem</th>
                  <th className="py-4 px-6 font-medium">Cliente</th>
                  <th className="py-4 px-6 font-medium">Data Entrega</th>
                  <th className="py-4 px-6 font-medium">Modal Transporte</th>
                  <th className="py-4 px-6 font-medium">Valor Total</th>
                  <th className="py-4 px-6 font-medium">Status Operacional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-emerald-400">{order.id}</td>
                      <td className="py-4 px-6 font-medium text-white">{order.clientName}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {order.deliveryDate && !isNaN(Date.parse(order.deliveryDate))
                          ? new Date(order.deliveryDate).toLocaleDateString('pt-BR')
                          : 'Não agendada'}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
                          {(order as any).transportType || 'Não definido'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-mono border ${
                          order.status === 'EM_TRANSPORTE' || order.status === 'EM_TRANSITO' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          order.status === 'PENDENTE' || order.status === 'CRIADA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          order.status === 'PLANEJADA' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          order.status === 'AGENDADA' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm font-mono text-slate-500">
                      🔍 Nenhuma ordem encontrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}