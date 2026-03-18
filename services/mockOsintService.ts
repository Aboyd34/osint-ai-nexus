import { PhoneIntelResult, EmailIntelResult, DarkWebResult } from "../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockPhoneLookup = async (number: string): Promise<PhoneIntelResult> => {
  await delay(1500); // Simulate network latency
  
  // Deterministic mock data based on input length or content
  const isValid = number.length > 9;
  const isUs = number.startsWith('+1');
  
  return {
    id: crypto.randomUUID(),
    type: 'PHONE',
    query: number,
    timestamp: new Date().toISOString(),
    riskScore: isValid ? Math.floor(Math.random() * 40) : 0,
    data: {
      valid: isValid,
      country_code: isUs ? 'US' : 'Unknown',
      carrier: isUs ? 'Verizon Wireless' : 'Unknown Carrier',
      line_type: 'Mobile',
      location: isUs ? 'Philadelphia, PA' : 'Unknown',
      international_format: number,
    }
  };
};

export const mockEmailLookup = async (email: string): Promise<EmailIntelResult> => {
  await delay(1500);
  
  const domain = email.split('@')[1] || 'unknown';
  const isGmail = domain.includes('gmail');
  const isBreached = Math.random() > 0.5;

  return {
    id: crypto.randomUUID(),
    type: 'EMAIL',
    query: email,
    timestamp: new Date().toISOString(),
    riskScore: isBreached ? Math.floor(Math.random() * 60) + 40 : 10,
    data: {
      valid: true,
      domain: domain,
      disposable: false,
      mx_records: true,
      breach_count: isBreached ? Math.floor(Math.random() * 15) + 1 : 0,
    }
  };
};

export const mockDarkWebLookup = async (indicator: string): Promise<DarkWebResult> => {
  await delay(2000);
  
  const found = Math.random() > 0.7;

  return {
    id: crypto.randomUUID(),
    type: 'DARKWEB',
    query: indicator,
    timestamp: new Date().toISOString(),
    riskScore: found ? 90 : 10,
    data: {
      found: found,
      sources: found ? ['Tor Hidden Service', 'Pastebin Dump'] : [],
      last_seen: found ? new Date(Date.now() - 86400000 * Math.random() * 100).toISOString() : 'N/A',
      category: found ? 'Credential Leak' : 'None',
    }
  };
};
