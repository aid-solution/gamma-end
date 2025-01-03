import { Module } from '@nestjs/common';
import { FonctionController } from './fonction.controller';
import { FonctionService } from './fonction.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { FonctionRubriqueService } from 'src/fonction-rubrique/fonction-rubrique.service';
import { SalaireService } from 'src/salaire/salaire.service';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';

@Module({
  controllers: [FonctionController],
  providers: [
    FonctionService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    FonctionRubriqueService,
    SalaireService,
    AgentRubriqueService,
  ],
})
export class FonctionModule {}
