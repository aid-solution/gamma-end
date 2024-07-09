import { Module } from '@nestjs/common';
import { EchellonController } from './echellon.controller';
import { EchellonService } from './echellon.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';

@Module({
  controllers: [EchellonController],
  providers: [
    EchellonService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
})
export class EchellonModule {}
