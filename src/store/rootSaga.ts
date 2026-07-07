import { all, delay, put, select, takeEvery } from 'redux-saga/effects';
import { updateMetrics, addLog } from './rootReducer';
import { RootState } from './index';

function* simulateRealTimeEvents(): any {
  while (true) {
    yield delay(4000); // Executa a cada 4 segundos
    const state: RootState = yield select();
    const metrics = state.monitor.metrics;

    const eventType = Math.random();
    if (eventType < 0.4) {
      yield put(updateMetrics({
        totalOrders: metrics.totalOrders + 1,
        pendingDelivery: metrics.pendingDelivery + 1
      }));
      yield put(addLog('Nova ordem recebida via integração ERP/EDI.'));
    } else if (eventType < 0.7) {
      if (metrics.pendingDelivery > 0) {
        yield put(updateMetrics({
          pendingDelivery: metrics.pendingDelivery - 1,
          inTransit: metrics.inTransit + 1
        }));
        yield put(addLog('Ordem de Venda faturada e despachada para trânsito.'));
      }
    } else {
      if (metrics.inTransit > 0) {
        yield put(updateMetrics({
          inTransit: metrics.inTransit - 1,
          delivered: metrics.delivered + 1
        }));
        yield put(addLog('Confirmação eletrônica de entrega recebida via app do motorista.'));
      }
    }
  }
}

export function* rootSaga() {
  yield all([
    simulateRealTimeEvents()
  ]);
}