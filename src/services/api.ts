import { mockOrders, mockClients, SalesOrder } from './mockData';

// === INTERFACES DE ENTIDADES ===
export interface Client {
  id: string;
  name: string;
  document: string;
  city: string;
  state: string;
  email?: string;
  phone?: string;
}

export interface TransportType {
  id: string;
  name: string;      // Ex: Rodoviário, Ferroviário, Marítimo
  capacity: string;  // Ex: 40 Toneladas, 15 Toneladas
  active: boolean;
}

export interface Item {
  id: string;
  name: string;        // Ex: Bobina de Aço, Chapa Galvanizada
  category: string;    // Ex: Siderurgia, Matéria-Prima
  unitOfMeasure: string; // Ex: TON, KG, UN
}

// 📌 REQUISITO IMPERATIVO: Interface Oficial de Logs de Auditoria
export interface AuditLog {
  id: string;
  timestamp: string;      // Data e hora do evento
  actionType: 'CREATE' | 'UPDATE' | 'STATUS_CHANGE'; // Tipo de ação
  entityAffected: 'sales_order' | 'appointment' | 'transport_type'; // Entidade afetada
  entityId: string;       // ID do registro modificado
  previousState: string | null; // Estado anterior (JSON string)
  nextState: string;      // Estado posterior (JSON string)
}

// === BANCO DE DADOS MOCK PARA NOVAS ENTIDADES ===
const mockTransportTypes: TransportType[] = [
  { id: 'TRA-001', name: 'Rodoviário (Carreta Graneleira)', capacity: '32 TON', active: true },
  { id: 'TRA-002', name: 'Rodoviário (Bitrem)', capacity: '57 TON', active: true },
  { id: 'TRA-003', name: 'Ferroviário (Vagão Plataforma)', capacity: '70 TON', active: true },
];

const mockItems: Item[] = [
  { id: 'ITEM-001', name: 'Bobina de Aço Laminado a Quente', category: 'Siderurgia', unitOfMeasure: 'TON' },
  { id: 'ITEM-002', name: 'Chapa de Aço Galvanizado 1.2mm', category: 'Siderurgia', unitOfMeasure: 'TON' },
  { id: 'ITEM-003', name: 'Perfil U Estrutural Dobrado', category: 'Estruturas', unitOfMeasure: 'KG' },
];

// Repositório global em memória para armazenar o histórico de auditoria
const mockAuditLogs: AuditLog[] = [];

// Helper para registrar logs de auditoria clonando estados de forma segura
const registerAudit = (
  actionType: AuditLog['actionType'],
  entityAffected: AuditLog['entityAffected'],
  entityId: string,
  previousState: any,
  nextState: any
) => {
  const newLog: AuditLog = {
    id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: new Date().toISOString(),
    actionType,
    entityAffected,
    entityId,
    previousState: previousState ? JSON.stringify(previousState) : null,
    nextState: JSON.stringify(nextState)
  };
  mockAuditLogs.unshift(newLog);
  console.log(`📡 [AUDITORIA]: Novo evento capturado -> (${actionType}) em ${entityAffected}`, newLog);
};

