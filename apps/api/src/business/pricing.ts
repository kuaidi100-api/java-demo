export type ErrandAreaType = 1 | 2;
export type ErrandWeightTier = 1 | 2;
export type FreightChannelCode = 1 | 2;

const ERRAND_MATRIX: Record<ErrandAreaType, Record<ErrandWeightTier, number>> = {
  1: { 1: 30, 2: 40 },
  2: { 1: 50, 2: 70 },
};

const FREIGHT_FALLBACK: Record<FreightChannelCode, { baseWeight: number; basePrice: number; stepWeight: number; stepPrice: number }> = {
  1: { baseWeight: 1, basePrice: 20, stepWeight: 1, stepPrice: 15 },
  2: { baseWeight: 1, basePrice: 15, stepWeight: 1, stepPrice: 10 },
};

export function quoteErrand(areaType: number, weightTier: number): number {
  if (areaType !== 1 && areaType !== 2) {
    throw new Error('区域仅支持特区内部或往返东鹏');
  }
  if (weightTier !== 1 && weightTier !== 2) {
    throw new Error('重量仅支持 10 公斤以内或 10-20 公斤');
  }
  return ERRAND_MATRIX[areaType][weightTier];
}

export function errandOverweight(weightKg: number): boolean {
  return weightKg > 20;
}

export function billedWeightKg(
  actualKg: number,
  volume?: { lengthCm: number; widthCm: number; heightCm: number },
): number {
  const volumeKg = volume
    ? (volume.lengthCm * volume.widthCm * volume.heightCm) / 6000
    : 0;
  return Math.max(actualKg, volumeKg);
}

export function quoteFreight(
  channel: FreightChannelCode,
  billedKg: number,
  rule?: { baseWeight: number; basePrice: number; stepWeight: number; stepPrice: number },
): number {
  const used = rule ?? FREIGHT_FALLBACK[channel];
  const extraUnits = Math.max(0, Math.ceil((billedKg - Number(used.baseWeight)) / Number(used.stepWeight)));
  return Number(used.basePrice) + extraUnits * Number(used.stepPrice);
}

export function freightChannelFromCode(channel: FreightChannelCode): 'NEXT_DAY' | 'ECONOMY' {
  return channel === 1 ? 'NEXT_DAY' : 'ECONOMY';
}

export function freightCodeFromChannel(channel: 'NEXT_DAY' | 'ECONOMY'): FreightChannelCode {
  return channel === 'NEXT_DAY' ? 1 : 2;
}

export const PURCHASE_SERVICE_FEE_RATE = 0.05;
