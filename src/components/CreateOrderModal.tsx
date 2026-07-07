'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { X, Calendar } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrderModal({ isOpen, onClose }: CreateOrderModalProps) {
  const queryClient = useQueryClient();
  const [clientName, setClientName] = useState('');
  const [transportType, setTransportType] = useState('Não definido');
  const [totalValue, setTotalValue] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const createOrderMutation = useMutation<any, Error, any>({
    mutationFn: apiService.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      setClientName('');
      setTransportType('Não definido');
      setTotalValue('');
      setDeliveryDate('');
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return;

    createOrderMutation.mutate({
      clientName,
      transportType,
      totalValue: Number(totalValue) || 0,
      deliveryDate,
      items: [{ sku: 'SKU-000', name: 'Item Geral Padrão Vinculado', quantity: 1 }]
    } as any);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white">✨ Emitir Nova Ordem de Venda</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Nome do Cliente *</label>
            <input
              type="text"
              required
              placeholder="Ex: CD Atacadista Central"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Tipo de Transporte</label>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="Não definido">Não definido</option>
                <option value="Caminhão">Caminhão</option>
                <option value="Carreta">Carreta</option>
                <option value="Bi-truck">Bi-truck</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Valor Comercial (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Previsão de Entrega</label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition text-left scheme-dark cursor-pointer"
              />
              <Calendar className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createOrderMutation.isPending}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 transition flex items-center gap-2"
            >
              {createOrderMutation.isPending ? (
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Salvar Ordem'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}