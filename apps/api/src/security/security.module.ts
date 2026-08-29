import { Global, Module } from '@nestjs/common';
import { SecurityService } from './security.service.js';

@Global()
@Module({
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
