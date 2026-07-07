// === DEFINIÇÃO DA INTERFACE UNIFICADA DE ORDENS ===
export interface SalesOrder {
  id: string;
  clientId?: string;
  clientName: string;
  itemName: string;
  quantity: number;
  totalValue: number; // Obrigatório para evitar erros de overload de formatação
  transportType: string;
  status: string; // Tipo genérico para evitar conflitos com o fluxo sequencial de strings do frontend
  deliveryDate?: string;
  deliveryWindow?: string;
  items?: any[]; // Suporte crucial para renderizar a listagem e o painel de detalhes da ordem
}

// === MASSA DE DADOS INICIAL (MOCK) ===
export const mockClients: any[] = [
  { id: 'CLI-001', name: 'Logística Brasil S.A.', document: '12.345.678/0001-99', city: 'São Paulo', state: 'SP' },
  { id: 'CLI-002', name: 'CD Atacadista Central', document: '98.765.432/0001-88', city: 'Rio de Janeiro', state: 'RJ' },
  { id: 'CLI-003', name: 'Navegação Atlântico Sul', document: '45.678.901/0001-77', city: 'Santos', state: 'SP' }
];

export const mockOrders: SalesOrder[] = [
  { 
    id: 'OV-001', 
    clientId: 'CLI-001',
    clientName: 'Logística Brasil S.A.', 
    itemName: 'Bobina de Aço Laminado a Quente', 
    quantity: 150, 
    totalValue: 45000,
    transportType: 'Rodoviário (Bitrem)', 
    status: 'PLANEJADA',
    deliveryDate: '2026-07-13',
    deliveryWindow: 'MANHA',
    items: []
  },
  { 
    id: 'OV-002', 
    clientId: 'CLI-002',
    clientName: 'CD Atacadista Central', 
    itemName: 'Chapa de Aço Galvanizado 1.2mm', 
    quantity: 80, 
    totalValue: 24000,
    transportType: 'Rodoviário (Carreta Graneleira)', 
    status: 'PENDENTE',
    deliveryDate: '2026-07-14',
    deliveryWindow: 'TARDE',
    items: []
  }
];