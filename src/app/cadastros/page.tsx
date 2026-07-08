'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { Users, Truck, Package, Plus, Edit2, Search, CheckCircle2, X, Eye } from 'lucide-react';

export default function CadastrosPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'clientes' | 'transportes' | 'itens'>('clientes');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sucessoMsg, setSucessoMsg] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'criar' | 'editar' | 'visualizar'>('criar');

  // === ESTADOS DOS FORMULÁRIOS ===
  const [editingId, setEditingId] = React.useState<string | null>(null);
  
  // Clientes
  const [clientName, setClientName] = React.useState('');
  const [clientDoc, setClientDoc] = React.useState('');
  const [clientCity, setClientCity] = React.useState('');
  const [clientState, setClientState] = React.useState('');
  const [clientEmail, setClientEmail] = React.useState('');
  const [clientPhone, setClientPhone] = React.useState('');

  // Transportes
  const [transName, setTransName] = React.useState('');
  const [transCapacity, setTransCapacity] = React.useState('');
  const [transActive, setTransActive] = React.useState(true);

  // Itens
  const [itemName, setItemName] = React.useState('');
  const [itemCategory, setItemCategory] = React.useState('');
  const [itemUnit, setItemUnit] = React.useState('');

  // === QUERIES ===
  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await apiService.getClients();
      return Array.isArray(res) ? res : [];
    }
  });

  const { data: transportTypes = [], isLoading: loadingTrans } = useQuery({
    queryKey: ['transport-types'],
    queryFn: async () => {
      const res = await apiService.getTransportTypes();
      return Array.isArray(res) ? res : [];
    }
  });

  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await apiService.getItems();
      return Array.isArray(res) ? res : [];
    }
  });

  // === MUTATIONS ===
  const showSuccess = (msg: string) => {
    setSucessoMsg(msg);
    setTimeout(() => setSucessoMsg(null), 3000);
  };

  const clientMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return apiService.updateClient(editingId, data);
      } else {
        return apiService.createClient(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showSuccess(editingId ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      fecharModal();
    },
  });

  const transportMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        return apiService.updateTransportType(editingId, data);
      } else {
        return apiService.createTransportType(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-types'] });
      showSuccess(editingId ? 'Transporte atualizado com sucesso!' : 'Transporte cadastrado com sucesso!');
      fecharModal();
    },
  });

  const itemMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiService.createItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      showSuccess('Item cadastrado com sucesso!');
      fecharModal();
    },
  });

  // === CONTROLE DO MODAL ===
  const abrirModalCriar = () => {
    setModalMode('criar');
    setEditingId(null);
    setClientName(''); setClientDoc(''); setClientCity(''); setClientState(''); setClientEmail(''); setClientPhone('');
    setTransName(''); setTransCapacity(''); setTransActive(true);
    setItemName(''); setItemCategory(''); setItemUnit('');
    setIsModalOpen(true);
  };

  const abrirModalVerOuEditar = (entity: any, modo: 'editar' | 'visualizar') => {
    setModalMode(modo);
    setEditingId(entity.id);
    if (activeTab === 'clientes') {
      setClientName(entity.name || ''); 
      setClientDoc(entity.document || ''); 
      setClientCity(entity.city || ''); 
      setClientState(entity.state || ''); 
      setClientEmail(entity.email || ''); 
      setClientPhone(entity.phone || ''); 
    } else if (activeTab === 'transportes') {
      setTransName(entity.name || ''); 
      setTransCapacity(entity.capacity || ''); 
      setTransActive(entity.active !== undefined ? entity.active : true);
    } else if (activeTab === 'itens') {
      setItemName(entity.name || '');
      setItemCategory(entity.category || '');
      setItemUnit(entity.unitOfMeasure || '');
    }
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'visualizar') return;

    if (activeTab === 'clientes') {
      clientMutation.mutate({ 
        name: clientName, 
        document: clientDoc, 
        city: clientCity, 
        state: clientState, 
        email: clientEmail, 
        phone: clientPhone 
      });
    } else if (activeTab === 'transportes') {
      transportMutation.mutate({ 
        name: transName, 
        capacity: transCapacity, 
        active: transActive 
      });
    } else if (activeTab === 'itens') {
      itemMutation.mutate({ 
        name: itemName, 
        category: itemCategory || 'Geral', 
        unitOfMeasure: itemUnit || 'UN' 
      });
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full px-2 sm:px-4 md:px-0 pb-24 md:pb-0 text-slate-100 font-sans antialiased overflow-x-hidden">
      
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">📁 Cadastros Básicos</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Gerenciamento unificado de parceiros, modais de transporte e itens operacionais.</p>
        </div>
        <button 
          type="button"
          onClick={abrirModalCriar}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs shadow-md transition-all w-full sm:w-auto cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Novo Registro
        </button>
      </div>

      {/* Tabs com Scroll Lateral Suave no Mobile */}
      <div className="flex border-b border-slate-800 gap-6 overflow-x-auto whitespace-nowrap pb-px no-scrollbar">
        <button
          type="button"
          onClick={() => { setActiveTab('clientes'); setSearchTerm(''); }}
          className={`flex items-center gap-2 pb-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'clientes' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Clientes
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('transportes'); setSearchTerm(''); }}
          className={`flex items-center gap-2 pb-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'transportes' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="h-3.5 w-3.5" /> Tipos de Transporte
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('itens'); setSearchTerm(''); }}
          className={`flex items-center gap-2 pb-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'itens' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Package className="h-3.5 w-3.5" /> Itens
        </button>
      </div>

      {sucessoMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-2 text-sm w-full">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="font-medium">{sucessoMsg}</p>
        </div>
      )}

      {/* Input de Busca */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Pesquisar registros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-all"
        />
      </div>

      {/* Tabela Principal Otimizada com Safe-Scroll no Mobile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full max-w-full overflow-hidden">
        <div className="overflow-x-auto w-full block scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[700px] sm:min-w-[800px]">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400 font-mono text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6 font-bold w-20">ID</th>
                {activeTab === 'clientes' && (
                  <>
                    <th className="py-3.5 px-4 font-bold">Razão Social / Nome</th>
                    <th className="py-3.5 px-4 font-bold text-right">CNPJ / CPF</th>
                    <th className="py-3.5 px-4 font-bold">Localização</th>
                    <th className="py-3.5 px-4 font-bold text-right">Contato</th>
                  </>
                )}
                {activeTab === 'transportes' && (
                  <>
                    <th className="py-3.5 px-4 font-bold">Descrição / Modal</th>
                    <th className="py-3.5 px-4 font-bold text-right">Capacidade Máxima</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                  </>
                )}
                {activeTab === 'itens' && (
                  <>
                    <th className="py-3.5 px-4 font-bold">Nome do Produto</th>
                    <th className="py-3.5 px-4 font-bold">Categoria</th>
                    <th className="py-3.5 px-4 font-bold text-right">Unidade de Medida</th>
                  </>
                )}
                <th className="py-3.5 px-4 sm:px-6 font-bold text-center w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
              {activeTab === 'clientes' && (
                loadingClients ? (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-500 font-mono">Buscando clientes...</td></tr>
                ) : clients.filter(c => (c?.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((c, idx) => (
                  <tr key={c.id || `client-${idx}`} className="hover:bg-slate-800/20 transition-all">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-emerald-400">{c.id || '—'}</td>
                    <td className="py-4 px-4 font-bold text-slate-200">{c.name || '—'}</td>
                    <td className="py-4 px-4 font-mono text-slate-400 text-right">{c.document || '—'}</td>
                    <td className="py-4 px-4 text-slate-300">{c.city || '—'} - {c.state || '—'}</td>
                    <td className="py-4 px-4 font-mono text-slate-400 text-right">{c.email || '—'}</td>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => abrirModalVerOuEditar(c, 'visualizar')} className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"><Eye className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => abrirModalVerOuEditar(c, 'editar')} className="p-1.5 bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {activeTab === 'transportes' && (
                loadingTrans ? (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-500 font-mono">Buscando frotas...</td></tr>
                ) : transportTypes.filter(t => (t?.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((t, idx) => (
                  <tr key={t.id || `trans-${idx}`} className="hover:bg-slate-800/20 transition-all">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-emerald-400">{t.id || '—'}</td>
                    <td className="py-4 px-4 font-bold text-slate-200">{t.name || '—'}</td>
                    <td className="py-4 px-4 font-mono text-slate-300 text-right">{t.capacity || '—'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${t.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{t.active ? 'ATIVO' : 'INATIVO'}</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => abrirModalVerOuEditar(t, 'visualizar')} className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"><Eye className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => abrirModalVerOuEditar(t, 'editar')} className="p-1.5 bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {activeTab === 'itens' && (
                loadingItems ? (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-500 font-mono">Buscando catálogo...</td></tr>
                ) : items.filter(i => (i?.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((i, idx) => (
                  <tr key={i.id || `item-${idx}`} className="hover:bg-slate-800/20 transition-all">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-emerald-400">{i.id || '—'}</td>
                    <td className="py-4 px-4 font-bold text-slate-200">{i.name || '—'}</td>
                    <td className="py-4 px-4 text-slate-400">{i.category || '—'}</td>
                    <td className="py-4 px-4 font-mono text-slate-300 text-right">{i.unitOfMeasure || 'UN'}</td>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => abrirModalVerOuEditar(i, 'visualizar')} className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"><Eye className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL RESPONSIVO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto scrollbar-none">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                {modalMode === 'criar' && '✨ Novo'}
                {modalMode === 'editar' && '📝 Editar'}
                {modalMode === 'visualizar' && '👁️ Visualizar'} - {activeTab}
              </h2>
              <button type="button" onClick={fecharModal} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {activeTab === 'clientes' && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Razão Social *</label>
                    <input type="text" required disabled={modalMode === 'visualizar'} value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">CNPJ / CPF *</label>
                    <input type="text" required disabled={modalMode === 'visualizar'} value={clientDoc} onChange={e => setClientDoc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Cidade *</label>
                      <input type="text" required disabled={modalMode === 'visualizar'} value={clientCity} onChange={e => setClientCity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Estado *</label>
                      <input type="text" required maxLength={2} disabled={modalMode === 'visualizar'} value={clientState} onChange={e => setClientState(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">E-mail</label>
                      <input type="email" disabled={modalMode === 'visualizar'} value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Telefone</label>
                      <input type="text" disabled={modalMode === 'visualizar'} value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'transportes' && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Descrição do Veículo *</label>
                    <input type="text" required disabled={modalMode === 'visualizar'} placeholder="Ex: Caminhão Toco" value={transName} onChange={e => setTransName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Capacidade de Carga *</label>
                    <input type="text" required disabled={modalMode === 'visualizar'} placeholder="Ex: 15" value={transCapacity} onChange={e => setTransCapacity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                  </div>
                  {modalMode === 'editar' && (
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="transActive" checked={transActive} onChange={e => setTransActive(e.target.checked)} className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0" />
                      <label htmlFor="transActive" className="text-xs font-mono text-slate-400 uppercase cursor-pointer">Modal Ativo</label>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'itens' && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nome do Item *</label>
                    <input type="text" required disabled={modalMode === 'visualizar'} placeholder="Ex: Bobina Zincada" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Categoria</label>
                      <input type="text" disabled={modalMode === 'visualizar'} placeholder="Ex: Siderurgia" value={itemCategory} onChange={e => setItemCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Unidade de Medida</label>
                      <input type="text" disabled={modalMode === 'visualizar'} placeholder="Ex: UN" value={itemUnit} onChange={e => setItemUnit(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-slate-800 pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={fecharModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer">
                  {modalMode === 'visualizar' ? 'Fechar' : 'Cancelar'}
                </button>
                {modalMode !== 'visualizar' && (
                  <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg cursor-pointer">
                    Salvar Registro
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}