import { Module } from '@nestjs/common';
import { DirectionRubriqueController } from './direction-rubrique.controller';
import { DirectionRubriqueService } from './direction-rubrique.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';

@Module({
  controllers: [DirectionRubriqueController],
  providers: [
    DirectionRubriqueService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
  exports: [DirectionRubriqueService],
})
export class DirectionRubriqueModule {}
