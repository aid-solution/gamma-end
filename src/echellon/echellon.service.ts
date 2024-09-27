import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  EchellonDocument,
  EchellonSchema,
} from 'src/schemas/users/echellon.schema';
import { CreateEchellonDTO } from 'src/dto/createEchellon.dto';

@Injectable()
export class EchellonService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly echellonModel = this.useModel.createModel<EchellonDocument>(
    this.tenantName,
    'Echellon',
    EchellonSchema,
  );

  async create(
    createEchellonDto: CreateEchellonDTO,
  ): Promise<EchellonDocument> {
    return await (await this.echellonModel).create(createEchellonDto);
  }

  async findAll(): Promise<EchellonDocument[]> {
    return await (await this.echellonModel).find({}).exec();
  }

  async findOne(id: string): Promise<EchellonDocument> {
    return await (await this.echellonModel).findById(id).exec();
  }

  async researchDuplicate(libelle: string): Promise<EchellonDocument> {
    return await (await this.echellonModel).findOne({ libelle }).exec();
  }

  async update(
    id: string,
    updateEchellonDto: CreateEchellonDTO,
  ): Promise<EchellonDocument> {
    return await (await this.echellonModel)
      .findByIdAndUpdate(id, updateEchellonDto, { new: true })
      .exec();
  }
}
