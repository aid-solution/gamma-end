import { Module } from '@nestjs/common';
import { AffectationController } from './affectation.controller';
import { AffectationService } from './affectation.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';
import { RubriqueService } from 'src/rubrique/rubrique.service';
import { SalaireService } from 'src/salaire/salaire.service';

@Module({
  controllers: [AffectationController],
  providers: [
    AffectationService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    AgentRubriqueService,
    RubriqueService,
    SalaireService,
  ],
  exports: [AffectationService],
})
export class AffectationModule {}
