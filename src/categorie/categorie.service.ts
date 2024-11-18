import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  CategorieDocument,
  CategorieSchema,
} from 'src/schemas/users/categorie.schema';
import { CreateCategorieDTO } from 'src/dto/createCategorie.dto';

@Injectable()
export class CategorieService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly categorieModel =
    this.useModel.connectModel<CategorieDocument>(
      this.tenantName,
      'Categorie',
      CategorieSchema,
    );

  async create(
    createCategorieDTO: CreateCategorieDTO,
  ): Promise<CategorieDocument> {
    return await (await this.categorieModel).create(createCategorieDTO);
  }

  async findAll(): Promise<CategorieDocument[]> {
    return await (await this.categorieModel).find({}).sort({ _id: -1 }).exec();
  }

  async findOne(id: string): Promise<CategorieDocument> {
    return await (await this.categorieModel).findById(id).exec();
  }

  async researchDuplicate(libelle: string): Promise<CategorieDocument> {
    return await (await this.categorieModel).findOne({ libelle }).exec();
  }

  async update(
    id: string,
    updateCategorieDto: CreateCategorieDTO,
  ): Promise<CategorieDocument> {
    return await (await this.categorieModel)
      .findByIdAndUpdate(id, updateCategorieDto, { new: true })
      .exec();
  }
}
