import { Request } from 'express';

/**
 * get tenant name from the request
 */
export const getTenantName = (request: Request): string => {
  return (request.headers['X-TENANT-NAME'] ||
    request.headers['x-tenant-name']) as string;
};
