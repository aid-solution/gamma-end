import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConnectionResolver } from './providers/connectionResolver.service';

@Injectable()
export class AppService {
  constructor(private connectionResolver: ConnectionResolver) {}
  getHello(): string {
    return 'Bienvenue!';
  }

  async getConnection(name: string): Promise<Connection> {
    const connection =
      await this.connectionResolver.getCustomerConnection(name);
    return connection;
  }
}
