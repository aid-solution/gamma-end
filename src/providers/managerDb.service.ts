import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { TenantCachingService } from './tenantCaching.service';

@Injectable()
export class ManagerDbService {
  startSession() {
    throw new Error('Method not implemented.');
  }
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private tenantCachingService: TenantCachingService,
  ) {}

  async getTenantExistenceBySubdoamin(subdomain: string) {
    return await this.tenantCachingService.getTenant(subdomain);
  }

  async getTenantDbName(subdomain: string) {
    const tenant = await this.tenantCachingService.getTenant(subdomain);
    return tenant.dbName;
  }

  async getTenantDenomination(subdomain: string) {
    const tenant = await this.tenantCachingService.getTenant(subdomain);
    return tenant;
  }
}
