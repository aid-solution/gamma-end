import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { TenantDocument, TenantSchema } from 'src/schemas/admin/tenant.schema';
import { CreateTenantDTO } from 'src/dto/createTenant.dto';
import { BanqueDocument, BanqueSchema } from 'src/schemas/users/banque.schema';
import {
  CategorieDocument,
  CategorieSchema,
} from 'src/schemas/users/categorie.schema';
import {
  DirectionDocument,
  DirectionSchema,
} from 'src/schemas/users/direction.schema';
import {
  EchellonDocument,
  EchellonSchema,
} from 'src/schemas/users/echellon.schema';
import {
  FonctionDocument,
  FonctionSchema,
} from 'src/schemas/users/fonction.schema';
import { GrilleDocument, GrilleSchema } from 'src/schemas/users/grille.schema';
import {
  ServiceDocument,
  ServiceSchema,
} from 'src/schemas/users/service.schema';
import { UserDocument, UserSchema } from 'src/schemas/users/user.schema';

@Injectable()
export class TenantService {
  constructor(
    private useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly tenantModel = this.useModel.createModel<TenantDocument>(
    'admin',
    'Tenant',
    TenantSchema,
  );
  private readonly fonctionModel = this.useModel.createModel<FonctionDocument>(
    this.tenantName,
    'Fonction',
    FonctionSchema,
  );
  private readonly serviceModel = this.useModel.createModel<ServiceDocument>(
    this.tenantName,
    'Service',
    ServiceSchema,
  );
  private readonly directionModel =
    this.useModel.createModel<DirectionDocument>(
      this.tenantName,
      'Direction',
      DirectionSchema,
    );
  private readonly banqueModel = this.useModel.createModel<BanqueDocument>(
    this.tenantName,
    'Banque',
    BanqueSchema,
  );
  private readonly userModel = this.useModel.createModel<UserDocument>(
    this.tenantName,
    'User',
    UserSchema,
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

  async findOne(subdomain: string) {
    const configNavigation = [
      {
        box: 'briefcase-alt-2',
        name: 'Fonctions',
        average: await (await this.fonctionModel).countDocuments(),
      },
      {
        box: 'home',
        name: 'Services',
        average: await (await this.serviceModel).countDocuments(),
      },
      {
        box: 'building',
        name: 'Directions',
        average: await (await this.directionModel).countDocuments(),
      },
      {
        box: 'bank',
        name: 'Banques',
        average: await (await this.banqueModel).countDocuments(),
      },
      {
        box: 'group',
        name: 'Utilisateurs',
        average: await (await this.userModel).countDocuments(),
      },
      {
        box: 'grid',
        name: 'Grilles',
        average: await (await this.grilleModel).countDocuments(),
      },
      {
        box: 'category-alt',
        name: 'Categories',
        average: await (await this.categorieModel).countDocuments(),
      },
      {
        box: 'grid-alt',
        name: 'Echellons',
        average: await (await this.echellonModel).countDocuments(),
      },
    ];
    const tenant = await (await this.tenantModel).findOne({ subdomain }).exec();
    const {
      _id,
      raisonSociale,
      nif,
      rccmNumero,
      cotisationNumero,
      telephone,
      email,
      bp,
    } = tenant;
    const tenantFound = {
      _id,
      raisonSociale,
      nif,
      rccmNumero,
      cotisationNumero,
      telephone,
      email,
      bp,
    };
    return {
      tenantFound,
      configNavigation,
    };
  }

  async update(
    id: string,
    updateTenantDto: CreateTenantDTO,
  ): Promise<TenantDocument> {
    return await (await this.tenantModel)
      .findByIdAndUpdate(id, updateTenantDto, { new: true })
      .exec();
  }
}
