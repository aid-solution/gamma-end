import { Module } from '@nestjs/common';
import { DirectionController } from './direction.controller';
import { DirectionService } from './direction.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';
import { SalaireService } from 'src/salaire/salaire.service';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';

@Module({
  controllers: [DirectionController],
  providers: [
    DirectionService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    DirectionRubriqueService,
    AgentRubriqueService,
    SalaireService,
  ],
})
export class DirectionModule {}
