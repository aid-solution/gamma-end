import { Module } from '@nestjs/common';
import { ServiceRubriqueController } from './service-rubrique.controller';
import { ServiceRubriqueService } from './service-rubrique.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';

@Module({
  controllers: [ServiceRubriqueController],
  providers: [
    ServiceRubriqueService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    DirectionRubriqueService,
  ],
  exports: [ServiceRubriqueService],
})
export class ServiceRubriqueModule {}
