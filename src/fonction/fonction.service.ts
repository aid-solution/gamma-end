import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  FonctionDocument,
  FonctionSchema,
} from 'src/schemas/users/fonction.schema';
import { CreateFonctionDTO } from 'src/dto/createFonction.dto';
import {
  DirectionDocument,
  DirectionSchema,
} from 'src/schemas/users/direction.schema';
import {
  ServiceDocument,
  ServiceSchema,
} from 'src/schemas/users/service.schema';
import { UpdateFonctionDTO } from 'src/dto/updateFonction.dto';

@Injectable()
export class FonctionService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly fonctionModel = this.useModel.connectModel<FonctionDocument>(
    this.tenantName,
    'Fonction',
    FonctionSchema,
  );
  private readonly directionModel =
    this.useModel.connectModel<DirectionDocument>(
      this.tenantName,
      'Direction',
      DirectionSchema,
    );
  private readonly serviceModel = this.useModel.connectModel<ServiceDocument>(
    this.tenantName,
    'Service',
    ServiceSchema,
  );

  async create(fonctionDto: CreateFonctionDTO) {
    return await (await this.fonctionModel).create(fonctionDto);
  }

  async findAll(): Promise<FonctionDocument[]> {
    return await (
      await this.fonctionModel
    )
      .find({})
      .populate({ path: 'direction', model: await this.directionModel })
      .populate({ path: 'service', model: await this.serviceModel })
      .sort({ _id: -1 })
      .exec();
  }

  async findOne(id: string): Promise<FonctionDocument> {
    return await (
      await this.fonctionModel
    )
      .findById(id)
      .populate({ path: 'direction', model: await this.directionModel })
      .populate({ path: 'service', model: await this.serviceModel })
      .exec();
  }

  async researchDuplicate(libelle: string): Promise<FonctionDocument> {
    return await (await this.fonctionModel).findOne({ libelle }).exec();
  }

  async update(updateFonctionDto: UpdateFonctionDTO) {
    const { _id, ...dataToUpdate } = updateFonctionDto;
    const FonctionUpdated = await (await this.fonctionModel)
      .findByIdAndUpdate(_id, dataToUpdate, { new: true })
      .exec();
    return FonctionUpdated;
  }
}
