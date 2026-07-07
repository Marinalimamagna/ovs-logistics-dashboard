'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// 1. Definição clara da interface para evitar conflitos com o tipo 'SalesOrder'
interface ChartOrder {
  clientName?: string;
  status?: string;
  value?: number;
  totalValue?: number; // Suporte caso o campo venha como totalValue da API
  [key: string]: any;  // Permite outras propriedades flexíveis da SalesOrder
}

interface ChartsProps {
  orders: ChartOrder[];
}

export function AnalyticsCharts({ orders }: ChartsProps) {
  // 1. Tratamento de Dados para o Gráfico de Barras (Faturamento por Cliente)
  const clientDataMap: { [key: string]: number } = {};
  
  orders.forEach(order => {
    if (order && order.clientName) {
      // Garante a leitura do valor correto de forma segura
      const valorItem = order.value ?? order.totalValue ?? 0;
      clientDataMap[order.clientName] = (clientDataMap[order.clientName] || 0) + (Number(valorItem) || 0);
    }
  });

  const barChartData = Object.keys(clientDataMap).map(client => ({
    name: client.length > 15 ? `${client.substring(0, 15)}...` : client,
    'Faturamento (R$)': clientDataMap[client],
  }));

  // 2. Tratamento de Dados para o Gráfico de Pizza (Status das Ordens)
  const statusDataMap: { [key: string]: number } = {};
  orders.forEach(order => {
    if (order && order.status) {
      const status = order.status.toUpperCase();
      statusDataMap[status] = (statusDataMap[status] || 0) + 1;
    }
  });

  const pieChartData = Object.keys(statusDataMap).map(status => ({
    name: status,
    value: statusDataMap[status],
  }));

  // Cores corporativas combinando com o tema Dark do sistema
  const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      
      {/* Gráfico de Barras - Faturamento */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">
          📊 Volume de Faturamento por Cliente
        </h3>
        <div className="h-72 w-full text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontFamily: 'monospace' }}
                itemStyle={{ color: '#10b981', fontFamily: 'monospace' }}
              />
              <Bar dataKey="Faturamento (R$)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Pizza - Status */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">
          📦 Distribuição de Cargas por Status
        </h3>
        <div className="h-56 w-full text-xs font-mono relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ fontFamily: 'monospace' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda Customizada */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-4 border-t border-slate-800/60">
          {pieChartData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="text-slate-400 truncate">{entry.name} ({entry.value})</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}