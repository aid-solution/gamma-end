import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  DirectionRubriqueDocument,
  DirectionRubriqueSchema,
} from 'src/schemas/users/directionRubrique.schema';

import { CreateDirectionRubriqueDTO } from 'src/dto/createDirectionRubrique.dto';
import { BulkWriteResult } from 'mongodb';
import {
  RubriqueDocument,
  RubriqueSchema,
} from 'src/schemas/users/rubrique.schema';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import {
  DirectionDocument,
  DirectionSchema,
} from 'src/schemas/users/direction.schema';

@Injectable()
export class DirectionRubriqueService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly directionRubriqueModel =
    this.useModel.createModel<DirectionRubriqueDocument>(
      this.tenantName,
      'DirectionRubrique',
      DirectionRubriqueSchema,
    );

  private readonly rubriqueModel = this.useModel.createModel<RubriqueDocument>(
    this.tenantName,
    'Rubrique',
    RubriqueSchema,
  );

  private readonly directionModel =
    this.useModel.createModel<DirectionDocument>(
      this.tenantName,
      'Direction',
      DirectionSchema,
    );

  async create(createDirectionDto: CreateDirectionRubriqueDTO[]) {
    return await (
      await this.directionRubriqueModel
    ).insertMany(createDirectionDto);
  }

  async findAll(): Promise<DirectionRubriqueDocument[]> {
    return await (await this.directionRubriqueModel).find({}).exec();
  }

  async findOne(id: string): Promise<DirectionRubriqueDocument> {
    return await (await this.directionRubriqueModel).findById(id).exec();
  }

  async findAllByDirection(
    direction: string,
  ): Promise<DirectionRubriqueDocument[]> {
    return await (
      await this.directionRubriqueModel
    )
      .find({ direction: direction })
      .populate({ path: 'rubrique', model: await this.rubriqueModel })
      .exec();
  }

  async findAllByDirectionAndRubriqueOnGoing(
    direction: string,
  ): Promise<DirectionRubriqueDocument[]> {
    return await (
      await this.directionRubriqueModel
    )
      .find({ direction: direction, dateFin: { $exists: false } })
      .populate({ path: 'rubrique', model: await this.rubriqueModel })
      .populate({ path: 'direction', model: await this.directionModel })
      .exec();
  }

  async findByPeriod(
    debutMois: Date,
    finMois: Date,
  ): Promise<DirectionRubriqueDocument[]> {
    return await (
      await this.directionRubriqueModel
    )
      .find({
        $or: [
          // Document entièrement dans le mois
          {
            dateDebut: { $gte: debutMois },
            dateFin: { $lte: finMois },
          },
          // Document englobe le mois
          {
            dateDebut: { $lte: debutMois },
            dateFin: { $gte: finMois },
          },
          // Document commence avant et finit dans le mois
          {
            dateDebut: { $lt: debutMois },
            dateFin: { $gte: debutMois },
          },
          // Document commence pendant le mois et n'a pas de dateFin
          {
            dateDebut: { $lte: finMois, $gt: debutMois },
            dateFin: { $exists: false },
          },
          // Document actif avant le mois sans dateFin
          {
            dateDebut: { $lte: debutMois },
            dateFin: { $exists: false },
          },
        ],
      })
      .populate({ path: 'rubrique', model: await this.rubriqueModel });
  }

  async update(
    updateDirectionDto: UpdateAffectationRubriqueDTO[],
  ): Promise<BulkWriteResult> {
    const bulkOps = updateDirectionDto.map((dto) => ({
      updateMany: {
        filter: { _id: dto._id },
        update: { $set: dto },
      },
    }));

    const result = await (await this.directionRubriqueModel).bulkWrite(bulkOps);
    return result;
  }

  async getMontantCNSSByDirection(): Promise<any[]> {
    const result = await (
      await this.directionRubriqueModel
    ).aggregate([
      {
        $lookup: {
          from: 'rubriques',
          localField: 'rubrique',
          foreignField: '_id',
          as: 'rubriqueDetails',
        },
      },
      {
        $unwind: '$rubriqueDetails',
      },
      {
        $match: {
          'rubriqueDetails.assujetiCNSS': true,
          'rubriqueDetails.entreBrut': true,
        },
      },
      {
        $group: {
          _id: '$direction',
          montant: { $sum: '$montant' },
        },
      },
      {
        $project: {
          _id: 0,
          rubrique: 'rubriqueDetails._id',
          direction: '$_id',
          totalMontant: 1,
        },
      },
    ]);

    return result;
  }

  async getMontantImpotByDirection(): Promise<any[]> {
    const result = await (
      await this.directionRubriqueModel
    ).aggregate([
      {
        $lookup: {
          from: 'rubriques',
          localField: 'rubrique',
          foreignField: '_id',
          as: 'rubriqueDetails',
        },
      },
      {
        $unwind: '$rubriqueDetails',
      },
      {
        $match: {
          'rubriqueDetails.assujetiImpot': true,
          'rubriqueDetails.entreBrut': true,
        },
      },
      {
        $group: {
          _id: '$direction',
          montant: { $sum: '$montant' },
        },
      },
      {
        $project: {
          _id: 0,
          rubrique: 'rubriqueDetails._id',
          direction: '$_id',
          totalMontant: 1,
        },
      },
    ]);

    return result;
  }
}
