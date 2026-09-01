import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ErrandService } from './errand.service.js';

@Injectable()
export class BusinessJobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BusinessJobsService.name);
  private timers: NodeJS.Timeout[] = [];

  constructor(private readonly errands: ErrandService) {}

  onModuleInit(): void {
    this.timers.push(setInterval(() => void this.cancelExpiredErrands(), 5 * 60 * 1000));
    this.timers.push(setInterval(() => void this.maybeFinanceBatch(), 60 * 1000));
  }

  onModuleDestroy(): void {
    for (const timer of this.timers) clearInterval(timer);
  }

  private async cancelExpiredErrands(): Promise<void> {
    try {
      const count = await this.errands.timeoutCancel();
      if (count > 0) this.logger.log(`auto-cancelled ${count} expired errand orders`);
    } catch (error: unknown) {
      this.logger.error(error instanceof Error ? error.message : 'timeout cancel failed');
    }
  }

  private async maybeFinanceBatch(): Promise<void> {
    const parts = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Asia/Vientiane',
    }).formatToParts(new Date());
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
    if (minute !== 0 || (hour !== 6 && hour !== 18)) return;
    const slot = hour < 12 ? 'Morning' : 'Evening';
    try {
      const result = await this.errands.generateFinanceBatch(slot);
      this.logger.log(`finance batch ${result.batchDate} count=${result.count}`);
    } catch (error: unknown) {
      this.logger.error(error instanceof Error ? error.message : 'finance batch failed');
    }
  }
}
