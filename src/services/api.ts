// ==========================================
// 1. DEFINIÇÃO DAS TIPAGENS EXPANDIDAS
// ==========================================

export type SalesOrder = {
  id: string;
  clientName: string;
  deliveryDate?: string;
  totalValue?: number;
  status: 'CRIADA' | 'PLANEJADA' | 'AGENDADA' | 'EM TRANSPORTE' | 'ENTREGUE';
  transportType?: string;
  driverName?: string;
  vehiclePlate?: string;
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
// 2. DADOS INICIAIS MOCKADOS
// ==========================================

const INITIAL_ORDERS: SalesOrder[] = [
  { id: 'OVG-001', clientName: 'CD Atacadista Central', deliveryDate: '2026-07-29', totalValue: 8900.00, status: 'AGENDADA', transportType: 'Carreta', driverName: 'Marcos Silva', vehiclePlate: 'ABC-1234' },
  { id: 'OVG-002', clientName: 'Navegação Atlântico Sul', deliveryDate: '2026-07-07', totalValue: 85.00, status: 'CRIADA', transportType: 'Bi-truck', driverName: 'Carlos Souza', vehiclePlate: 'DEF-5678' },
  { id: 'OVG-003', clientName: 'Navegação Atlântico Sul', deliveryDate: '2026-07-29', totalValue: 650.00, status: 'AGENDADA', transportType: 'Bi-truck' },
  { id: 'OVG-004', clientName: 'Transportes Mercosul', deliveryDate: '', totalValue: 170.00, status: 'AGENDADA', transportType: 'Caminhão' },
  { id: 'OVG-005', clientName: 'Logística Brasil S.A.', deliveryDate: '2026-07-14', totalValue: 2500.00, status: 'EM TRANSPORTE' },
  { id: 'OVG-006', clientName: 'CD Atacadista Central', deliveryDate: '2026-07-19', totalValue: 4250.00, status: 'PLANEJADA' },
  { id: 'OVG-007', clientName: 'Navegação Atlântico Sul', deliveryDate: '2026-07-30', totalValue: 8900.00, status: 'ENTREGUE' },
  { id: 'OVG-008', clientName: 'Siderúrgica Nacional S.A.', deliveryDate: '2026-07-24', totalValue: 6500.00, status: 'ENTREGUE' }
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'CLI-001', name: 'CD Atacadista Central', document: '12.345.678/0001-99', status: 'ATIVO', city: 'São Paulo', state: 'SP', email: 'contato@central.com', phone: '11999999999' },
  { id: 'CLI-002', name: 'Navegação Atlântico Sul', document: '98.765.432/0001-88', status: 'ATIVO', city: 'Santos', state: 'SP', email: 'log@atlantico.com', phone: '13988888888' },
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
  
  saveOrder: async (order: SalesOrder) => {
    const list = await getFromStorage<SalesOrder>(KEYS.ORDERS, INITIAL_ORDERS);
    return saveToStorage<SalesOrder>(KEYS.ORDERS, list, order);
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