import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  MotifAbsenceDocument,
  MotifAbsenceSchema,
} from 'src/schemas/users/motifAbsence.schema';
import { CreateEchellonDTO } from 'src/dto/createEchellon.dto';

@Injectable()
export class MotifAbsenceService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly motifAbsenceModel =
    this.useModel.connectModel<MotifAbsenceDocument>(
      this.tenantName,
      'MotifAbsence',
      MotifAbsenceSchema,
    );

  async create(
    createTypeAbsenceDto: CreateEchellonDTO,
  ): Promise<MotifAbsenceDocument> {
    return await (await this.motifAbsenceModel).create(createTypeAbsenceDto);
  }

  async findAll(): Promise<MotifAbsenceDocument[]> {
    return await (await this.motifAbsenceModel)
      .find({})
      .sort({ _id: -1 })
      .exec();
  }

  async findOne(id: string): Promise<MotifAbsenceDocument> {
    return await (await this.motifAbsenceModel).findById(id).exec();
  }

  async researchDuplicate(libelle: string): Promise<MotifAbsenceDocument> {
    return await (await this.motifAbsenceModel).findOne({ libelle }).exec();
  }

  async update(
    id: string,
    updateTypeAbsenceDto: CreateEchellonDTO,
  ): Promise<MotifAbsenceDocument> {
    return await (await this.motifAbsenceModel)
      .findByIdAndUpdate(id, updateTypeAbsenceDto, { new: true })
      .exec();
  }
}
