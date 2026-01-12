const BASE_URL_V2 = 'https://api.warframe.market/v2';
const BASE_URL_V1 = 'https://api.warframe.market/v1';
const PLATFORM = 'pc';

// Rate limiting: 3 requests per second
const RATE_LIMIT_DELAY = 350; // ms between requests

export interface WFMItem {
  id: string;
  slug: string;
  tags: string[];
  i18n: {
    en: {
      name: string;
      thumb?: string;
    };
  };
}

export interface WFMOrder {
  id: string;
  type: 'sell' | 'buy';
  platinum: number;
  quantity: number;
  user: {
    ingameName: string;
    status: 'ingame' | 'online' | 'offline';
    platform: string;
    locale: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WFMStatistics {
  datetime: string;
  volume: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  median: number;
}

let lastRequestTime = 0;

async function rateLimitedFetch(url: string) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: {
      'Platform': PLATFORM,
      'Language': 'en',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Warframe Market API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getAllItems(): Promise<WFMItem[]> {
  const data = await rateLimitedFetch(`${BASE_URL_V2}/items`);
  return data.data;
}

export async function getItem(urlName: string) {
  const data = await rateLimitedFetch(`${BASE_URL_V2}/items/${urlName}`);
  return data.data;
}

export async function getItemOrders(urlName: string): Promise<WFMOrder[]> {
  const data = await rateLimitedFetch(`${BASE_URL_V2}/orders/item/${urlName}`);
  return data.data;
}

export async function getItemStatistics(urlName: string, period: '48hours' | '90days' = '90days'): Promise<WFMStatistics[]> {
  const data = await rateLimitedFetch(`${BASE_URL_V1}/items/${urlName}/statistics`);

  // Return statistics for the specified period
  const stats = data.payload.statistics_closed[period];
  return stats || [];
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
