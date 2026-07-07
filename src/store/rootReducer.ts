import { combineReducers } from '@reduxjs/toolkit';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MonitorState {
  metrics: {
    totalOrders: number;
    pendingDelivery: number;
    inTransit: number;
    delivered: number;
  };
  recentLogs: string[];
}

const initialState: MonitorState = {
  metrics: { totalOrders: 142, pendingDelivery: 28, inTransit: 14, delivered: 100 },
  recentLogs: ['[SISTEMA] Conexão operacional iniciada.', '[API] Sincronização de KPIs concluída.']
};

const monitorSlice = createSlice({
  name: 'monitor',
  initialState,
  reducers: {
    updateMetrics(state, action: PayloadAction<Partial<typeof initialState.metrics>>) {
      state.metrics = { ...state.metrics, ...action.payload };
    },
    addLog(state, action: PayloadAction<string>) {
      state.recentLogs.unshift(`[${new Date().toLocaleTimeString()}] ${action.payload}`);
      if (state.recentLogs.length > 6) state.recentLogs.pop();
    }
  }
});

export const { updateMetrics, addLog } = monitorSlice.actions;

export const rootReducer = combineReducers({
  monitor: monitorSlice.reducer
});