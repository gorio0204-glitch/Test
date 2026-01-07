
export interface Deal {
  id: string;
  agentId: string;
  dealDate: string;
  salesSubChannel: string;
  planName: string;
  pf: boolean;
  sumInsured: number;
  issuedMonth: string;
  commissionPercentage: number;
  commissionAmount: number;
  clientName: string;
  expectedDrawdownMonth: string;
  isFavorited?: boolean;
}

export interface Agent {
  id: string;
  name: string;
}

export interface MonthlyMetric {
  month: string;
  amount: number;
  dealCount: number;
  isManual?: boolean;
}

export interface ManualMetric {
  agentName: string;
  month: string;
  type: 'income' | 'drawdown';
  amount: number;
  dealCount: number;
}

export interface AgentSummary {
  agentName: string;
  recentDeals: Deal[];
  monthlyIncome: MonthlyMetric[];
  expectedDrawdown: MonthlyMetric[];
}
