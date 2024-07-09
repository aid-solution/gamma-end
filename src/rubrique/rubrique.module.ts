import { Module } from '@nestjs/common';
import { RubriqueController } from './rubrique.controller';
import { RubriqueService } from './rubrique.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';

@Module({
  controllers: [RubriqueController],
  providers: [
    RubriqueService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
})
export class RubriqueModule {}
