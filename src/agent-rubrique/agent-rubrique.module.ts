import { Module } from '@nestjs/common';
import { AgentRubriqueController } from './agent-rubrique.controller';
import { AgentRubriqueService } from './agent-rubrique.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';
import { AffectationService } from 'src/affectation/affectation.service';
import { FonctionRubriqueService } from 'src/fonction-rubrique/fonction-rubrique.service';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';
import { SalaireService } from 'src/salaire/salaire.service';

@Module({
  controllers: [AgentRubriqueController],
  providers: [
    AgentRubriqueService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    AffectationService,
    FonctionRubriqueService,
    ServiceRubriqueService,
    DirectionRubriqueService,
    SalaireService,
  ],
  exports: [AgentRubriqueService],
})
export class AgentRubriqueModule {}
