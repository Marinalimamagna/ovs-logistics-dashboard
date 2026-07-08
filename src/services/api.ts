// ==========================================
// 1. DEFINIÇÃO DAS TIPAGENS EXPANDIDAS
// ==========================================

export type SalesOrder = {
  id: string;
  clientName: string;
  clientId?: string;      
  deliveryDate?: string;
  totalValue?: number;
  status: 'CRIADA' | 'PLANEJADA' | 'AGENDADA' | 'EM TRANSPORTE' | 'ENTREGUE';
  transportType?: string;
  driverName?: string;
  vehiclePlate?: string;
  deliveryWindow?: string;
  items?: any[];          
};

export type Client = {
  id: string;
  name: string;
  document: string;
  status: 'ATIVO' | 'INATIVO';
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
};

export type TransportType = {
  id: string;
  name: string;
  capacity: string;
  status: 'HOMOLOGADO' | 'INATIVO';
  active?: boolean;
};

export type ItemSKU = {
  id: string;
  name: string;
  category: string;
  price: number;
  unitOfMeasure?: string;
};

// ==========================================
// 2. DADOS INICIAIS MOCKADOS (CORRIGIDO PARA APENAS 5 ORDENS)
// ==========================================

const INITIAL_ORDERS: SalesOrder[] = [
  { 
    id: 'OVG-001', 
    clientName: 'Atacadista Central de Alimentos', 
    deliveryDate: '2026-07-10', 
    totalValue: 12500.00, 
    status: 'CRIADA', 
    transportType: 'Carreta', 
    driverName: '', 
    vehiclePlate: '',
    items: [{ sku: 'SKU-001', name: 'Carga Geral Alimentícia', quantity: 10 }]
  },
  { 
    id: 'OVG-002', 
    clientName: 'Indústria Metalúrgica Sul', 
    deliveryDate: '2026-07-12', 
    totalValue: 8900.50, 
    status: 'PLANEJADA', 
    transportType: 'Bi-truck', 
    driverName: 'Carlos Henrique', 
    vehiclePlate: 'ABC-1D23',
    items: [{ sku: 'SKU-002', name: 'Perfilados de Aço', quantity: 5 }]
  },
  { 
    id: 'OVG-003', 
    clientName: 'Distribuidora Fenix', 
    deliveryDate: '2026-07-14', 
    totalValue: 4200.00, 
    status: 'AGENDADA', 
    transportType: 'Caminhão', 
    driverName: 'Marcos Souza', 
    vehiclePlate: 'KXP-9A88',
    items: [{ sku: 'SKU-003', name: 'Caixas de Eletrodomésticos', quantity: 20 }]
  },
  { 
    id: 'OVG-004', 
    clientName: 'Supermercados Nova Era', 
    deliveryDate: '2026-07-09', 
    totalValue: 21000.00, 
    status: 'EM TRANSPORTE', 
    transportType: 'Carreta', 
    driverName: 'Antônio Alves', 
    vehiclePlate: 'MNO-4F56',
    items: [{ sku: 'SKU-004', name: 'Bebidas e Paletizados', quantity: 14 }]
  },
  { 
    id: 'OVG-005', 
    clientName: 'LogiOne Transportes Ltda', 
    deliveryDate: '2026-07-08', 
    totalValue: 5500.00, 
    status: 'ENTREGUE', 
    transportType: 'Caminhão', 
    driverName: 'Roberto Lima', 
    vehiclePlate: 'DVR-3B11',
    items: [{ sku: 'SKU-005', name: 'Compensados e Madeiras', quantity: 2 }]
  }
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'CLI-001', name: 'Atacadista Central de Alimentos', document: '12.345.678/0001-99', status: 'ATIVO', city: 'São Paulo', state: 'SP', email: 'contato@central.com', phone: '11999999999' },
  { id: 'CLI-002', name: 'LogiOne Transportes Ltda', document: '98.765.432/0001-88', status: 'ATIVO', city: 'Santos', state: 'SP', email: 'log@logione.com', phone: '13988888888' },
];

const INITIAL_TRANSPORT_TYPES: TransportType[] = [
  { id: 'TRA-001', name: 'Carreta', capacity: '27 Toneladas', status: 'HOMOLOGADO', active: true },
  { id: 'TRA-002', name: 'Bi-truck', capacity: '14 Toneladas', status: 'HOMOLOGADO', active: true },
];

const INITIAL_ITEMS: ItemSKU[] = [
  { id: 'SKU-001', name: 'Bobina de Aço Revestido', category: 'Siderurgia', price: 4500.00, unitOfMeasure: 'UN' },
  { id: 'SKU-002', name: 'Palete de Carga Geral', category: 'Logística', price: 150.00, unitOfMeasure: 'PCT' },
];

const KEYS = {
  ORDERS: 'gestor_ovgs_orders',
  CLIENTS: 'gestor_ovgs_clients',
  TRANSPORTS: 'gestor_ovgs_transports',
  ITEMS: 'gestor_ovgs_items',
};

