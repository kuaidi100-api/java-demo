import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SecurityModule } from '../security/security.module.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

@Module({
  imports: [AuthModule, PrismaModule, SecurityModule],
  controllers: [AdminController],
  providers: [AdminService, PermissionsGuard],
})
export class AdminModule {}
