import { Module } from '@nestjs/common';
import { CongeController } from './conge.controller';
import { CongeService } from './conge.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';

@Module({
  controllers: [CongeController],
  providers: [
    CongeService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
  exports: [CongeService],
})
export class CongeModule {}
