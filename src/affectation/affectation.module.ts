import { Module } from '@nestjs/common';
import { AffectationController } from './affectation.controller';
import { AffectationService } from './affectation.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';

@Module({
  controllers: [AffectationController],
  providers: [
    UseModel,
    AffectationService,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
  exports: [AffectationService],
})
export class AffectationModule {}