export const apiService = {
  // === ORDENS DE VENDA / AGENDAMENTO ===
  getOrders: async (): Promise<SalesOrder[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...mockOrders];
  },

  getOrderById: async (id: string): Promise<SalesOrder> => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error('Ordem de venda não encontrada.');
    return { ...order };
  },

  // 🔴 REQUISITO EVENTO 1 DE 4: Criação de Ordem de Venda
  createOrder: async (
    orderData: Omit<SalesOrder, 'id' | 'status' | 'totalValue'> & { clientId?: string; totalValue?: number; items?: any[] }
  ): Promise<SalesOrder> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const nextId = `OV-${String(mockOrders.length + 1).padStart(3, '0')}`;
    const newOrder: SalesOrder = {
      ...orderData,
      id: nextId,
      status: 'CRIADA',
      totalValue: orderData.totalValue || 0,
      items: orderData.items || []
    };

    if (!newOrder.clientId) {
      newOrder.clientId = `CLI-${String(mockClients.length + 1).padStart(3, '0')}`;
    }
    
    mockOrders.push(newOrder);
    registerAudit('CREATE', 'sales_order', newOrder.id, null, newOrder);
    return newOrder;
  },

  // 🔴 REQUISITO EVENTOS 2 E 3 DE 4: Alteração de Status Operacional e Agendamentos
  updateOrderStatus: async (id: string, status: any, deliveryDate?: string, deliveryWindow?: string): Promise<SalesOrder> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const orderIndex = mockOrders.findIndex((o) => o.id === id);
    if (orderIndex === -1) throw new Error('Ordem de venda não encontrada.');

    // 1. Captura o estado imutável anterior completo
    const previousStateCopy = JSON.parse(JSON.stringify(mockOrders[orderIndex]));

    // 2. Aplica as novas mutações de forma direta e preserva os campos existentes caso venham nulos
    if (status !== undefined && status !== null) {
      mockOrders[orderIndex].status = status;
    }
    if (deliveryDate !== undefined) mockOrders[orderIndex].deliveryDate = deliveryDate;
    if (deliveryWindow !== undefined) mockOrders[orderIndex].deliveryWindow = deliveryWindow;

    const updatedOrder = { ...mockOrders[orderIndex] };

    // 3. Discrimina dinamicamente a auditoria com base no gatilho que disparou a chamada
    if (deliveryDate || deliveryWindow) {
      registerAudit('UPDATE', 'appointment', id, previousStateCopy, updatedOrder);
    } else {
      registerAudit('STATUS_CHANGE', 'sales_order', id, previousStateCopy, updatedOrder);
    }

    return updatedOrder;
  },

  // === CRUD DE CLIENTES ===
  getClients: async (): Promise<Client[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockClients.map((c: any) => ({
      id: c.id,
      name: c.name,
      document: c.document,
      city: c.city || '',
      state: c.state || '',
      email: c.email || '',
      phone: c.phone || ''
    }));
  },

  createClient: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const nextId = `CLI-${String(mockClients.length + 1).padStart(3, '0')}`;
    
    const newClient: any = {
      id: nextId,
      name: clientData.name,
      document: clientData.document,
      city: clientData.city || '',
      state: clientData.state || ''
    };

    if (clientData.email) newClient.email = clientData.email;
    if (clientData.phone) newClient.phone = clientData.phone;

    mockClients.push(newClient);
    return newClient as Client;
  },

  updateClient: async (id: string, clientData: Omit<Client, 'id'>): Promise<Client> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const clientIndex = mockClients.findIndex((c) => c.id === id);
    if (clientIndex === -1) throw new Error('Cliente não encontrado.');

    mockClients[clientIndex].name = clientData.name;
    mockClients[clientIndex].document = clientData.document;
    mockClients[clientIndex].city = clientData.city || '';
    mockClients[clientIndex].state = clientData.state || '';
    
    if (clientData.email) (mockClients[clientIndex] as any).email = clientData.email;
    if (clientData.phone) (mockClients[clientIndex] as any).phone = clientData.phone;

    return { ...mockClients[clientIndex] } as any as Client;
  },

  // === CRUD: TIPOS DE TRANSPORTE ===
  getTransportTypes: async (): Promise<TransportType[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...mockTransportTypes];
  },

  createTransportType: async (data: Omit<TransportType, 'id'>): Promise<TransportType> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const nextId = `TRA-${String(mockTransportTypes.length + 1).padStart(3, '0')}`;
    const newTransport: TransportType = { id: nextId, ...data };
    mockTransportTypes.push(newTransport);
    return newTransport;
  },

  // 🔴 REQUISITO EVENTO 4 DE 4: Alteração de Transporte
  updateTransportType: async (id: string, data: Omit<TransportType, 'id'>): Promise<TransportType> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const idx = mockTransportTypes.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Tipo de transporte não encontrado.');

    const previousStateCopy = JSON.parse(JSON.stringify(mockTransportTypes[idx]));

    mockTransportTypes[idx] = { id, ...data };
    const updatedTransport = { ...mockTransportTypes[idx] };

    registerAudit('UPDATE', 'transport_type', id, previousStateCopy, updatedTransport);
    return updatedTransport;
  },

  // === CRUD: ITENS ===
  getItems: async (): Promise<Item[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...mockItems];
  },

  createItem: async (data: Omit<Item, 'id'>): Promise<Item> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const nextId = `ITEM-${String(mockItems.length + 1).padStart(3, '0')}`;
    const newItem: Item = { id: nextId, ...data };
    mockItems.push(newItem);
    return newItem;
  },

  // === EXPORTAÇÃO COMPLEMENTAR DO HISTÓRICO DE LOGS ===
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return [...mockAuditLogs];
  }
};