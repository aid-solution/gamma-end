import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  FonctionDocument,
  FonctionSchema,
} from 'src/schemas/users/Fonction.schema';
import { FonctionDTO } from 'src/dto/fonction.dto';
import { CreateFonctionRubriqueDTO } from 'src/dto/createFonctionRubrique.dto';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import { AffectationRubriqueDTO } from 'src/dto/affectationRubrique.dto';
import { FonctionRubriqueService } from 'src/fonction-rubrique/fonction-rubrique.service';
import { FonctionRubrique } from 'src/schemas/users/FonctionRubrique.schema';
import { CreateFonctionDTO } from 'src/dto/createFonction.dto';
import {
  DirectionDocument,
  DirectionSchema,
} from 'src/schemas/users/direction.schema';
import {
  ServiceDocument,
  ServiceSchema,
} from 'src/schemas/users/service.schema';

interface Obj {
  service?: string;
  direction?: string;
}
@Injectable()
export class FonctionService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
    private readonly fonctionRubriqueService: FonctionRubriqueService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly fonctionModel = this.useModel.createModel<FonctionDocument>(
    this.tenantName,
    'Fonction',
    FonctionSchema,
  );
  private readonly directionModel =
    this.useModel.createModel<DirectionDocument>(
      this.tenantName,
      'Direction',
      DirectionSchema,
    );
  private readonly serviceModel = this.useModel.createModel<ServiceDocument>(
    this.tenantName,
    'Service',
    ServiceSchema,
  );

  private getAllRubriqueFonction(
    oldRubrique: FonctionRubrique[],
    rubrique: AffectationRubriqueDTO[],
  ) {
    const affectationRubriqueUpdate: UpdateAffectationRubriqueDTO[] = [];
    const idOfUsedRubrique: string[] = [];
    oldRubrique.map((old: any) => {
      const filter = rubrique.filter(
        (rub: any) => rub._id === old.rubrique._id.toString(),
      );

      if (!filter.length || (filter[0] && filter[0].montant !== old.montant)) {
        const affectation = {
          _id: old._id,
          dateFin: new Date(),
        } as unknown as UpdateAffectationRubriqueDTO;
        affectationRubriqueUpdate.push(affectation);
      } else if (
        filter[0] &&
        filter[0].montant === old.montant &&
        old.dateFin === undefined
      ) {
        idOfUsedRubrique.push(filter[0]._id);
      }
    });
    return { affectationRubriqueUpdate, idOfUsedRubrique };
  }

  private affectationRubriqueFonction(
    id: string,
    rubrique: AffectationRubriqueDTO[],
    idOfUsedRubrique: string[],
  ) {
    const affectationRubrique: CreateFonctionRubriqueDTO[] = [];
    rubrique.map((rub) => {
      if (!idOfUsedRubrique.includes(rub._id)) {
        const affectation = {
          rubrique: rub._id,
          fonction: id,
          montant: rub.montant,
        } as unknown as CreateFonctionRubriqueDTO;
        affectationRubrique.push(affectation);
      }
    });
    return affectationRubrique;
  }

  async create(fonctionDto: FonctionDTO) {
    const { rubrique, ...fonctionObject } = fonctionDto;

    const obj: Obj = {};
    if (fonctionObject.rattache === 'Service')
      obj.service = fonctionObject.rattacheA;
    else obj.direction = fonctionObject.rattacheA;

    const createFonctionDto = {
      libelle: fonctionObject.libelle,
      rattache: fonctionObject.rattache,
      ...obj,
    } as unknown as CreateFonctionDTO;
    const fonction = await (await this.fonctionModel).create(createFonctionDto);
    const affectationRubrique: CreateFonctionRubriqueDTO[] =
      this.affectationRubriqueFonction(fonction._id.toString(), rubrique, []);

    await this.fonctionRubriqueService.create(affectationRubrique);

    return fonction;
  }

  async findAll(): Promise<FonctionDocument[]> {
    return await (
      await this.fonctionModel
    )
      .find({})
      .populate({ path: 'direction', model: await this.directionModel })
      .populate({ path: 'service', model: await this.serviceModel })
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
  async update(id: string, updateFonctionDto: FonctionDTO) {
    const oldRubrique =
      await this.fonctionRubriqueService.findAllByFonction(id);

    const { rubrique, ...fonctionObject } = updateFonctionDto;

    const { affectationRubriqueUpdate, idOfUsedRubrique } =
      this.getAllRubriqueFonction(oldRubrique, rubrique);

    const affectationRubrique = this.affectationRubriqueFonction(
      id,
      rubrique,
      idOfUsedRubrique,
    );

    const FonctionUpdated = await (await this.fonctionModel)
      .findByIdAndUpdate(id, fonctionObject, { new: true })
      .exec();

    if (affectationRubriqueUpdate.length > 0)
      await this.fonctionRubriqueService.update(affectationRubriqueUpdate);
    if (affectationRubrique.length > 0)
      await this.fonctionRubriqueService.create(affectationRubrique);
    return FonctionUpdated;
  }
}
