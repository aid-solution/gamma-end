import { Module } from '@nestjs/common';
import { AbsenceController } from './absence.controller';
import { AbsenceService } from './absence.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';

@Module({
  controllers: [AbsenceController],
  providers: [
    AbsenceService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
  exports: [AbsenceService],
})
export class AbsenceModule {}
