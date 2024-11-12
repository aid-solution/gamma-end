import { Request } from 'express';
export const getTenantName = (request: Request): string => {
  return (request.headers['X-TENANT-NAME'] ||
    request.headers['x-tenant-name'] ||
    request.headers['X-Tenant-Name']) as string;
};
