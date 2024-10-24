import { Module } from '@nestjs/common';
import { ProfilController } from './profil.controller';
import { ProfilService } from './profil.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';

@Module({
  controllers: [ProfilController],
  providers: [
    ProfilService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
  exports: [ProfilService],
})
export class ProfilModule {}
