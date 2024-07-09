import { Module } from '@nestjs/common';
import { DirectionController } from './direction.controller';
import { DirectionService } from './direction.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';

@Module({
  controllers: [DirectionController],
  providers: [
    DirectionService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    DirectionRubriqueService,
  ],
})
export class DirectionModule {}
