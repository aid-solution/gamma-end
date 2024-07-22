import { Module } from '@nestjs/common';
import { AgentAccountController } from './agent-account.controller';
import { AgentAccountService } from './agent-account.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';

@Module({
  controllers: [AgentAccountController],
  providers: [
    AgentAccountService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
  exports: [AgentAccountService],
})
export class AgentAccountModule {}
