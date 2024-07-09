import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import mongoose, { Connection } from 'mongoose';

@Injectable()
export class ConnectionResolver {
  private connections: Record<string, Connection> = {};

  private async createConnection(name: string): Promise<Connection> {
    try {
      const connection = await mongoose
        .createConnection(
          `${process.env.MONGO_URI}/${name}?retryWrites=true&w=majority`,
        )
        .asPromise();
      this.connections[name] = connection;
      return connection;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database connection error',
        error,
      );
    }
  }

  private async getConnection(name: string): Promise<Connection> {
    const existingConnection = this.connections[name];
    if (existingConnection && existingConnection.readyState === 1) {
      return existingConnection;
    }
    return await this.createConnection(name);
  }

  async getCustomerConnection(customerName: string): Promise<Connection> {
    return await this.getConnection(customerName);
  }

  async getAdminConnection(): Promise<Connection> {
    return await this.getConnection('manager');
  }

  async getDbExistence(db: string): Promise<boolean> {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
      await client.connect();
      const admin = client.db().admin();
      const dbInfo = await admin.listDatabases();
      return dbInfo.databases.some((database) => database.name === db);
    } finally {
      await client.close();
    }
  }
}
