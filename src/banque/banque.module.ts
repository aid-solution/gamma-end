import { Module } from '@nestjs/common';
import { BanqueController } from './banque.controller';
import { BanqueService } from './banque.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';

@Module({
  controllers: [BanqueController],
  providers: [
    BanqueService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
})
export class BanqueModule {}
