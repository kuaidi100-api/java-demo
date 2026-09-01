import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { BusinessJobsService } from './jobs.service.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { ErrandController } from './errand.controller.js';
import { ErrandService } from './errand.service.js';
import { FreightController } from './freight.controller.js';
import { FreightService } from './freight.service.js';
import { LifestyleService, PurchaseService } from './purchase.service.js';
import { PurchaseController } from './purchase.controller.js';
import { StorageController } from './storage.controller.js';
import { SupportController } from './support.controller.js';
import { SupportService } from './support.service.js';

@Module({
  imports: [AuthModule],
  controllers: [
    CatalogController,
    FreightController,
    ErrandController,
    PurchaseController,
    StorageController,
    SupportController,
  ],
  providers: [
    CatalogService,
    FreightService,
    ErrandService,
    PurchaseService,
    LifestyleService,
    BusinessJobsService,
    SupportService,
  ],
  exports: [CatalogService, FreightService, ErrandService, PurchaseService, SupportService],
})
export class BusinessModule {}
