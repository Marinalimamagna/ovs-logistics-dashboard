import { apiService } from './api';

describe('🧪 Validação de Regras de Negócio e Auditoria (Logix Senior)', () => {
  
  // Teste Unitário 1: Fluxo de Status
  test('Deve permitir a transição e avanço sequencial do status da ordem', async () => {
    const logAntes = await apiService.getAuditLogs();
    const totalLogsAntes = logAntes.length;

    // Atualiza o status de uma ordem existente
    await apiService.updateOrderStatus('OV-001', 'AGENDADA');
    
    const logsDepois = await apiService.getAuditLogs();
    expect(logsDepois.length).toBeGreaterThan(totalLogsAntes);
    expect(logsDepois[logsDepois.length - 1].actionType).toBe('STATUS_CHANGE');
  });

  // Teste Unitário 2: Fluxo de Transporte
  test('Deve gerar log estruturado com estado anterior e posterior ao editar tipo de transporte', async () => {
    await apiService.updateTransportType('TRA-001', {
      name: 'Rodoviário (Bitrem) Atualizado',
      capacity: '60 TON',
      active: true
    });

    const logs = await apiService.getAuditLogs();
    const logTransporte = logs.find(l => l.entityAffected === 'transport_type');

    expect(logTransporte).toBeDefined();
    expect(JSON.parse(logTransporte.nextState).capacity).toBe('60 TON');
  });

  // Teste de Integração: Fluxo Ponta a Ponta
  test('Deve integrar a emissão de nova ordem com persistência e rastreabilidade automática', async () => {
    const novaOrdem = await apiService.createOrder({
      clientName: 'Navegação Atlântico Sul',
      itemName: 'Containers de Carga Geral',
      quantity: 5,
      transportType: 'Rodoviário'
    });

    expect(novaOrdem.id).toBeDefined();
    
    const logs = await apiService.getAuditLogs();
    const logCriacao = logs.find(l => l.actionType === 'CREATE' && l.entityId === novaOrdem.id);
    expect(logCriacao).toBeDefined();
  });
});