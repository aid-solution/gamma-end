import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';

@Module({
  controllers: [TenantController],
  providers: [
    TenantService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    ServiceRubriqueService,
  ],
})
export class TenantModule {}
