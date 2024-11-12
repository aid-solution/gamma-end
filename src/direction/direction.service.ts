import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  DirectionDocument,
  DirectionSchema,
} from 'src/schemas/users/direction.schema';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';
import { DirectionDTO } from 'src/dto/direction.dto';
import { CreateDirectionRubriqueDTO } from 'src/dto/createDirectionRubrique.dto';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import { DirectionRubrique } from 'src/schemas/users/directionRubrique.schema';
import { AffectationRubriqueDTO } from 'src/dto/affectationRubrique.dto';
@Injectable()
export class DirectionService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
    private readonly directionRubriqueService: DirectionRubriqueService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly directionModel =
    this.useModel.createModel<DirectionDocument>(
      this.tenantName,
      'Direction',
      DirectionSchema,
    );

  private getAllRubriqueDirection(
    oldRubrique: DirectionRubrique[],
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

  private affectationRubriqueDirection(
    id: string,
    rubrique: AffectationRubriqueDTO[],
    idOfUsedRubrique: string[],
  ) {
    const affectationRubrique: CreateDirectionRubriqueDTO[] = [];
    rubrique.map((rub) => {
      if (!idOfUsedRubrique.includes(rub._id)) {
        const affectation = {
          rubrique: rub._id,
          direction: id,
          montant: rub.montant,
        } as unknown as CreateDirectionRubriqueDTO;
        affectationRubrique.push(affectation);
      }
    });
    return affectationRubrique;
  }

  async create(directionDto: DirectionDTO) {
    const { libelle, rubrique } = directionDto;
    const direction = await (await this.directionModel).create({ libelle });
    const affectationRubrique: CreateDirectionRubriqueDTO[] =
      this.affectationRubriqueDirection(direction._id.toString(), rubrique, []);

    await this.directionRubriqueService.create(affectationRubrique);

    return direction;
  }

  async findAll(): Promise<DirectionDocument[]> {
    return await (await this.directionModel).find({}).sort({ _id: -1 }).exec();
  }

  async findOne(id: string): Promise<DirectionDocument> {
    return await (await this.directionModel).findById(id).exec();
  }

  async researchDuplicate(libelle: string): Promise<DirectionDocument> {
    return await (await this.directionModel).findOne({ libelle }).exec();
  }

  async update(id: string, updateDirectionDto: DirectionDTO) {
    const oldRubrique =
      await this.directionRubriqueService.findAllByDirection(id);

    const { libelle, rubrique } = updateDirectionDto;

    const { affectationRubriqueUpdate, idOfUsedRubrique } =
      this.getAllRubriqueDirection(oldRubrique, rubrique);

    const affectationRubrique = this.affectationRubriqueDirection(
      id,
      rubrique,
      idOfUsedRubrique,
    );

    const directionUpdated = await (await this.directionModel)
      .findByIdAndUpdate(id, { libelle }, { new: true })
      .exec();

    if (affectationRubriqueUpdate.length > 0)
      await this.directionRubriqueService.update(affectationRubriqueUpdate);
    if (affectationRubrique.length > 0)
      await this.directionRubriqueService.create(affectationRubrique);
    return directionUpdated;
  }
}
