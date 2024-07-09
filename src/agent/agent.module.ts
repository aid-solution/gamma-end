import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { AffectationService } from 'src/affectation/affectation.service';
import { ChargeService } from 'src/charge/charge.service';

@Module({
  controllers: [AgentController],
  providers: [
    AgentService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    AffectationService,
    ChargeService,
  ],
})
export class AgentModule {}
