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
    // Check if the subdomain exists
    const subdomain = (request.headers['X-TENANT-NAME'] ||
      request.headers['x-tenant-name'] ||
      request.headers['X-Tenant-Name']) as string;
    if (!subdomain) throw new BadRequestException('Subdomain not found');
    // Check if the tenant exists
    const existentTenant =
      await this.managerDbService.getTenantExistenceBySubdoamin(subdomain);
    if (!existentTenant) throw new NotFoundException('Tenant not found');
    // Tenant exists and continue the server methode
    return next();
  }
}
