import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  ServiceDocument,
  ServiceSchema,
} from 'src/schemas/users/service.schema';
import {
  DirectionDocument,
  DirectionSchema,
} from 'src/schemas/users/direction.schema';

@Injectable()
export class ServiceService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}

  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );

  private readonly serviceModel = this.useModel.connectModel<ServiceDocument>(
    this.tenantName,
    'Service',
    ServiceSchema,
  );

  private readonly directionModel =
    this.useModel.connectModel<DirectionDocument>(
      this.tenantName,
      'Direction',
      DirectionSchema,
    );

  async create(libelle: string, direction: string): Promise<ServiceDocument> {
    const service = await (
      await this.serviceModel
    ).create({ libelle, direction });
    return service;
  }

  async findAll(): Promise<ServiceDocument[]> {
    return await (
      await this.serviceModel
    )
      .find({})
      .populate({ path: 'direction', model: await this.directionModel })
      .sort({ _id: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ServiceDocument> {
    return await (
      await this.serviceModel
    )
      .findById(id)
      .populate({ path: 'direction', model: await this.directionModel })
      .exec();
  }

  async researchDuplicate(libelle: string): Promise<ServiceDocument> {
    return await (await this.serviceModel).findOne({ libelle }).exec();
  }

  async update(_id: string, libelle: string, direction: string) {
    const serviceUpdated = await (await this.serviceModel)
      .findByIdAndUpdate(_id, { libelle, direction }, { new: true })
      .exec();
    return serviceUpdated;
  }
}
