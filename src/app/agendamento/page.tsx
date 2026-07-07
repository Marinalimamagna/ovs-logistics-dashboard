'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { Calendar, CheckCircle2, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

const JANELAS_ATENDIMENTO = [
  { id: 'M1', label: 'Manhã 1 (08:00 - 10:00)', vagas: 3, horario: '08:00 - 10:00' },
  { id: 'M2', label: 'Manhã 2 (10:00 - 12:00)', vagas: 1, horario: '10:00 - 12:00' },
  { id: 'T1', label: 'Tarde 1 (13:00 - 15:00)', vagas: 5, horario: '13:00 - 15:00' },
  { id: 'T2', label: 'Tarde 2 (15:00 - 17:00)', vagas: 0, horario: '15:00 - 17:00' },
];

export default function AgendamentoPage() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [inputDate, setInputDate] = useState<string>('');
  const [selectedJanela, setSelectedJanela] = useState<string>('');

  const { data: orders, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: apiService.getOrders,
  });

  const agendarMutation = useMutation({
    mutationFn: async ({ id, dataEntrega, janelaTexto }: { id: string; dataEntrega: string; janelaTexto: string }) => {
      return await apiService.updateOrderStatus(id, 'AGENDADA', dataEntrega, janelaTexto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      
      toast.success('Agendamento confirmado com sucesso no sistema!');
      
      setSelectedOrderId('');
      setInputDate('');
      setSelectedJanela('');
    },
    onError: () => {
      toast.error('Erro ao realizar o agendamento. Tente novamente.');
    }
  });

  const ordensElegiveis = orders?.filter(o => 
    ['CRIADA', 'PENDENTE', 'PLANEJADA', 'AGENDADA', 'ENTREGUE', 'CONCLUIDA'].includes(o.status.toUpperCase())
  ) || [];

  const ordensParaAgendar = ordensElegiveis.filter(o => 
    !['ENTREGUE', 'CONCLUIDA'].includes(o.status.toUpperCase())
  );

  const ordemSelecionadaObj = orders?.find(o => o.id === selectedOrderId);
  const jaAgendada = ordemSelecionadaObj?.status === 'AGENDADA';

  const handleSalvarAgendamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !inputDate || !selectedJanela) return;

    const janelaObj = JANELAS_ATENDIMENTO.find(j => j.id === selectedJanela);
    const janelaTexto = janelaObj ? janelaObj.horario : '';

    agendarMutation.mutate({
      id: selectedOrderId,
      dataEntrega: inputDate,
      janelaTexto: janelaTexto
    });
  };

  return (
    <div className="space-y-6 w-full px-4 md:px-0">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">🗓️ Central de Agendamento</h1>
          <p className="text-slate-400 text-sm mt-1">Definição de janelas de entrega, confirmações e reagendamentos de cargas.</p>
        </div>
        <button 
          onClick={() => refetch()} 
          disabled={isLoading || isFetching} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 transition font-mono text-xs w-full sm:w-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
        
        {/* Painel de Formulação */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span className="font-bold uppercase tracking-wider">Configurar Janela</span>
          </div>

          <form onSubmit={handleSalvarAgendamento} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Selecionar Ordem de Venda</label>
              <select
                required
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  const o = orders?.find(ord => ord.id === e.target.value);
                  if (o && o.deliveryDate) setInputDate(o.deliveryDate);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="">Escolha uma Ordem...</option>
                {ordensParaAgendar.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} - {o.clientName} ({o.status.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Definição da Data de Entrega</label>
              <input
                type="date"
                required
                disabled={!selectedOrderId}
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer disabled:opacity-40"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Janela de Atendimento (Simulada)</label>
              <div className="space-y-2">
                {JANELAS_ATENDIMENTO.map((janela) => {
                  const lotada = janela.vagas === 0;
                  return (
                    <label
                      key={janela.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                        lotada ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed' :
                        selectedJanela === janela.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' :
                        'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="janela"
                          required
                          disabled={lotada || !selectedOrderId}
                          checked={selectedJanela === janela.id}
                          onChange={() => setSelectedJanela(janela.id)}
                          className="accent-emerald-500"
                        />
                        <span>{janela.label}</span>
                      </div>
                      <span className={lotada ? 'text-red-500/70 font-bold' : 'text-slate-500'}>
                        {lotada ? 'Lotada' : `${janela.vagas} vagas`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={agendarMutation.isPending || !selectedOrderId || !inputDate || !selectedJanela}
              className={`w-full py-2.5 rounded-xl font-bold text-xs font-mono transition flex items-center justify-center gap-2 shadow-lg ${
                jaAgendada 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/10' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/10'
              } disabled:opacity-40`}
            >
              {agendarMutation.isPending ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : jaAgendada ? (
                <>
                  <ArrowLeftRight className="h-4 w-4" />
                  CONFIRMAR REAGENDAMENTO
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  CONFIRMAR AGENDAMENTO
                </>
              )}
            </button>
          </form>
        </div>

        {/* Listagem Informativa de Monitoramento */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Status de Entrega das Ordens Ativas</span>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400"></span> Entregue</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400"></span> Agendada</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-400"></span> Criada</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-950/20 border-b border-slate-800 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">ID Ordem</th>
                  <th className="py-3 px-4 font-medium">Cliente</th>
                  <th className="py-3 px-4 font-medium">Data</th>
                  <th className="py-3 px-4 font-medium">Horário / Janela</th>
                  <th className="py-3 px-4 font-medium text-center">Status Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs font-mono text-slate-500">Carregando dados...</td>
                  </tr>
                ) : ordensElegiveis.length > 0 ? (
                  ordensElegiveis.map((o) => {
                    const rawWindow = (o as any).deliveryWindow || (o as any).horario || (o as any).window || '';
                    let displayWindow = rawWindow;
                    
                    if (typeof rawWindow === 'string') {
                      if (rawWindow.toUpperCase() === 'MANHÃ') displayWindow = '08:00 - 12:00';
                      if (rawWindow.toUpperCase() === 'TARDE') displayWindow = '13:00 - 17:00';
                    }

                    return (
                      <tr 
                        key={o.id} 
                        onClick={() => {
                          if (!['ENTREGUE', 'CONCLUIDA'].includes(o.status.toUpperCase())) {
                            setSelectedOrderId(o.id);
                            if (o.deliveryDate) setInputDate(o.deliveryDate);
                          }
                        }}
                        className={`hover:bg-slate-800/20 transition-colors text-xs ${
                          ['ENTREGUE', 'CONCLUIDA'].includes(o.status.toUpperCase()) 
                            ? 'cursor-not-allowed opacity-75' 
                            : 'cursor-pointer'
                        } ${selectedOrderId === o.id ? 'bg-slate-800/40' : ''}`}
                      >
                        <td className="py-3 px-4 font-mono font-medium text-emerald-400">{o.id}</td>
                        <td className="py-3 px-4 font-medium text-white">{o.clientName}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {o.deliveryDate && !isNaN(Date.parse(o.deliveryDate)) 
                            ? new Date(o.deliveryDate).toLocaleDateString('pt-BR') 
                            : 'Aguardando Data'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 font-medium">
                          {displayWindow ? (
                            <span className="text-emerald-400/90 flex items-center gap-1">🕒 {displayWindow}</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border tracking-wider min-w-[90px] ${
                            ['ENTREGUE', 'CONCLUIDA'].includes(o.status.toUpperCase())
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : o.status.toUpperCase() === 'AGENDADA' 
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs font-mono text-slate-500">Nenhuma ordem comercial disponível.</td>
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