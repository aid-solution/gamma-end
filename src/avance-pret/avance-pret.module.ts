import { Module } from '@nestjs/common';
import { AvancePretController } from './avance-pret.controller';
import { AvancePretService } from './avance-pret.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';

@Module({
  controllers: [AvancePretController],
  providers: [
    AvancePretService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
  exports: [AvancePretService],
})
export class AvancePretModule {}
