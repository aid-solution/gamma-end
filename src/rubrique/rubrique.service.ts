import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  RubriqueDocument,
  RubriqueSchema,
} from 'src/schemas/users/rubrique.schema';
import { CreateRubriqueDTO } from 'src/dto/createRubrique.dto';
import { initial } from 'src/utilities/initialRubriques';

@Injectable()
export class RubriqueService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly rubriqueModel = this.useModel.connectModel<RubriqueDocument>(
    this.tenantName,
    'Rubrique',
    RubriqueSchema,
  );

  async initialization() {
    (await this.rubriqueModel).insertMany(initial);
  }

  async create(
    createRubriqueDto: CreateRubriqueDTO,
  ): Promise<RubriqueDocument> {
    return await (await this.rubriqueModel).create(createRubriqueDto);
  }

  async findAll(): Promise<RubriqueDocument[]> {
    return await (
      await this.rubriqueModel
    )
      .find({
        $and: [
          { code: { $ne: 100 } },
          { code: { $ne: 154 } },
          { code: { $ne: 201 } },
          { code: { $ne: 633 } },
          { code: { $ne: 220 } },
          { code: { $ne: 102 } },
          { code: { $ne: 110 } },
          { code: { $ne: 111 } },
          { code: { $ne: 155 } },
          { code: { $ne: 156 } },
          { code: { $ne: 202 } },
          { code: { $ne: 203 } },
          {
            libelle: {
              $not: { $regex: /\b(pret|prêt)\b/, $options: 'i' },
            },
          },
        ],
      })
      .sort({ _id: -1 })
      .exec();
  }

  async findAllInitialRubrique(): Promise<RubriqueDocument[]> {
    return await (
      await this.rubriqueModel
    )
      .find({
        $or: [
          { code: { $eq: 100 } },
          { code: { $eq: 154 } },
          { code: { $eq: 201 } },
          { code: { $eq: 633 } },
          { code: { $eq: 220 } },
          { code: { $eq: 102 } },
          { code: { $eq: 110 } },
          { code: { $eq: 111 } },
          { code: { $eq: 155 } },
          { code: { $eq: 156 } },
          { code: { $eq: 202 } },
          { code: { $eq: 203 } },
        ],
      })
      .exec();
  }

  async findAllAvancePret() {
    return await (
      await this.rubriqueModel
    )
      .find({
        libelle: { $regex: /\b(avance|pret|prêt)\b/, $options: 'i' },
        assujetiCNSS: false,
        assujetiImpot: false,
        entreBrut: false,
        entreNet: true,
        gainRetenue: 'Retenue',
      })
      .select({ libelle: 1 })
      .sort({ _id: -1 })
      .exec();
  }

  async findOne(id: string): Promise<RubriqueDocument> {
    return await (await this.rubriqueModel).findById(id).exec();
  }

  async findOneByCode(code: number): Promise<RubriqueDocument> {
    const findByCode = await (await this.rubriqueModel)
      .findOne({ code })
      .exec();
    const rubrique = initial.find((init) => init.code === code);
    if (!findByCode && rubrique) {
      return this.create(rubrique);
    }
    return findByCode;
  }

  async researchDuplicate(search: string): Promise<RubriqueDocument> {
    return await (
      await this.rubriqueModel
    )
      .findOne({
        $or: [
          { libelle: search },
          { code: Number.isNaN(+search) ? 0 : search },
        ],
      })
      .select({ libelle: 1, code: 1 });
  }

  async update(
    id: string,
    updateRubriqueDto: CreateRubriqueDTO,
  ): Promise<RubriqueDocument> {
    return await (await this.rubriqueModel)
      .findByIdAndUpdate(id, updateRubriqueDto, { new: true })
      .exec();
  }
}
