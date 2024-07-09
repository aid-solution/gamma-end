import { Injectable } from '@nestjs/common';
import { Schema } from 'mongoose';
import { ConnectionResolver } from './connectionResolver.service';

@Injectable()
export class UseModel {
  constructor(private connectionResolver: ConnectionResolver) {}
  async createModel<T>(
    tenantName: string | Promise<string>,
    dbName: string,
    schema?: Schema,
  ) {
    if ((await tenantName) === 'admin') {
      const connection = await this.connectionResolver.getAdminConnection();
      return connection.model<T>(dbName, schema);
    }
    const connection = await this.connectionResolver.getCustomerConnection(
      await tenantName,
    );
    return connection.model<T>(dbName, schema);
  }
}
