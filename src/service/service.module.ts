import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';
import { SalaireService } from 'src/salaire/salaire.service';

@Module({
  controllers: [ServiceController],
  providers: [
    ServiceService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    ServiceRubriqueService,
    SalaireService,
    AgentRubriqueService,
  ],
})
export class ServiceModule {}
