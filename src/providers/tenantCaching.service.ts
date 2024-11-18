import { Injectable } from '@nestjs/common';
import { UseModel } from './useModel.service';
import { TenantDocument, TenantSchema } from 'src/schemas/admin/tenant.schema';

@Injectable()
export class TenantCachingService {
  constructor(private useModel: UseModel) {}

  private tenants: Record<string, TenantDocument> = {};

  getTenant = async (subdomain: string): Promise<TenantDocument> => {
    if (this.tenants[subdomain]) return this.tenants[subdomain];
    const tenantModel = await this.useModel.connectModel<TenantDocument>(
      'admin',
      'Tenant',
      TenantSchema,
    );
    const foundTenant = await tenantModel.findOne({ subdomain: subdomain });
    this.setTenant(subdomain, foundTenant);
    return foundTenant;
  };

  setTenant = (subdomain: string, tenant: TenantDocument) => {
    this.tenants[subdomain] = tenant;
  };
}
