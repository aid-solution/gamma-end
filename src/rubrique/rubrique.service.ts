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
  private readonly rubriqueModel = this.useModel.createModel<RubriqueDocument>(
    this.tenantName,
    'Rubrique',
    RubriqueSchema,
  );

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
        ],
      })
      .exec();
  }

  async findAllInitialRubrique(): Promise<RubriqueDocument[]> {
    return await (
      await this.rubriqueModel
    )
      .find({
        $and: [
          { code: { $eq: 100 } },
          { code: { $eq: 154 } },
          { code: { $eq: 201 } },
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
      .exec();
  }

  async findOne(id: string): Promise<RubriqueDocument> {
    return await (await this.rubriqueModel).findById(id).exec();
  }

  async findOneByCode(code: number): Promise<RubriqueDocument> {
    return await (await this.rubriqueModel).findOne({ code }).exec();
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
