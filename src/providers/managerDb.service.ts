import { Injectable } from '@nestjs/common';
import { TenantCachingService } from './tenantCaching.service';

@Injectable()
export class ManagerDbService {
  startSession() {
    throw new Error('Method not implemented.');
  }
  constructor(private tenantCachingService: TenantCachingService) {}

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
