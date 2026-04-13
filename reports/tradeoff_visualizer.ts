export interface TradeoffBar {
  label: string;
  value: number;
  detail?: string;
}

export function buildTradeoffVisualization(data: TradeoffBar[]) {
  return data.map((entry) => ({
    ...entry,
    normalized: Math.max(0, Math.min(entry.value, 100)),
    display: `${entry.label}: ${entry.value}`,
  }));
}
