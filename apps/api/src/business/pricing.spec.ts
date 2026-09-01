import { billedWeightKg, quoteErrand, quoteFreight } from './pricing.js';

describe('business pricing', () => {
  it('locks errand matrix prices', () => {
    expect(quoteErrand(1, 1)).toBe(30);
    expect(quoteErrand(1, 2)).toBe(40);
    expect(quoteErrand(2, 1)).toBe(50);
    expect(quoteErrand(2, 2)).toBe(70);
  });

  it('uses the greater of actual and volumetric weight', () => {
    expect(billedWeightKg(2, { lengthCm: 40, widthCm: 30, heightCm: 50 })).toBe(10);
    expect(billedWeightKg(12, { lengthCm: 10, widthCm: 10, heightCm: 10 })).toBe(12);
  });

  it('applies next-day and economy first/continued weight', () => {
    expect(quoteFreight(1, 1)).toBe(20);
    expect(quoteFreight(1, 3)).toBe(50);
    expect(quoteFreight(2, 1)).toBe(15);
    expect(quoteFreight(2, 2.1)).toBe(35);
  });
});
