import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UseModel } from '../providers/useModel.service';
import { ConnectionResolver } from '../providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { AffectationService } from 'src/affectation/affectation.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    AffectationService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
