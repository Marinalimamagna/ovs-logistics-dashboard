'use client';

import { useState, useEffect } from 'react';
import { apiService, SalesOrder } from '../../services/api';
import { CreateOrderModal } from '../../components/CreateOrderModal'; 
import { 
  Plus, RefreshCw, Eye, Edit2, Copy, Printer, 
  ArrowUpDown, AlertCircle, ChevronRight, X, CheckCircle2,
  Inbox, Archive, ChevronLeft
} from 'lucide-react';

type SortKeys = 'id' | 'clientName' | 'deliveryDate' | 'totalValue' | 'status';
type SortOrder = 'asc' | 'desc';
type TabType = 'andamento' | 'entregues' | 'todas';

export default function GestaoOVGsPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKeys>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [activeTab, setActiveTab] = useState<TabType>('andamento'); 
  
  // ESTADOS DA PAGINAÇÃO (Alterado para 3 itens por página para facilitar testes)
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3; 

  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 

  useEffect(() => {
    initialLoad();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchCurrentOrders = async () => {
    try {
      const data = await apiService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar ordens:", error);
    }
  };

  const initialLoad = async () => {
    setLoading(true);
    await fetchCurrentOrders();
    setLoading(false);
  };

  const handleRefreshDatabase = async () => {
    setLoading(true);
    try {
      apiService.resetDatabase(); 
      const data = await apiService.getOrders();
      setOrders(data);
      setCurrentPage(1); 
    } catch (error) {
      console.error("Erro ao resetar base de dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const listAtualizada = await apiService.duplicateOrder(id);
      setOrders(listAtualizada); 
    } catch (error) {
      console.error("Erro ao duplicar ordem:", error);
    }
  };

  const handlePrint = (order: SalesOrder) => {
    const orderIdFormatted = order.id.replace('OV-', 'OT-');
    if (typeof window !== 'undefined') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Manifesto ${orderIdFormatted}</title>
              <style>
                body { font-family: 'Courier New', Courier, monospace; padding: 30px; background: #ffffff; color: #0f172a; }
                .container { border: 2px dashed #cbd5e1; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
                .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
                h1 { font-size: 14px; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
                .identificador { font-size: 12px; color: #64748b; margin-top: 4px; }
                .divider { border-top: 2px solid #0f172a; margin: 15px 0; }
                .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; border-bottom: 1px dotted #f1f5f9; padding-bottom: 4px; }
                .total-row { display: flex; justify-content: space-between; margin-top: 25px; padding-top: 15px; border-top: 1px dashed #0f172a; font-size: 14px; }
                .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>MANIFESTO DE ORDEM DE TRANSPORTE</h1>
                  <div class="identificador">Identificador: ${orderIdFormatted}</div>
                </div>
                <div class="divider"></div>
                <div class="row"><span><strong>Cliente:</strong></span> <span>${order.clientName}</span></div>
                <div class="row"><span><strong>Data de Entrega:</strong></span> <span>${order.deliveryDate ? order.deliveryDate.split('-').reverse().join('/') : '---'}</span></div>
                <div class="row"><span><strong>Modal de Transporte:</strong></span> <span>${order.transportType || '---'}</span></div>
                <div class="row"><span><strong>Motorista Alocado:</strong></span> <span>${order.driverName || '---'}</span></div>
                <div class="row"><span><strong>Placa Identificadora:</strong></span> <span>${order.vehiclePlate || '---'}</span></div>
                
                <div class="total-row">
                  <span><strong>VALOR LÍQUIDO TOTAL:</strong></span> 
                  <strong>${order.totalValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </div>
                <div class="footer">Sistemas Gestor de Cargas - Emissão Automatizada</div>
              </div>
              <script>
                setTimeout(() => { window.print(); window.close(); }, 250);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const listAtualizada = await apiService.saveOrder(editingOrder);
      setOrders(listAtualizada);
      setEditingOrder(null); 
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
    }
  };

  const handleSort = (key: SortKeys) => {
    const isAsc = sortKey === key && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortKey(key);
  };

  // 1. FILTRAGEM
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'andamento') return order.status !== 'ENTREGUE';
    if (activeTab === 'entregues') return order.status === 'ENTREGUE';
    return true; 
  });

  // 2. ORDENAÇÃO
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const valueA = a[sortKey] ?? '';
    const valueB = b[sortKey] ?? '';

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    }
    return sortOrder === 'asc' 
      ? String(valueA).localeCompare(String(valueB)) 
      : String(valueB).localeCompare(String(valueA));
  });

  // 3. LOGICA DA PAGINAÇÃO
  const totalOrdersInTab = sortedOrders.length;
  const totalPages = Math.ceil(totalOrdersInTab / ordersPerPage) || 1;
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const paginatedOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalFinancialValue = sortedOrders.reduce((acc, order) => acc + (order.totalValue || 0), 0);

  const getPriorityBadge = (id: string) => {
    const hash = id.charCodeAt(id.length - 1);
    if (hash % 3 === 0) return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md"><AlertCircle className="h-3 w-3" /> ALTA</span>;
    if (hash % 3 === 1) return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">MÉDIA</span>;
    return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">BAIXA</span>;
  };

  const getDocStatusBadge = (id: string) => {
    const hash = id.charCodeAt(id.length - 1);
    return hash % 2 === 0 
      ? <span className="text-[11px] font-medium text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md whitespace-nowrap">MDF-e/CT-e Emitidos</span>
      : <span className="text-[11px] font-medium text-amber-400 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded-md whitespace-nowrap">Docs Pendentes</span>;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen overflow-x-hidden">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-wider flex items-center gap-2 text-white">
            🚚 Gestão de Ordens de Transporte
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitorização, controle e despacho ativo de frotas logísticas.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            type="button"
            onClick={handleRefreshDatabase}
            className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white active:scale-95"
            title="Resetar para base limpa"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Nova Ordem
          </button>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex border-b border-slate-800 gap-2 text-xs font-mono">
        <button 
          onClick={() => setActiveTab('andamento')}
          className={`px-4 py-2.5 flex items-center gap-2 font-bold uppercase transition-all border-b-2 ${
            activeTab === 'andamento' 
              ? 'border-emerald-500 text-white bg-emerald-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Inbox className="h-3.5 w-3.5" /> Em Andamento ({orders.filter(o => o.status !== 'ENTREGUE').length})
        </button>
        <button 
          onClick={() => setActiveTab('entregues')}
          className={`px-4 py-2.5 flex items-center gap-2 font-bold uppercase transition-all border-b-2 ${
            activeTab === 'entregues' 
              ? 'border-blue-500 text-white bg-blue-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Archive className="h-3.5 w-3.5" /> Histórico ({orders.filter(o => o.status === 'ENTREGUE').length})
        </button>
        <button 
          onClick={() => setActiveTab('todas')}
          className={`px-4 py-2.5 flex items-center gap-2 font-bold uppercase transition-all border-b-2 ${
            activeTab === 'todas' 
              ? 'border-slate-500 text-white bg-slate-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Todas ({orders.length})
        </button>
      </div>

      {/* FLUXO ATIVO */}
      {activeTab === 'andamento' && (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-2 overflow-x-auto text-[10px] font-mono tracking-wider uppercase text-slate-500 scrollbar-none snap-x">
          <span className="text-slate-400 font-bold shrink-0 mr-2">Fluxo Ativo:</span>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md font-bold">Criada</span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-md font-bold">Planejada</span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded-md font-bold">Agendada</span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md font-bold">Em Transporte</span>
        </div>
      )}

      {/* CONTAINER DE TABELA PRINCIPAL / CARDS MOBILE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* 1. LAYOUT MOBILE (CARDS RESPONSIVOS) */}
        <div className="block md:hidden divide-y divide-slate-800/60">
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs uppercase">Processando malha...</div>
          ) : paginatedOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs uppercase">Nenhuma ordem encontrada.</div>
          ) : (
            paginatedOrders.map((order, idx) => (
              <div 
                key={`card-${order.id}-${idx}`} 
                onClick={() => setSelectedOrder(order)}
                className="p-4 space-y-3 bg-slate-900/40 active:bg-slate-800/60 transition text-xs cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {order.id.replace('OV-', 'OT-')}
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border
                    ${order.status === 'CRIADA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                    ${order.status === 'PLANEJADA' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
                    ${order.status === 'AGENDADA' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : ''}
                    ${order.status === 'EM TRANSPORTE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                    ${order.status === 'ENTREGUE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                  `}>
                    {order.status}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Cliente</div>
                  <div className="font-bold text-white text-sm">{order.clientName}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Valor Total</div>
                    <div className="font-mono font-bold text-slate-200">
                      {order.totalValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Entrega</div>
                    <div className="font-mono text-slate-300">
                      {order.deliveryDate ? order.deliveryDate.split('-').reverse().join('/') : '---'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/40" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setSelectedOrder(order)} className="p-2 bg-slate-950 rounded-lg text-slate-400 hover:text-white">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => order.status !== 'ENTREGUE' && setEditingOrder(order)}
                    disabled={order.status === 'ENTREGUE'}
                    className="p-2 bg-slate-950 rounded-lg text-slate-400 disabled:opacity-25"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDuplicate(order.id)} className="p-2 bg-slate-950 rounded-lg text-slate-400">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={() => handlePrint(order)} className="p-2 bg-slate-950 rounded-lg text-slate-400">
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. LAYOUT DESKTOP (TABELA TRADICIONAL) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-mono tracking-widest text-slate-400 uppercase select-none">
                <th onClick={() => handleSort('id')} className="p-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center gap-1.5">ID OT <ArrowUpDown className="h-3 w-3 text-slate-500" /></div>
                </th>
                <th className="p-4">Prioridade</th>
                <th onClick={() => handleSort('clientName')} className="p-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center gap-1.5">Cliente <ArrowUpDown className="h-3 w-3 text-slate-500" /></div>
                </th>
                <th onClick={() => handleSort('deliveryDate')} className="p-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center gap-1.5">Data Entrega <ArrowUpDown className="h-3 w-3 text-slate-500" /></div>
                </th>
                <th className="p-4">Documentação</th>
                <th onClick={() => handleSort('totalValue')} className="p-4 text-right cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center justify-end gap-1.5">Valor Total <ArrowUpDown className="h-3 w-3 text-slate-500" /></div>
                </th>
                <th onClick={() => handleSort('status')} className="p-4 text-center cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center justify-center gap-1.5">Status <ArrowUpDown className="h-3 w-3 text-slate-500" /></div>
                </th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-mono text-xs uppercase">Processando malha...</td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-mono text-xs uppercase">Nenhuma ordem nesta categoria.</td>
                </tr>
              ) : (
                paginatedOrders.map((order, idx) => {
                  const isEntregue = order.status === 'ENTREGUE';
                  return (
                    <tr 
                      key={`${order.id}-${idx}`}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-slate-800/40 transition-all duration-150 cursor-pointer group"
                    >
                      <td className="p-4 font-mono font-bold text-emerald-400">
                        {order.id.replace('OV-', 'OT-')}
                      </td>
                      <td className="p-4">{getPriorityBadge(order.id)}</td>
                      <td className="p-4 font-semibold text-white">
                        {order.clientName}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-300">
                        {order.deliveryDate ? order.deliveryDate.split('-').reverse().join('/') : '---'}
                      </td>
                      <td className="p-4">{getDocStatusBadge(order.id)}</td>
                      <td className="p-4 text-right font-mono font-bold text-white">
                        {order.totalValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black border min-w-[120px] text-center
                          ${order.status === 'CRIADA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                          ${order.status === 'PLANEJADA' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
                          ${order.status === 'AGENDADA' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : ''}
                          ${order.status === 'EM TRANSPORTE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                          ${order.status === 'ENTREGUE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                        `}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setSelectedOrder(order)} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => !isEntregue && setEditingOrder(order)}
                            disabled={isEntregue}
                            className={`p-1.5 rounded-md text-slate-400 transition-all ${isEntregue ? 'opacity-25 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-sky-400'}`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDuplicate(order.id)} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-purple-400">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handlePrint(order)} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-emerald-400">
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER DA TABELA COM CONTROLES DE PAGINAÇÃO (SEMPRE VISÍVEL AGORA) */}
        <div className="bg-slate-950/60 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 w-full sm:w-auto text-center sm:text-left">
            <div>Volume na Aba: <span className="text-white font-bold">{totalOrdersInTab} OTs</span></div>
            <div className="hidden sm:block">|</div>
            <div>Faturamento da Visão: <span className="text-emerald-400 font-extrabold text-sm">{totalFinancialValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[11px] text-slate-300">
              Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition text-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DETALHES DA ORDEM */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end" onClick={() => setSelectedOrder(null)}>
          <div className="w-full sm:max-w-xl bg-[#0b1329] h-full border-l border-slate-800/60 p-6 flex flex-col overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-slate-800/40 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider">
                  {selectedOrder.id.replace('OV-', 'OT-')}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedOrder.clientName}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-white bg-slate-950/80 rounded-xl border border-slate-800/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-6 flex-1 text-xs">
              {selectedOrder.status === 'ENTREGUE' && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Esta ordem de transporte foi finalizada e arquivada com sucesso.</span>
                </div>
              )}

              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">Dados da Operação</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 bg-slate-950/40 p-5 rounded-xl border border-slate-850/60">
                  <div>
                    <span className="text-slate-500 block mb-0.5 uppercase tracking-wider text-[10px]">Tipo Transporte</span>
                    <span className="text-slate-200 font-bold text-sm">{selectedOrder.transportType || '---'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5 uppercase tracking-wider text-[10px]">Valor Financeiro</span>
                    <span className="text-slate-200 font-mono font-bold text-sm">
                      {selectedOrder.totalValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5 uppercase tracking-wider text-[10px]">Motorista</span>
                    <span className="text-slate-200 font-bold text-sm">{selectedOrder.driverName || '---'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5 uppercase tracking-wider text-[10px]">Placa do Veículo</span>
                    <span className="text-slate-200 font-mono font-bold text-sm">{selectedOrder.vehiclePlate || '---'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO DE EDIÇÃO */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end" onClick={() => setEditingOrder(null)}>
          <form 
            onSubmit={handleSaveEdit}
            className="w-full sm:max-w-xl bg-[#0b1329] h-full border-l border-slate-800/60 p-6 flex flex-col overflow-y-auto text-xs" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-slate-800/40 pb-4">
              <div>
                <span className="text-xs font-mono text-sky-400 font-bold tracking-wider">Modo Edição // {editingOrder.id.replace('OV-', 'OT-')}</span>
                <h2 className="text-xl font-bold text-white mt-1">{editingOrder.clientName}</h2>
              </div>
              <button type="button" onClick={() => setEditingOrder(null)} className="p-2 text-slate-400 hover:text-white bg-slate-950/80 rounded-xl border border-slate-800/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-5 flex-1">
              <div>
                <label className="block text-slate-400 mb-1.5 font-mono uppercase tracking-wider text-[10px]">Status Operacional</label>
                <select 
                  value={editingOrder.status}
                  onChange={e => setEditingOrder({...editingOrder, status: e.target.value as any})}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-white focus:border-sky-500 outline-none font-medium transition-colors"
                >
                  <option value="CRIADA">CRIADA</option>
                  <option value="PLANEJADA">PLANEJADA</option>
                  <option value="AGENDADA">AGENDADA</option>
                  <option value="EM TRANSPORTE">EM TRANSPORTE</option>
                  <option value="ENTREGUE">ENTREGUE</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-mono uppercase tracking-wider text-[10px]">Modal Frota</label>
                  <input 
                    type="text" 
                    value={editingOrder.transportType || ''} 
                    onChange={e => setEditingOrder({...editingOrder, transportType: e.target.value})}
                    placeholder="Ex: Carreta, Sider"
                    className="w-full p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-white focus:border-sky-500 outline-none font-medium transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 font-mono uppercase tracking-wider text-[10px]">Placa Veículo</label>
                  <input 
                    type="text" 
                    value={editingOrder.vehiclePlate || ''} 
                    onChange={e => setEditingOrder({...editingOrder, vehiclePlate: e.target.value.toUpperCase()})}
                    placeholder="ABC-1234"
                    className="w-full p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-white focus:border-sky-500 outline-none font-mono font-medium transition-colors tracking-wide"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-mono uppercase tracking-wider text-[10px]">Condutor (Motorista)</label>
                <input 
                  type="text" 
                  value={editingOrder.driverName || ''} 
                  onChange={e => setEditingOrder({...editingOrder, driverName: e.target.value})}
                  placeholder="Nome do motorista alocado"
                  className="w-full p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-white focus:border-sky-500 outline-none font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-mono uppercase tracking-wider text-[10px]">Data de Entrega</label>
                <input 
                  type="date" 
                  value={editingOrder.deliveryDate || ''} 
                  onChange={e => setEditingOrder({...editingOrder, deliveryDate: e.target.value})}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-white focus:border-sky-500 outline-none font-mono font-medium transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-slate-800/40 pt-4 flex items-center gap-3 mt-4">
              <button type="button" onClick={() => setEditingOrder(null)} className="flex-1 py-3.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/60 rounded-xl text-slate-400 hover:text-white transition-colors uppercase font-bold tracking-wider text-[11px]">
                Cancelar
              </button>
              <button type="submit" className="flex-1 py-3.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl transition-all uppercase font-black tracking-wider text-[11px]">
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO */}
      <CreateOrderModal 
        isOpen={isCreateModalOpen} 
        onClose={async () => {
          setIsCreateModalOpen(false);
          await fetchCurrentOrders();
        }} 
      />
    </div>
  );
}