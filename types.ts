export type IntelType = 'PHONE' | 'EMAIL' | 'DARKWEB';

export interface BaseIntelResult {
  id: string;
  type: IntelType;
  query: string;
  timestamp: string;
  riskScore: number; // 0-100
  notes?: string;
}

export interface PhoneIntelResult extends BaseIntelResult {
  type: 'PHONE';
  data: {
    valid: boolean;
    country_code: string;
    carrier: string;
    line_type: string;
    location: string;
    international_format: string;
  };
}

export interface EmailIntelResult extends BaseIntelResult {
  type: 'EMAIL';
  data: {
    valid: boolean;
    domain: string;
    disposable: boolean;
    mx_records: boolean;
    breach_count: number;
  };
}

export interface DarkWebResult extends BaseIntelResult {
  type: 'DARKWEB';
  data: {
    found: boolean;
    sources: string[];
    last_seen: string;
    category: string;
  };
}

export type IntelResult = PhoneIntelResult | EmailIntelResult | DarkWebResult;

export interface ChartDataPoint {
  name: string;
  value: number;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  DARKWEB = 'DARKWEB',
  SETTINGS = 'SETTINGS',
}
