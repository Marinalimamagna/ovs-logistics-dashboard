'use client';

import { useState, useEffect } from 'react';
import { apiService, SalesOrder } from '../../services/api';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function MonitoramentoPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

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

  // Filtra apenas as ordens que estão ativas no trânsito
  const activeMonitorOrders = orders.filter(
    (o) => o.status === 'EM TRANSPORTE' || o.status === 'AGENDADA'
  );

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-wider text-white">
            🖥️ Painel de Monitoramento Ativo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sincronização em tempo real das cargas em trânsito e rotas comerciais.
          </p>
        </div>
        <button 
          onClick={loadOrders}
          className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-mono text-slate-400 uppercase">
                <th className="p-4">ID OT</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Motorista</th>
                <th className="p-4">Placa</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs md:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-mono uppercase">Rastreando frotas...</td>
                </tr>
              ) : activeMonitorOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-mono uppercase">Nenhum veículo em trânsito no momento.</td>
                </tr>
              ) : (
                // Usando ID + index para garantir que a Key do React seja 100% única
                activeMonitorOrders.map((order, idx) => (
                  <tr key={`${order.id}-monitor-${idx}`} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {order.id.replace('OV-', 'OT-')}
                    </td>
                    <td className="p-4 font-semibold text-white">{order.clientName}</td>
                    <td className="p-4 text-slate-300">{order.driverName || 'Não Alocado'}</td>
                    <td className="p-4 font-mono text-slate-300">{order.vehiclePlate || '---'}</td>
                    <td className="p-4 text-right font-mono font-bold text-white">
                      {(order.totalValue ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border min-w-[110px]
                        ${order.status === 'AGENDADA' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}
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
      </div>
    </div>
  );
}