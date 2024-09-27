import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ManagerDbService } from '../providers/managerDb.service';

@Injectable()
export class TenantNameMiddleware implements NestMiddleware {
  constructor(private managerDbService: ManagerDbService) {}

  async use(request: Request, res: Response, next: NextFunction) {
    const subdomain = (request.headers['X-TENANT-NAME'] ||
      request.headers['x-tenant-name'] ||
      request.headers['X-Tenant-Name']) as string;
    if (!subdomain) throw new BadRequestException('subdomain_not_found');

    const existentTenant =
      await this.managerDbService.getTenantExistenceBySubdoamin(subdomain);
    if (!existentTenant) throw new NotFoundException('tenant_not_found');
    return next();
  }
}
