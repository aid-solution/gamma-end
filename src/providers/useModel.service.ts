import { Injectable } from '@nestjs/common';
import { Schema } from 'mongoose';
import { ConnectionResolver } from './connectionResolver.service';

@Injectable()
export class UseModel {
  constructor(private connectionResolver: ConnectionResolver) {}

  async connectModel<T>(
    tenantName: string | Promise<string>,
    dbName: string,
    schema?: Schema,
  ) {
    const resolvedTenantName = await tenantName;
    const connection =
      resolvedTenantName === 'admin'
        ? await this.connectionResolver.getAdminConnection()
        : await this.connectionResolver.getCustomerConnection(
            resolvedTenantName,
          );

    return connection.model<T>(dbName, schema);
  }
}
