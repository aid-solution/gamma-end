import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ClientSession } from 'mongoose';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  AffectationDocument,
  AffectationSchema,
} from 'src/schemas/users/affectation.schema';
import { CreateAffectationDTO } from 'src/dto/createAffectation.dto';

@Injectable()
export class AffectationService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly affectationModel =
    this.useModel.createModel<AffectationDocument>(
      this.tenantName,
      'Affectation',
      AffectationSchema,
    );
  async createWithTransaction(
    session: ClientSession,
    affectationDto: CreateAffectationDTO,
  ) {
    return await (
      await this.affectationModel
    ).create([affectationDto], { session });
  }

  async create(
    affectationDto: CreateAffectationDTO,
  ): Promise<AffectationDocument> {
    return await (await this.affectationModel).create(affectationDto);
  }

  async findAll(): Promise<AffectationDocument[]> {
    return await (await this.affectationModel).find({});
  }

  async findOne(_id: string): Promise<AffectationDocument> {
    return await (await this.affectationModel).findById({ _id });
  }

  async update(
    id: string,
    updateAffectationDto: CreateAffectationDTO,
  ): Promise<AffectationDocument> {
    return await (await this.affectationModel)
      .findByIdAndUpdate(id, updateAffectationDto, { new: true })
      .exec();
  }

  async filterByAgent(agent: string): Promise<AffectationDocument[]> {
    return await (await this.affectationModel).find({ agent });
  }
}
