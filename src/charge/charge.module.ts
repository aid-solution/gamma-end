import { Module } from '@nestjs/common';
import { ChargeController } from './charge.controller';
import { ChargeService } from './charge.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ChargeController],
  providers: [
    UseModel,
    ChargeService,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
  ],
  exports: [ChargeService],
})
export class ChargeModule {}
