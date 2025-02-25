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
    this.useModel.connectModel<DirectionRubriqueDocument>(
      this.tenantName,
      'DirectionRubrique',
      DirectionRubriqueSchema,
    );

  private readonly rubriqueModel = this.useModel.connectModel<RubriqueDocument>(
    this.tenantName,
    'Rubrique',
    RubriqueSchema,
  );

  private readonly directionModel =
    this.useModel.connectModel<DirectionDocument>(
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
      .sort({ _id: -1 })
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
      .sort({ _id: -1 })
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
          {
            dateDebut: { $gte: debutMois },
            dateFin: { $lte: finMois },
          },
          {
            dateDebut: { $lte: debutMois },
            dateFin: { $gte: finMois },
          },
          {
            dateDebut: { $lte: debutMois },
            dateFin: { $gte: debutMois },
          },
          {
            dateDebut: { $lte: finMois, $gte: debutMois },
            dateFin: { $gte: debutMois },
          },
          {
            dateDebut: { $lte: finMois, $gte: debutMois },
            $or: [{ dateFin: { $exists: false } }, { dateFin: null }],
          },
          {
            dateDebut: { $lte: debutMois },
            $or: [{ dateFin: { $exists: false } }, { dateFin: null }],
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
