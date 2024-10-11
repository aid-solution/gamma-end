import { Module } from '@nestjs/common';
import { MotifAbsenceController } from './motif-absence.controller';
import { MotifAbsenceService } from './motif-absence.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';

@Module({
  controllers: [MotifAbsenceController],
  providers: [
    MotifAbsenceService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
  exports: [MotifAbsenceService],
})
export class MotifAbsenceModule {}
