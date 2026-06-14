import { prisma } from "../lib/prisma";

export const systemConfigRepository = {
  async get(key: string): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });
    return config ? config.value : null;
  },

  async getAll(): Promise<Record<string, string>> {
    const configs = await prisma.systemConfig.findMany();
    const result: Record<string, string> = {};
    for (const item of configs) {
      result[item.key] = item.value;
    }
    return result;
  },

  async set(key: string, value: string): Promise<void> {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  },

  async setMany(configs: Record<string, string>): Promise<void> {
    const operations = Object.entries(configs).map(([key, value]) =>
      prisma.systemConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await prisma.$transaction(operations);
  },
};
