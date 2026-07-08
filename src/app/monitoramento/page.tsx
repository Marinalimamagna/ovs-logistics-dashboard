'use client';

import { useState, useEffect } from 'react';
import { apiService, SalesOrder } from '../../services/api';
import { 
  RefreshCw, Search, Truck, Clock, DollarSign, 
  SearchX, ChevronLeft, ChevronRight
} from 'lucide-react';

type FilterStatusType = 'TODOS' | 'AGENDADA' | 'EM TRANSPORTE';

export default function MonitoramentoPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatusType>('TODOS');
  
  // ESTADOS PARA PAGINAÇÃO
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadOrders();
  }, []);

  // Reseta para a primeira página sempre que o usuário filtrar algo
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await apiService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao monitorar ordens:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. FILTRA APENAS ORDENS QUE ESTÃO ATIVAS NO TRÂNSITO OU AGENDADAS
  const activeMonitorOrders = orders.filter(
    (o) => o.status === 'EM TRANSPORTE' || o.status === 'AGENDADA'
  );

  // 2. APLICA O FILTRO DE BOTÃO RÁPIDO + BARRA DE PESQUISA
  const filteredOrders = activeMonitorOrders.filter((order) => {
    if (statusFilter !== 'TODOS' && order.status !== statusFilter) {
      return false;
    }

    const term = searchTerm.toLowerCase();
    return (
      order.clientName.toLowerCase().includes(term) ||
      (order.driverName || '').toLowerCase().includes(term) ||
      (order.vehiclePlate || '').toLowerCase().includes(term) ||
      order.id.toLowerCase().includes(term)
    );
  });

  // 3. LÓGICA DE PAGINAÇÃO
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Registros que serão exibidos na página atual
  const currentRecords = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // 4. CÁLCULO DOS INDICADORES DO TOPO (KPIs)
  const emTransporteCount = activeMonitorOrders.filter(o => o.status === 'EM TRANSPORTE').length;
  const agendadasCount = activeMonitorOrders.filter(o => o.status === 'AGENDADA').length;
  const valorEmRisco = activeMonitorOrders.reduce((acc, o) => acc + (o.totalValue || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen overflow-x-hidden">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-black uppercase tracking-wider text-white">
              🖥️ Painel de Monitoramento Ativo
            </h1>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">LIVE</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitoramento em tempo real de cargas em trânsito e etapas operacionais.
          </p>
        </div>
        <button 
          onClick={loadOrders}
          disabled={loading}
          className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* CARDS DE RESUMO (TOPO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CARD 1 - VEÍCULO EM TRANSPORTE */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Status Frota</span>
            <div className="text-xl font-black text-white">
              {emTransporteCount} {emTransporteCount === 1 ? 'Veículo em Transporte' : 'Veículos em Transporte'}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Truck className="h-5 w-5" />
          </div>
        </div>

        {/* CARD 2 - AGUARDANDO JANELA */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Programação</span>
            <div className="text-xl font-black text-white">
              {agendadasCount} {agendadasCount === 1 ? 'Aguardando Janela' : 'Aguardando Janela'}
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* CARD 3 - PATRIMÔNIO EM ROTA */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between shadow-lg sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Patrimônio Circulante</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {valorEmRisco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} <span className="text-[11px] font-normal text-slate-400 font-sans block sm:inline sm:ml-1">Valor de Carga em Trânsito</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* CONTROLES DE BUSCA E FILTROS RÁPIDOS */}
      <div className="space-y-3">
        {/* BARRA DE PESQUISA */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por cliente, motorista, placa ou ID da Ordem..."
            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs md:text-sm text-white placeholder-slate-500 outline-none focus:border-slate-700 transition-colors shadow-inner"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-3.5 text-[10px] uppercase font-mono font-bold text-slate-500 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        {/* BOTÕES DE FILTRO RÁPIDO */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3 py-1.5 rounded-lg border font-bold uppercase transition-all ${
              statusFilter === 'TODOS'
                ? 'bg-slate-100 text-slate-950 border-white'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            Todos ({activeMonitorOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('AGENDADA')}
            className={`px-3 py-1.5 rounded-lg border font-bold uppercase transition-all ${
              statusFilter === 'AGENDADA'
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-900'
            }`}
          >
            Agendada ({activeMonitorOrders.filter(o => o.status === 'AGENDADA').length})
          </button>
          <button
            onClick={() => setStatusFilter('EM TRANSPORTE')}
            className={`px-3 py-1.5 rounded-lg border font-bold uppercase transition-all ${
              statusFilter === 'EM TRANSPORTE'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-400 hover:border-amber-900'
            }`}
          >
            Em Transporte ({activeMonitorOrders.filter(o => o.status === 'EM TRANSPORTE').length})
          </button>
        </div>
      </div>

      {/* PAINEL / TABELA DE MONITORAMENTO */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* LAYOUT MOBILE (CARDS INDIVIDUAIS) */}
        <div className="block md:hidden divide-y divide-slate-800/60">
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs uppercase">Rastreando frotas...</div>
          ) : currentRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2 py-12">
              <SearchX className="h-6 w-6 text-slate-600" />
              <span className="font-mono text-xs uppercase tracking-wide">Nenhum registro ativo localizado</span>
            </div>
          ) : (
            currentRecords.map((order, idx) => (
              <div key={`card-monitor-${order.id}-${idx}`} className="p-4 space-y-3 bg-slate-900/40 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-emerald-400">
                    {order.id.replace('OV-', 'OT-')}
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border
                    ${order.status === 'AGENDADA' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : ''}
                    ${order.status === 'EM TRANSPORTE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                  `}>
                    {order.status}
                  </span>
                </div>

                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Cliente</div>
                  <div className="font-bold text-white text-sm">{order.clientName}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/40">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-mono">Motorista</div>
                    <div className="text-slate-300 font-medium truncate">{order.driverName || 'Não Alocado'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-mono">Placa</div>
                    <div className="font-mono text-slate-300 font-bold tracking-wider">{order.vehiclePlate || '---'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-slate-500 uppercase font-mono">Data Prev.</div>
                    <div className="font-mono text-slate-300">{order.deliveryDate ? order.deliveryDate.split('-').reverse().join('/') : '---'}</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-800/40">
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Valor Líquido</span>
                  <span className="font-mono font-bold text-slate-200">
                    {(order.totalValue ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* LAYOUT DESKTOP (TABELA TRADICIONAL COM REGRAS DE ALINHAMENTO) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-mono text-slate-400 uppercase tracking-widest select-none">
                <th className="p-4 text-left">ID ORDEM</th>
                <th className="p-4 text-left">Cliente</th>
                <th className="p-4 text-left">Motorista</th>
                <th className="p-4 text-left">Placa</th>
                <th className="p-4 text-right">Data Prevista</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-mono uppercase tracking-wider text-xs">Rastreando frotas...</td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2 font-mono text-xs uppercase">
                    <SearchX className="h-5 w-5 text-slate-600" />
                    Nenhum veículo correspondente localizado.
                  </td>
                </tr>
              ) : (
                currentRecords.map((order, idx) => (
                  <tr key={`${order.id}-monitor-${idx}`} className="hover:bg-slate-800/30 transition-colors duration-150">
                    <td className="p-4 font-mono font-bold text-emerald-400 text-left">
                      {order.id.replace('OV-', 'OT-')}
                    </td>
                    <td className="p-4 font-semibold text-white text-left">{order.clientName}</td>
                    <td className="p-4 text-slate-300 font-medium text-left">{order.driverName || 'Não Alocado'}</td>
                    <td className="p-4 font-mono text-slate-300 font-bold tracking-wider text-left">{order.vehiclePlate || '---'}</td>
                    <td className="p-4 font-mono text-slate-300 font-bold text-right">
                      {order.deliveryDate ? order.deliveryDate.split('-').reverse().join('/') : '---'}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-white">
                      {(order.totalValue ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black border min-w-[120px] text-center uppercase tracking-wide
                        ${order.status === 'AGENDADA' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : ''}
                        ${order.status === 'EM TRANSPORTE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RODAPÉ DA TABELA COM PAGINAÇÃO DINÂMICA */}
        <div className="bg-slate-950/60 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-slate-500">
          <div>
            Exibindo <span className="text-slate-300 font-bold">{totalItems === 0 ? 0 : indexOfFirstItem + 1}</span> até <span className="text-slate-300 font-bold">{Math.min(indexOfLastItem, totalItems)}</span> de <span className="text-slate-300 font-bold">{totalItems}</span> registros filtrados
          </div>
          
          {/* CONTROLES DE PÁGINA */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all active:scale-95"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              
              <span className="text-slate-400 px-2 select-none">
                Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-slate-400 font-bold">{totalPages}</span>
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all active:scale-95"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-medium border-l border-slate-800 pl-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Sistema: <span className="text-emerald-400 font-bold uppercase">ATIVO</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}