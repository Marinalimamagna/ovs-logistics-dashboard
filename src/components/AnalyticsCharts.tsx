'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartOrder {
  clientName?: string;
  status?: string;
  value?: number;
  totalValue?: number;
  [key: string]: any;
}

interface ChartsProps {
  orders: ChartOrder[];
}

export function AnalyticsCharts({ orders }: ChartsProps) {
  // 1. Tratamento de Dados para o Gráfico de Barras (Faturamento por Cliente)
  const clientDataMap: { [key: string]: number } = {};
  
  orders.forEach(order => {
    if (order && order.clientName) {
      const valorItem = order.value ?? order.totalValue ?? 0;
      clientDataMap[order.clientName] = (clientDataMap[order.clientName] || 0) + (Number(valorItem) || 0);
    }
  });

  // Paleta de Cores Dinâmicas para as Barras de Clientes / Transportadoras
  const BAR_COLORS = [
    '#fdba74', // Laranja Pêssego (Sotaque original)
    '#38bdf8', // Azul Claro brilhante
    '#5eead4', // Verde-água / Menta
    '#a7f3d0', // Verde Menta Pastel sutil
    '#a8a29e', // Cinza neutro moderno
  ];

  const barChartData = Object.keys(clientDataMap)
    .map(client => ({
      name: client.length > 12 ? `${client.substring(0, 12)}...` : client,
      'Faturamento (R$)': clientDataMap[client],
    }))
    .sort((a, b) => b['Faturamento (R$)'] - a['Faturamento (R$)'])
    .slice(0, 5);

  // 2. Tratamento Dinâmico de Dados para o Gráfico de Rosca
  const statusDataMap: { [key: string]: number } = {};
  orders.forEach(order => {
    if (order && order.status) {
      const status = String(order.status).trim().toUpperCase();
      statusDataMap[status] = (statusDataMap[status] || 0) + 1;
    }
  });

  const STATUS_COLORS: { [key: string]: string } = {
    'CRIADA': '#a8a29e',         
    'PLANEJADA': '#a7f3d0',      
    'AGENDADA': '#38bdf8',       
    'EM TRANSPORTE': '#fdba74',  
    'EM_TRANSPORTE': '#fdba74',  
    'ENTREGUE': '#2dd4bf',       
    'PENDENTE': '#fca5a5',       
  };

  const pieChartData = Object.keys(statusDataMap).map(status => ({
    name: status,
    value: statusDataMap[status],
    color: STATUS_COLORS[status] || '#64748b'
  }));

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full text-slate-300">
      
      {/* Gráfico de Barras - Faturamento por Cliente (Cores Dinâmicas por Barra) */}
      <div className="lg:col-span-2 bg-[#0d1527] border border-slate-800/60 rounded-2xl p-5 shadow-sm">
        <h3 className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-6">
          VOLUME DE FATURAMENTO POR CLIENTE
        </h3>
        <div className="h-64 w-full text-[11px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" tickLine={false} />
              <YAxis stroke="#475569" tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v/1000}k`} />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), 'Faturamento']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f1f5f9' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="Faturamento (R$)" radius={[4, 4, 0, 0]} barSize={28}>
                {/* CORREÇÃO DO SEU PEDIDO: Colorindo cada barra com uma cor diferente da paleta */}
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Rosca - Ordens de Serviço (Quantidade) */}
      <div className="lg:col-span-1 bg-[#0d1527] border border-slate-800/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <h3 className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-4">
          ORDENS DE SERVIÇO (QUANTIDADE)
        </h3>
        
        <div className="h-48 w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-pie-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value} ordens`, 'Quantidade']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f1f5f9' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold text-white tracking-tight">
              {orders.length}
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">
              Total OVs
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 text-[10px] font-medium pt-4 border-t border-slate-800/40">
          {pieChartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
              <span className="uppercase text-slate-400">
                {entry.name}: <span className="text-slate-300 font-semibold">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}