// FORÇAR LIMPEZA DA MEMÓRIA ANTIGA DO NAVEGADOR LOGO NO CARREGAMENTO
if (typeof window !== 'undefined') {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
  localStorage.setItem(KEYS.TRANSPORTS, JSON.stringify(INITIAL_TRANSPORT_TYPES));
  localStorage.setItem(KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
}

async function getFromStorage<T>(key: string, initialData: T[]): Promise<T[]> {
  if (typeof window === 'undefined') return initialData;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
}

function saveToStorage<T extends { id: string }>(key: string, currentData: T[], entity: T): T[] {
  if (typeof window === 'undefined') return currentData;
  const index = currentData.findIndex(item => item.id === entity.id);
  if (index !== -1) {
    currentData[index] = { ...currentData[index], ...entity };
  } else {
    currentData.push(entity);
  }
  localStorage.setItem(key, JSON.stringify(currentData));
  return currentData;
}

// ==========================================
// 3. EXPORTAÇÃO DO SERVIÇO UNIFICADO
// ==========================================

export const apiService = {
  // --- ORDENS DE VENDA (OVGs) ---
  getOrders: () => getFromStorage<SalesOrder>(KEYS.ORDERS, INITIAL_ORDERS),
  
  saveOrder: async (order: Partial<SalesOrder> & { id?: string }) => {
    const list = await getFromStorage<SalesOrder>(KEYS.ORDERS, INITIAL_ORDERS);
    const clients = await getFromStorage<Client>(KEYS.CLIENTS, INITIAL_CLIENTS);

    const finalId = order.id || `OVG-${Math.floor(100 + Math.random() * 900)}`;
    
    let resolvedClientName = order.clientName || 'Cliente Geral';
    if (!order.clientName && order.clientId) {
      const found = clients.find(c => c.id === order.clientId);
      if (found) resolvedClientName = found.name;
    }

    const finalOrder: SalesOrder = {
      id: finalId,
      clientName: resolvedClientName,
      clientId: order.clientId,
      deliveryDate: order.deliveryDate || '',
      totalValue: Number(order.totalValue) || 0,
      status: order.status || 'CRIADA',
      transportType: order.transportType || '',
      driverName: order.driverName || '',
      vehiclePlate: order.vehiclePlate || '',
      deliveryWindow: order.deliveryWindow || '',
      items: order.items || []
    };

    return saveToStorage<SalesOrder>(KEYS.ORDERS, list, finalOrder);
  },

  updateOrderStatus: async (id: string, status: SalesOrder['status'], dataEntrega?: string, JANELA_TEXTO?: string) => {
    const list = await getFromStorage<SalesOrder>(KEYS.ORDERS, INITIAL_ORDERS);
    const index = list.findIndex(o => o.id === id);
    
    if (index !== -1) {
      list[index] = {
        ...list[index],
        status,
        ...(dataEntrega && { deliveryDate: dataEntrega }),
        ...(JANELA_TEXTO && { deliveryWindow: JANELA_TEXTO })
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.ORDERS, JSON.stringify(list));
      }
    }
    return list;
  },

  duplicateOrder: async (id: string) => {
    const list = await getFromStorage<SalesOrder>(KEYS.ORDERS, INITIAL_ORDERS);
    const original = list.find(o => o.id === id);
    if (!original) return list;
    
    const newId = `OVG-${Math.floor(100 + Math.random() * 900)}`;
    const duplicated: SalesOrder = {
      ...original,
      id: newId,
      clientName: `${original.clientName} (Cópia)`,
      status: 'CRIADA'
    };
    
    list.push(duplicated);
    if (typeof window !== 'undefined') localStorage.setItem(KEYS.ORDERS, JSON.stringify(list));
    return list;
  },

  // --- CLIENTES ---
  getClients: () => getFromStorage<Client>(KEYS.CLIENTS, INITIAL_CLIENTS),
  createClient: async (client: Client) => {
    const list = await getFromStorage<Client>(KEYS.CLIENTS, INITIAL_CLIENTS);
    return saveToStorage<Client>(KEYS.CLIENTS, list, client);
  },
  updateClient: async (first: any, second?: any) => {
    const clientData = second ? { ...second, id: first } : first;
    const list = await getFromStorage<Client>(KEYS.CLIENTS, INITIAL_CLIENTS);
    return saveToStorage<Client>(KEYS.CLIENTS, list, clientData);
  },

  // --- TRANSPORTADORAS ---
  getTransportTypes: () => getFromStorage<TransportType>(KEYS.TRANSPORTS, INITIAL_TRANSPORT_TYPES),
  createTransportType: async (transport: TransportType) => {
    const list = await getFromStorage<TransportType>(KEYS.TRANSPORTS, INITIAL_TRANSPORT_TYPES);
    return saveToStorage<TransportType>(KEYS.TRANSPORTS, list, transport);
  },
  updateTransportType: async (first: any, second?: any) => {
    const transportData = second ? { ...second, id: first } : first;
    const list = await getFromStorage<TransportType>(KEYS.TRANSPORTS, INITIAL_TRANSPORT_TYPES);
    return saveToStorage<TransportType>(KEYS.TRANSPORTS, list, transportData);
  },

  // --- ITENS / SKU ---
  getItems: () => getFromStorage<ItemSKU>(KEYS.ITEMS, INITIAL_ITEMS),
  createItem: async (item: ItemSKU) => {
    const list = await getFromStorage<ItemSKU>(KEYS.ITEMS, INITIAL_ITEMS);
    return saveToStorage<ItemSKU>(KEYS.ITEMS, list, item);
  },

  // --- RESET GLOBAL DE BASE LOCAL ---
  resetDatabase: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem(KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      localStorage.setItem(KEYS.TRANSPORTS, JSON.stringify(INITIAL_TRANSPORT_TYPES));
      localStorage.setItem(KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
    }
  }
};