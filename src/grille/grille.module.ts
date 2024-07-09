import { Module } from '@nestjs/common';
import { GrilleController } from './Grille.controller';
import { GrilleService } from './Grille.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';

@Module({
  controllers: [GrilleController],
  providers: [
    GrilleService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
})
export class GrilleModule {}
