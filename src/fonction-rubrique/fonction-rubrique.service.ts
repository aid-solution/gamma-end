import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  FonctionRubriqueDocument,
  FonctionRubriqueSchema,
} from 'src/schemas/users/fonctionRubrique.schema';
import { CreateFonctionRubriqueDTO } from 'src/dto/createFonctionRubrique.dto';
import { BulkWriteResult } from 'mongodb';
import {
  RubriqueDocument,
  RubriqueSchema,
} from 'src/schemas/users/rubrique.schema';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';

@Injectable()
export class FonctionRubriqueService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly FonctionRubriqueFonctionModel =
    this.useModel.createModel<FonctionRubriqueDocument>(
      this.tenantName,
      'FonctionRubrique',
      FonctionRubriqueSchema,
    );

  private readonly rubriqueModel = this.useModel.createModel<RubriqueDocument>(
    this.tenantName,
    'Rubrique',
    RubriqueSchema,
  );

  async create(createFonctionDto: CreateFonctionRubriqueDTO[]) {
    return await (
      await this.FonctionRubriqueFonctionModel
    ).insertMany(createFonctionDto);
  }

  async findAll(): Promise<FonctionRubriqueDocument[]> {
    return await (await this.FonctionRubriqueFonctionModel).find({}).exec();
  }

  async findOne(id: string): Promise<FonctionRubriqueDocument> {
    return await (await this.FonctionRubriqueFonctionModel).findById(id).exec();
  }

  async findAllByFonction(
    fonction: string,
  ): Promise<FonctionRubriqueDocument[]> {
    return await (
      await this.FonctionRubriqueFonctionModel
    )
      .find({ fonction: fonction })
      .populate({ path: 'rubrique', model: await this.rubriqueModel })
      .exec();
  }

  async findAllByFonctionAndRubriqueOnGoing(
    fonction: string,
  ): Promise<FonctionRubriqueDocument[]> {
    return await (
      await this.FonctionRubriqueFonctionModel
    )
      .find({ fonction: fonction, dateFin: { $exists: false } })
      .populate({ path: 'rubrique', model: await this.rubriqueModel })
      .exec();
  }

  async update(
    updateFonctionDto: UpdateAffectationRubriqueDTO[],
  ): Promise<BulkWriteResult> {
    const bulkOps = updateFonctionDto.map((dto) => ({
      updateMany: {
        filter: { _id: dto._id },
        update: { $set: dto },
      },
    }));

    const result = await (
      await this.FonctionRubriqueFonctionModel
    ).bulkWrite(bulkOps);
    return result;
  }
}
