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
  private readonly fonctionRubriqueFonctionModel =
    this.useModel.connectModel<FonctionRubriqueDocument>(
      this.tenantName,
      'FonctionRubrique',
      FonctionRubriqueSchema,
    );

  private readonly rubriqueModel = this.useModel.connectModel<RubriqueDocument>(
    this.tenantName,
    'Rubrique',
    RubriqueSchema,
  );

  async create(createFonctionDto: CreateFonctionRubriqueDTO[]) {
    return await (
      await this.fonctionRubriqueFonctionModel
    ).insertMany(createFonctionDto);
  }

  async findAll(): Promise<FonctionRubriqueDocument[]> {
    return await (await this.fonctionRubriqueFonctionModel)
      .find({})
      .sort({ _id: -1 })
      .exec();
  }

  async findOne(id: string): Promise<FonctionRubriqueDocument> {
    return await (await this.fonctionRubriqueFonctionModel).findById(id).exec();
  }

  async findAllByFonction(
    fonction: string,
  ): Promise<FonctionRubriqueDocument[]> {
    return await (
      await this.fonctionRubriqueFonctionModel
    )
      .find({ fonction: fonction })
      .populate({ path: 'rubrique', model: await this.rubriqueModel })
      .exec();
  }

  async findAllByFonctionAndRubriqueOnGoing(
    fonction: string,
  ): Promise<FonctionRubriqueDocument[]> {
    return await (
      await this.fonctionRubriqueFonctionModel
    )
      .find({ fonction: fonction, dateFin: { $exists: false } })
      .populate({ path: 'rubrique', model: await this.rubriqueModel })
      .sort({ _id: -1 })
      .exec();
  }

  async findByPeriod(
    debutMois: Date,
    finMois: Date,
  ): Promise<FonctionRubriqueDocument[]> {
    return await (
      await this.fonctionRubriqueFonctionModel
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
    updateFonctionDto: UpdateAffectationRubriqueDTO[],
  ): Promise<BulkWriteResult> {
    const bulkOps = updateFonctionDto.map((dto) => ({
      updateMany: {
        filter: { _id: dto._id },
        update: { $set: dto },
      },
    }));

    const result = await (
      await this.fonctionRubriqueFonctionModel
    ).bulkWrite(bulkOps);
    return result;
  }

  async getMontantCNSSByFonction(): Promise<any[]> {
    const result = await (
      await this.fonctionRubriqueFonctionModel
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
          _id: '$fonction',
          montant: { $sum: '$montant' },
        },
      },
      {
        $project: {
          _id: 0,
          rubrique: 'rubriqueDetails._id',
          fonction: '$_id',
          totalMontant: 1,
        },
      },
    ]);

    return result;
  }

  async getMontantImpotByFonction(): Promise<any[]> {
    const result = await (
      await this.fonctionRubriqueFonctionModel
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
          _id: '$fonction',
          montant: { $sum: '$montant' },
        },
      },
      {
        $project: {
          _id: 0,
          rubrique: 'rubriqueDetails._id',
          fonction: '$_id',
          totalMontant: 1,
        },
      },
    ]);

    return result;
  }
}
