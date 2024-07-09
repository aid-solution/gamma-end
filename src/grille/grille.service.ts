import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { GrilleDocument, GrilleSchema } from 'src/schemas/users/grille.schema';
import {
  CategorieDocument,
  CategorieSchema,
} from 'src/schemas/users/categorie.schema';
import {
  EchellonDocument,
  EchellonSchema,
} from 'src/schemas/users/echellon.schema';
import { CreateGrilleDTO } from 'src/dto/createGrille.dto';

@Injectable()
export class GrilleService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly grilleModel = this.useModel.createModel<GrilleDocument>(
    this.tenantName,
    'Grille',
    GrilleSchema,
  );
  private readonly categorieModel =
    this.useModel.createModel<CategorieDocument>(
      this.tenantName,
      'Categorie',
      CategorieSchema,
    );
  private readonly echellonModel = this.useModel.createModel<EchellonDocument>(
    this.tenantName,
    'Echellon',
    EchellonSchema,
  );

  async create(createGrilleDto: CreateGrilleDTO): Promise<GrilleDocument> {
    return await (await this.grilleModel).create(createGrilleDto);
  }

  async findAll(): Promise<GrilleDocument[]> {
    return await (
      await this.grilleModel
    )
      .find({})
      .populate({ path: 'echellon', model: await this.echellonModel })
      .populate({ path: 'categorie', model: await this.categorieModel })
      .exec();
  }

  async findOne(id: string): Promise<GrilleDocument> {
    return await (
      await this.grilleModel
    )
      .findById(id)
      .populate({ path: 'echellon', model: await this.echellonModel })
      .populate({ path: 'categorie', model: await this.categorieModel })
      .exec();
  }
  async update(
    id: string,
    updateGrilleDto: CreateGrilleDTO,
  ): Promise<GrilleDocument> {
    return await (await this.grilleModel)
      .findByIdAndUpdate(id, updateGrilleDto, { new: true })
      .exec();
  }
}
