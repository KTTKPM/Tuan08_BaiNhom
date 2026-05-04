import type { AppConfig } from './types';


const CONFIG_KEY = 'flash_sale_system_config';

const DEFAULT_CONFIG: AppConfig = {
  pu1Url: import.meta.env.VITE_PU1_URL || 'http://localhost:8081',
  pu2Url: import.meta.env.VITE_PU2_URL || 'http://localhost:8082',
  pu3Url: import.meta.env.VITE_PU3_URL || 'http://localhost:8083',
  pu4Url: import.meta.env.VITE_PU4_URL || 'http://localhost:8084',
  userId: '101', // Update default to 101 based on user's .env comments!
  useMockMode: false,
  redisUrl: import.meta.env.VITE_REDIS_URL || '',
};




export const loadConfig = (): AppConfig => {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (!saved) return DEFAULT_CONFIG;
    const parsed = JSON.parse(saved);
    if (parsed && parsed.userId === 'user_1') {
      parsed.userId = '101';
    }
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
};


export const saveConfig = (config: AppConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};
