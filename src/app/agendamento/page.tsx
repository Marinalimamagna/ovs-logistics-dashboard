'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, SalesOrder } from '../../services/api';
import { Calendar, Clock, RefreshCw, ArrowLeftRight, CheckSquare, FileText } from 'lucide-react';
import { toast } from 'sonner';

// Configuração da capacidade máxima permitida para cada janela operacional
const CAPACIDADE_JANELAS = [
  { id: 'M1', label: 'Manhã 1 (08:00 - 10:00)', total: 3, horario: '08:00 - 10:00' },
  { id: 'M2', label: 'Manhã 2 (10:00 - 12:00)', total: 1, horario: '10:00 - 12:00' },
  { id: 'T1', label: 'Tarde 1 (13:00 - 15:00)', total: 5, horario: '13:00 - 15:00' },
  { id: 'T2', label: 'Tarde 2 (15:00 - 17:00)', total: 0, horario: '15:00 - 17:00' },
];

export default function AgendamentoPage() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [inputDate, setInputDate] = useState<string>('');
  const [selectedJanela, setSelectedJanela] = useState<string>('');

  // Busca as ordens comerciais globais
  const { data: orders, isLoading, refetch, isFetching } = useQuery<SalesOrder[]>({
    queryKey: ['sales-orders'],
    queryFn: apiService.getOrders,
  });

  // Função para sincronização manual limpando o cache
  const handleSincronizar = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      await refetch();
      toast.success('Dados sincronizados com o banco com sucesso!');
    } catch (error) {
      toast.error('Erro ao tentar sincronizar os dados.');
    }
  };

  // Mutação para salvar o agendamento/reagendamento
  const agendarMutation = useMutation({
    mutationFn: async ({ id, dataEntrega, janelaTexto }: { id: string; dataEntrega: string; janelaTexto: string }) => {
      const { data: currentOrders } = await refetch();
      const ordemOriginal = currentOrders?.find(o => o.id === id);
      
      return await apiService.saveOrder({
        ...ordemOriginal,
        id,
        status: 'AGENDADA',
        deliveryDate: dataEntrega,
        deliveryWindow: janelaTexto,
      } as SalesOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      toast.success('Agendamento confirmado com sucesso!');
      setSelectedOrderId('');
      setInputDate('');
      setSelectedJanela('');
    },
    onError: () => {
      toast.error('Erro ao realizar o agendamento.');
    }
  });

  // Mutação para atualização de status (Dar baixa)
  const darBaixaMutation = useMutation({
    mutationFn: async ({ id, novoStatus }: { id: string; novoStatus: string }) => {
      const { data: currentOrders } = await refetch();
      const ordemOriginal = currentOrders?.find(o => o.id === id);
      
      return await apiService.saveOrder({
        ...ordemOriginal,
        id,
        status: novoStatus,
      } as SalesOrder);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      toast.success(`Ordem ${variables.id} atualizada para ${variables.novoStatus}!`);
      if (selectedOrderId === variables.id) setSelectedOrderId('');
    },
    onError: () => {
      toast.error('Erro ao atualizar status da ordem.');
    }
  });

  // Filtro de Ordens Ativas
  const ordensElegiveis = orders?.filter(o => 
    ['CRIADA', 'PENDENTE', 'PLANEJADA', 'AGENDADA', 'EM TRANSPORTE', 'ENTREGUE'].includes(o.status.toUpperCase())
  ) || [];

  // Ordenação Padrão: Data mais próxima primeiro
  const ordensOrdenadas = [...ordensElegiveis].sort((a, b) => {
    if (!a.deliveryDate) return 1;
    if (!b.deliveryDate) return -1;
    return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
  });

  const ordensParaAgendar = ordensOrdenadas.filter(o => 
    ['CRIADA', 'PENDENTE', 'PLANEJADA', 'AGENDADA', 'EM TRANSPORTE'].includes(o.status.toUpperCase())
  );

  const ordemSelecionadaObj = orders?.find(o => o.id === selectedOrderId);
  const jaAgendada = ordemSelecionadaObj?.status === 'AGENDADA';

  // Lógica de vagas dinâmicas
  const janelasComVagasDinamicas = CAPACIDADE_JANELAS.map(janela => {
    const agendamentosExistentes = ordensElegiveis.filter(o => {
      const rawWindow = o.deliveryWindow || (o as any).horario || '';
      return o.status.toUpperCase() === 'AGENDADA' && rawWindow === janela.horario;
    }).length;

    const vagasDisponiveis = Math.max(0, janela.total - agendamentosExistentes);

    return { ...janela, vagas: vagasDisponiveis };
  });

  const handleSalvarAgendamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !inputDate || !selectedJanela) return;

    const janelaObj = janelasComVagasDinamicas.find(j => j.id === selectedJanela);
    if (janelaObj && janelaObj.vagas === 0) {
      toast.error('Esta janela de atendimento está lotada!');
      return;
    }

    const janelaTexto = janelaObj ? janelaObj.horario : '';
    agendarMutation.mutate({ id: selectedOrderId, dataEntrega: inputDate, janelaTexto });
  };

  return (
    <div className="space-y-6 w-full px-4 md:px-0 text-slate-100 font-sans antialiased">
      
      {/* 🔹 TÍTULO E DESCRIÇÃO ATUALIZADOS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">🗓️ Central de Agendamento</h1>
          <p className="text-slate-400 text-sm mt-1">Gerenciamento de janelas operacionais, reagendamentos e fluxo de entrada/saída do pátio.</p>
        </div>
        <button 
          type="button"
          onClick={handleSincronizar} 
          disabled={isLoading || isFetching} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 active:bg-slate-800 rounded-xl text-slate-200 border border-slate-700/60 shadow-md transition font-mono text-xs w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isFetching ? 'animate-spin' : ''}`} />
          Sincronizar Dados
        </button>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
        
        {/* 🔹 LADO ESQUERDO — FORMULÁRIO ATUALIZADO */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-700/40 rounded-2xl p-6 shadow-2xl shadow-emerald-950/5 space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 border-b border-slate-800 pb-3">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span className="font-bold uppercase tracking-wider">Configurar Janela</span>
          </div>

          <form onSubmit={handleSalvarAgendamento} className="space-y-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-2">
                <FileText className="h-3.5 w-3.5 text-slate-400" /> Selecionar Ordem de Venda
              </label>
              <select
                required
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  const o = orders?.find(ord => ord.id === e.target.value);
                  if (o && o.deliveryDate) setInputDate(o.deliveryDate);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="">Selecione uma Ordem...</option>
                {ordensParaAgendar.map((o, idx) => (
                  <option key={`${o.id}-opt-${idx}`} value={o.id}>
                    {o.id} — {o.clientName} ({o.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Data Prevista de Entrega
              </label>
              <input
                type="date"
                required
                disabled={!selectedOrderId}
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-left mb-1"
              />
              <span className="block text-[10px] text-slate-500 font-mono pl-1">Formato: dd/mm/aaaa</span>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-2">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Janela de Atendimento
              </label>
              <div className="space-y-3">
                {janelasComVagasDinamicas.map((janela) => {
                  const lotada = janela.vagas === 0;
                  return (
                    <label
                      key={janela.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-mono transition-all duration-200 ${
                        lotada 
                          ? 'bg-red-500/5 border-red-500/20 text-red-500/80 cursor-not-allowed font-bold' 
                          : selectedJanela === janela.id 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold ring-1 ring-emerald-500/30' 
                            : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="janela"
                          required
                          disabled={lotada || !selectedOrderId}
                          checked={selectedJanela === janela.id}
                          onChange={() => setSelectedJanela(janela.id)}
                          className="accent-emerald-500 h-3.5 w-3.5"
                        />
                        <span>{janela.label}</span>
                      </div>
                      
                      <span className={`text-[10px] uppercase tracking-wide ${
                        lotada ? 'text-red-500 font-extrabold' : 'text-emerald-400/90'
                      }`}>
                        {lotada ? '— LOTADA' : `— ${janela.vagas} vagas disponíveis`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={agendarMutation.isPending || !selectedOrderId || !inputDate || !selectedJanela}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                !selectedOrderId || !selectedJanela
                  ? 'bg-slate-800 text-slate-500 border border-slate-700/40 cursor-not-allowed shadow-none'
                  : jaAgendada 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/20'
              } ${selectedOrderId && selectedJanela ? 'cursor-pointer' : ''}`}
            >
              {agendarMutation.isPending ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : jaAgendada ? (
                <>
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  Confirmar Reagendamento
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  Confirmar Agendamento
                </>
              )}
            </button>
          </form>
        </div>

        {/* 🔹 LADO DIREITO — LISTA ATUALIZADA */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl lg:border-l lg:border-l-slate-800">
          
          {/* LEGENDAS DE STATUS PADRONIZADAS DO SISTEMA */}
          <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-sans font-bold text-slate-300 tracking-tight">Monitoramento Logístico de Cargas</h2>
            <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono uppercase tracking-wider">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500"></span> CRIADA</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400"></span> PLANEJADA</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600"></span> AGENDADA</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> EM TRANSPORTE</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> ENTREGUE</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-950/30 border-b border-slate-800 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold">ID ORDEM</th>
                  <th className="py-3.5 px-4 font-bold">CLIENTE</th>
                  {/* ALINHAMENTOS REQUISITADOS À DIREITA */}
                  <th className="py-3.5 px-4 font-bold text-right">DATA PREVISTA</th>
                  <th className="py-3.5 px-4 font-bold text-right">JANELA DE ATENDIMENTO</th>
                  <th className="py-3.5 px-4 font-bold text-right pr-6">STATUS ATUAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs font-mono text-slate-500">Estruturando dados visuais...</td>
                  </tr>
                ) : ordensOrdenadas.length > 0 ? (
                  ordensOrdenadas.map((o, idx) => {
                    const rawWindow = o.deliveryWindow || (o as any).horario || '';
                    const isAgendada = o.status.toUpperCase() === 'AGENDADA';
                    const isSelected = selectedOrderId === o.id;

                    return (
                      <tr 
                        key={`${o.id}-row-${idx}`} 
                        onClick={() => {
                          setSelectedOrderId(o.id);
                          if (o.deliveryDate) setInputDate(o.deliveryDate);
                        }}
                        className={`hover:bg-slate-800/20 border-l-2 transition-all duration-150 text-xs cursor-pointer py-4 ${
                          isSelected ? 'bg-slate-800/30 border-l-emerald-500 text-white' : 'border-l-transparent'
                        }`}
                      >
                        <td className="py-4 px-4 font-mono font-bold text-emerald-400">{o.id}</td>
                        <td className="py-4 px-4 font-medium text-slate-200">{o.clientName}</td>
                        
                        {/* Data Prevista Alinhada à Direita */}
                        <td className="py-4 px-4 font-mono text-slate-300 text-right">
                          {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        
                        {/* Janela de Atendimento Alinhada à Direita com Fallback */}
                        <td className="py-4 px-4 font-mono text-right">
                          {isAgendada && rawWindow ? (
                            <span className="text-blue-400 font-medium">🕒 {rawWindow}</span>
                          ) : (
                            <span className="text-slate-500 font-sans italic">— Não definida</span>
                          )}
                        </td>
                        
                        {/* Status Alinhado à Direita com as Cores Padrão */}
                        <td className="py-3 px-4 text-right pr-6 flex items-center justify-end gap-2.5 h-full">
                          {isAgendada && (
                            <button
                              type="button"
                              title="Dar Baixa Rápida (Em Transporte)"
                              disabled={darBaixaMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                darBaixaMutation.mutate({ id: o.id, novoStatus: 'EM TRANSPORTE' });
                              }}
                              className="p-1 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-md border border-slate-800 hover:border-amber-500/20 transition-all duration-150 cursor-pointer"
                            >
                              <CheckSquare className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold font-mono border tracking-wider min-w-[120px] uppercase ${
                            o.status.toUpperCase() === 'CRIADA'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : o.status.toUpperCase() === 'PLANEJADA'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                : o.status.toUpperCase() === 'AGENDADA'
                                  ? 'bg-blue-600/10 text-blue-500 border-blue-600/20'
                                  : o.status.toUpperCase() === 'EM TRANSPORTE'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs font-mono text-slate-600">Nenhuma movimentação logística ativa na base de dados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}