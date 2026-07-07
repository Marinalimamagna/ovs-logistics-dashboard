'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { Users, Truck, Package, Plus, Edit2, Search, CheckCircle2, X } from 'lucide-react';

export default function CadastrosClientesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'clientes' | 'transportes' | 'itens'>('clientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === ESTADOS DOS FORMULÁRIOS ===
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Clientes
  const [clientName, setClientName] = useState('');
  const [clientDoc, setClientDoc] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Transportes
  const [transName, setTransName] = useState('');
  const [transCapacity, setTransCapacity] = useState('');
  const [transActive, setTransActive] = useState(true);

  // Itens (Unidade de medida flexível como campo de texto livre)
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemUnit, setItemUnit] = useState('');

  // === QUERIES (CONSULTAS) ===
  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: apiService.getClients,
    enabled: activeTab === 'clientes',
  });

  const { data: transportTypes, isLoading: loadingTrans } = useQuery({
    queryKey: ['transport-types'],
    queryFn: apiService.getTransportTypes,
    enabled: activeTab === 'transportes',
  });

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ['items'],
    queryFn: apiService.getItems,
    enabled: activeTab === 'itens',
  });

  // === MUTATIONS (SALVAR / CRIAR) ===
  const showSuccess = (msg: string) => {
    setSucessoMsg(msg);
    setTimeout(() => setSucessoMsg(null), 3000);
  };

  const clientMutation = useMutation({
    mutationFn: (data: any) => editingId ? apiService.updateClient(editingId, data) : apiService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showSuccess(editingId ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      fecharModal();
    },
  });

  const transportMutation = useMutation({
    mutationFn: (data: any) => editingId ? apiService.updateTransportType(editingId, data) : apiService.createTransportType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-types'] });
      showSuccess(editingId ? 'Transporte atualizado com sucesso!' : 'Transporte cadastrado com sucesso!');
      fecharModal();
    },
  });

  const itemMutation = useMutation({
    mutationFn: (data: any) => apiService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      showSuccess('Item cadastrado com sucesso!');
      fecharModal();
    },
  });

  // === FLUXO DO MODAL ===
  const abrirModalCriar = () => {
    setEditingId(null);
    setClientName(''); setClientDoc(''); setClientCity(''); setClientState(''); setClientEmail(''); setClientPhone('');
    setTransName(''); setTransCapacity(''); setTransActive(true);
    setItemName(''); setItemCategory(''); setItemUnit('');
    setIsModalOpen(true);
  };

  const abrirModalEditar = (entity: any) => {
    setEditingId(entity.id);
    if (activeTab === 'clientes') {
      setClientName(entity.name); 
      setClientDoc(entity.document); 
      setClientCity(entity.city); 
      setClientState(entity.state); 
      setClientEmail(entity.email || ''); 
      setClientPhone(entity.phone || ''); 
    } else if (activeTab === 'transportes') {
      setTransName(entity.name); 
      setTransCapacity(entity.capacity); 
      setTransActive(entity.active);
    }
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      transportMutation.mutate({ name: transName, capacity: transCapacity, active: transActive });
    } else if (activeTab === 'itens') {
      // Itens não possuem rota de updateItem, portanto sempre acionam a criação
      itemMutation.mutate({ name: itemName, category: itemCategory, unitOfMeasure: itemUnit });
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">🗂️ Cadastros Básicos</h1>
          <p className="text-slate-400 text-sm mt-1">Gerenciamento unificado de parceiros, modais de carga e itens operacionais.</p>
        </div>
        <button 
          onClick={abrirModalCriar}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold text-xs shadow-lg transition"
        >
          <Plus className="h-4 w-4" />
          Novo Registro
        </button>
      </div>

      {/* Menu de Abas */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => { setActiveTab('clientes'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all ${
            activeTab === 'clientes' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" /> Clientes
        </button>
        <button
          onClick={() => { setActiveTab('transportes'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all ${
            activeTab === 'transportes' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="h-4 w-4" /> Tipos de Transporte
        </button>
        <button
          onClick={() => { setActiveTab('itens'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all ${
            activeTab === 'itens' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Package className="h-4 w-4" /> Itens
        </button>
      </div>

      {sucessoMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="font-medium">{sucessoMsg}</p>
        </div>
      )}

      {/* Barra de Pesquisa */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-md">
        <Search className="h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder={`Consultar registros na aba de ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Tabela de Dados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400 font-mono text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">ID</th>
                {activeTab === 'clientes' && (
                  <>
                    <th className="py-3 px-4 font-medium">Razão Social / Nome</th>
                    <th className="py-3 px-4 font-medium">CNPJ / CPF</th>
                    <th className="py-3 px-4 font-medium">Localização</th>
                    <th className="py-3 px-4 font-medium">Contato</th>
                  </>
                )}
                {activeTab === 'transportes' && (
                  <>
                    <th className="py-3 px-4 font-medium">Descrição / Modal</th>
                    <th className="py-3 px-4 font-medium">Capacidade Máxima</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                  </>
                )}
                {activeTab === 'itens' && (
                  <>
                    <th className="py-3 px-4 font-medium">Nome do Produto</th>
                    <th className="py-3 px-4 font-medium">Categoria</th>
                    <th className="py-3 px-4 font-medium">Unidade de Medida</th>
                  </>
                )}
                <th className="py-3 px-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {activeTab === 'clientes' && (
                loadingClients ? (
                  <tr><td colSpan={6} className="py-6 text-center text-xs font-mono text-slate-500">Buscando compradores...</td></tr>
                ) : clients?.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/20 transition-colors text-xs">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-400">{c.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.document}</td>
                    <td className="py-3 px-4">{c.city} - {c.state}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      <div className="flex flex-col">
                        <span>{c.email || '—'}</span>
                        <span className="text-slate-500 text-[10px]">{c.phone || ''}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => abrirModalEditar(c)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 rounded-lg"><Edit2 className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                ))
              )}

              {activeTab === 'transportes' && (
                loadingTrans ? (
                  <tr><td colSpan={5} className="py-6 text-center text-xs font-mono text-slate-500">Buscando frotas...</td></tr>
                ) : transportTypes?.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/20 transition-colors text-xs">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-400">{t.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{t.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{t.capacity}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${t.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{t.active ? 'ATIVO' : 'INATIVO'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => abrirModalEditar(t)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 rounded-lg"><Edit2 className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                ))
              )}

              {activeTab === 'itens' && (
                loadingItems ? (
                  <tr><td colSpan={5} className="py-6 text-center text-xs font-mono text-slate-500">Buscando catálogo...</td></tr>
                ) : items?.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(i => (
                  <tr key={i.id} className="hover:bg-slate-800/20 transition-colors text-xs">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-400">{i.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{i.name}</td>
                    <td className="py-3 px-4 text-slate-400">{i.category}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{i.unitOfMeasure}</td>
                    {/* Indicador visual de Apenas Consulta conforme especificação e limitações da API */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-slate-500 font-mono text-[10px] bg-slate-950/40 px-2 py-1 rounded-md border border-slate-800/40 select-none">
                        Apenas Consulta
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MULTI-PROPÓSITO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                {editingId ? '📝 Editar Registro' : '✨ Novo Cadastro'} - {activeTab}
              </h2>
              <button onClick={fecharModal} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* FORM DE CLIENTES */}
              {activeTab === 'clientes' && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Razão Social *</label>
                    <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">CNPJ / CPF *</label>
                    <input type="text" required value={clientDoc} onChange={e => setClientDoc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Cidade *</label>
                      <input type="text" required value={clientCity} onChange={e => setClientCity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Estado *</label>
                      <input type="text" required maxLength={2} value={clientState} onChange={e => setClientState(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">E-mail Comercial</label>
                      <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="exemplo@empresa.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Telefone / Contato</label>
                      <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="(00) 00000-0000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                </>
              )}

              {/* FORM DE TRANSPORTES */}
              {activeTab === 'transportes' && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Descrição do Veículo *</label>
                    <input type="text" required placeholder="Ex: Rodoviário (Bitrem)" value={transName} onChange={e => setTransName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Capacidade de Carga *</label>
                    <input type="text" required placeholder="Ex: 57 TON" value={transCapacity} onChange={e => setTransCapacity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id="transActive" checked={transActive} onChange={e => setTransActive(e.target.checked)} className="h-4 w-4 rounded bg-slate-950 border-slate-800 accent-emerald-500" />
                    <label htmlFor="transActive" className="text-[10px] font-mono text-slate-300 uppercase cursor-pointer">Disponível para agendamento</label>
                  </div>
                </>
              )}

              {/* FORM DE ITENS */}
              {activeTab === 'itens' && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nome do Item *</label>
                    <input type="text" required placeholder="Ex: Bobina de Aço Gusa" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Categoria *</label>
                    <input type="text" required placeholder="Ex: Siderurgia" value={itemCategory} onChange={e => setItemCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Unidade de Medida *</label>
                    <input type="text" required placeholder="Ex: 100 TON, 50 KG, UN" value={itemUnit} onChange={e => setItemUnit(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </>
              )}

              <div className="border-t border-slate-800 pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={fecharModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold shadow-lg">
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}