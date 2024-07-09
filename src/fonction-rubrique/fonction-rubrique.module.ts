import { Module } from '@nestjs/common';
import { FonctionRubriqueController } from './fonction-rubrique.controller';
import { FonctionRubriqueService } from './fonction-rubrique.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';

@Module({
  controllers: [FonctionRubriqueController],
  providers: [
    FonctionRubriqueService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    ServiceRubriqueService,
    DirectionRubriqueService,
  ],
  exports: [FonctionRubriqueService],
})
export class FonctionRubriqueModule {}
