import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  DirectionDocument,
  DirectionSchema,
} from 'src/schemas/users/direction.schema';

@Injectable()
export class DirectionService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly directionModel =
    this.useModel.connectModel<DirectionDocument>(
      this.tenantName,
      'Direction',
      DirectionSchema,
    );

  async create(libelle: string) {
    const direction = await (await this.directionModel).create({ libelle });
    return direction;
  }

  async findAll(): Promise<DirectionDocument[]> {
    return await (await this.directionModel).find({}).sort({ _id: -1 }).exec();
  }

  async findOne(id: string): Promise<DirectionDocument> {
    return await (await this.directionModel).findById(id).exec();
  }

  async researchDuplicate(libelle: string): Promise<DirectionDocument> {
    return await (await this.directionModel).findOne({ libelle }).exec();
  }

  async update(id: string, libelle: string) {
    const directionUpdated = await (await this.directionModel)
      .findByIdAndUpdate(id, { libelle }, { new: true })
      .exec();
    return directionUpdated;
  }
}
