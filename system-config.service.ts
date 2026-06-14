import { systemConfigRepository } from "../repositories/system-config.repository";

const DEFAULT_CONFIGS: Record<string, string> = {
  parking_name: "Vanguard Cochera",
  welcome_message: "Bienvenido a la cochera del futuro",
  support_phone: "+54 11 4444-5555",
  rate_hourly: "500",
  rate_daily: "3000",
  rate_monthly: "45000",
  rate_quarterly: "120000",
  rate_yearly: "390000",
  limit_max_height: "240",
  limit_max_width: "220",
  limit_max_weight: "3500",
  sim_barrier: "true",
  notify_email: "true",
  maintenance_mode: "false",
};

export const systemConfigService = {
  async getConfigs(): Promise<Record<string, string>> {
    const dbConfigs = await systemConfigRepository.getAll();
    
    const hasKeys = Object.keys(dbConfigs).length > 0;
    if (!hasKeys) {
      await systemConfigRepository.setMany(DEFAULT_CONFIGS);
      return { ...DEFAULT_CONFIGS };
    }

    return { ...DEFAULT_CONFIGS, ...dbConfigs };
  },

  async updateConfigs(configs: Record<string, string>): Promise<Record<string, string>> {
    const sanitizedConfigs: Record<string, string> = {};
    for (const [key, value] of Object.entries(configs)) {
      if (key in DEFAULT_CONFIGS) {
        sanitizedConfigs[key] = String(value);
      }
    }

    if (Object.keys(sanitizedConfigs).length > 0) {
      await systemConfigRepository.setMany(sanitizedConfigs);
    }

    return this.getConfigs();
  },
};
