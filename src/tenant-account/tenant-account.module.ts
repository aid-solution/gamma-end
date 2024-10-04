import { Module } from '@nestjs/common';
import { TeanantAccountController } from './tenant-account.controller';
import { TenantAccountService } from './tenant-account.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';

@Module({
  controllers: [TeanantAccountController],
  providers: [
    TenantAccountService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
  exports: [TenantAccountService],
})
export class TenantAccountModule {}
