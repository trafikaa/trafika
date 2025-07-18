export interface CompanyData {
  name: string;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  currentAssets: number;
  currentLiabilities: number;
  revenue: number;
  netIncome: number;
  operatingCashFlow: number;
}

export interface FinancialRatios {
  debtRatio: number;
  currentRatio: number;
  equityRatio: number;
  roa: number;
  roe: number;
  operatingMargin: number;
}

export interface RiskAssessment {
  level: 'safe' | 'caution' | 'danger';
  score: number;
  warnings: string[];
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: any;
}

export type ChatStep = 'welcome' | 'company-name' | 'financial-data' | 'analysis' | 'complete';