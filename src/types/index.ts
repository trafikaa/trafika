export interface CompanyData {
  name: string;
  corp_code?: string;
  ticker?: string;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  currentAssets: number;
  currentLiabilities: number;
  revenue: number;
  netIncome: number;
  operatingCashFlow: number;
}

export interface CompanyInfo {
  corp_code: string;
  ticker: string;
}

export interface FinancialRatios {
  debt_ratio: number | null;
  current_ratio: number | null;
  equity_ratio: number | null;
  ROA: number | null; // ROA
  ROE: number | null;
  operating_margin_on_total_assets: number | null; // 영업이익률
}

export interface RiskAssessment {
  level: 'safe' | 'caution' | 'danger';
  score: number;
  warnings: string[];
  recommendations: string[];
}

export interface ChatMessageData {
  ratios?: FinancialRatios;
  riskLevel?: 'safe' | 'caution' | 'danger';
  riskScore?: number;
  companyData?: CompanyData;
  companyInfo?: CompanyInfo;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot'; 
  content: string;
  timestamp: Date;
  data?: ChatMessageData; 
}

export type ChatStep = 'welcome' | 'company-name' | 'analysis' | 'complete' | 'chat';