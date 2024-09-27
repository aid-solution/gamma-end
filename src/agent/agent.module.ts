import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { AffectationService } from 'src/affectation/affectation.service';
import { ChargeService } from 'src/charge/charge.service';
import { AgentAccountService } from 'src/agent-account/agent-account.service';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';
import { RubriqueService } from 'src/rubrique/rubrique.service';
import { CongeService } from 'src/conge/conge.service';

@Module({
  controllers: [AgentController],
  providers: [
    AgentService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    AffectationService,
    CongeService,
    ChargeService,
    AgentAccountService,
    AgentRubriqueService,
    RubriqueService,
  ],
})
export class AgentModule {}
