import { Injectable } from '@nestjs/common';
import { FreightChannel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export const PLATFORM_CATALOG = {
  customerService: {
    phone: '+8562076917777',
    wechat: 'yang629yang88',
  },
  warehouses: [
    {
      channel: 'NEXT_DAY' as const,
      channelCode: 1,
      name: '隔日达（特快）',
      eta: '西双版纳仓当日 9:00 前入库，当天送达金三角经济特区',
      pricing: '首重 20元/1KG，续重 15元/1KG',
      receiverPrefix: '木棉',
      phone: '13759252329',
      address: '云南省西双版纳傣族自治州勐腊县曼庄路平特卫仓库',
    },
    {
      channel: 'ECONOMY' as const,
      channelCode: 2,
      name: '普快（经济）',
      eta: '3-4天送达金三角经济特区',
      pricing: '首重 15元/1KG，续重 10元/1KG',
      receiverPrefix: '木棉',
      phone: '15334301527',
      address: '云南省西双版纳傣族自治州勐腊县曼庄路AM国际木棉快递',
    },
  ],
  errand: {
    maxWeightKg: 20,
    overweightHint: '超重请联系人工客服或使用货运服务',
    matrix: [
      { areaType: 1, areaName: '金三角特区内部', weightTier: 1, weightLabel: '≤10KG', price: 30 },
      { areaType: 1, areaName: '金三角特区内部', weightTier: 2, weightLabel: '10-20KG', price: 40 },
      { areaType: 2, areaName: '特区往返东鹏', weightTier: 1, weightLabel: '≤10KG', price: 50 },
      { areaType: 2, areaName: '特区往返东鹏', weightTier: 2, weightLabel: '10-20KG', price: 70 },
    ],
    timeoutMinutes: 60,
  },
  purchaseServiceFeeRate: 0.05,
  imageHost: 'https://oss.kapokstar.com',
};

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async snapshot() {
    try {
      const rules = await this.prisma.freightRule.findMany({ where: { isActive: true } });
      const warehouses = PLATFORM_CATALOG.warehouses.map((item) => {
        const rule = rules.find((row) => row.channel === (item.channel as FreightChannel));
        return rule
          ? {
              ...item,
              pricing: `首重 ${Number(rule.basePrice)}元/${Number(rule.baseWeight)}KG，续重 ${Number(rule.stepPrice)}元/${Number(rule.stepWeight)}KG`,
            }
          : item;
      });
      return { ...PLATFORM_CATALOG, warehouses };
    } catch {
      return PLATFORM_CATALOG;
    }
  }
}
