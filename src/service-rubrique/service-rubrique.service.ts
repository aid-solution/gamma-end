import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  ServiceRubriqueDocument,
  ServiceRubriqueSchema,
} from 'src/schemas/users/serviceRubrique.schema';
import { CreateServiceRubriqueDTO } from 'src/dto/createServiceRubrique.dto';
import { BulkWriteResult } from 'mongodb';
import {
  RubriqueDocument,
  RubriqueSchema,
} from 'src/schemas/users/rubrique.schema';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import {
  ServiceDocument,
  ServiceSchema,
} from 'src/schemas/users/service.schema';

@Injectable()
export class ServiceRubriqueService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly serviceRubriqueServiceModel =
    this.useModel.createModel<ServiceRubriqueDocument>(
      this.tenantName,
      'ServiceRubrique',
      ServiceRubriqueSchema,
    );

  private readonly rubriqueModel = this.useModel.createModel<RubriqueDocument>(
    this.tenantName,
    'Rubrique',
    RubriqueSchema,
  );

  private readonly serviceModel = this.useModel.createModel<ServiceDocument>(
    this.tenantName,
    'Service',
    ServiceSchema,
  );

  async create(createServiceDto: CreateServiceRubriqueDTO[]) {
    return await (
      await this.serviceRubriqueServiceModel
    ).insertMany(createServiceDto);
  }

  async findAll(): Promise<ServiceRubriqueDocument[]> {
    return await (await this.serviceRubriqueServiceModel).find({}).exec();
  }

  async findOne(id: string): Promise<ServiceRubriqueDocument> {
    return await (await this.serviceRubriqueServiceModel).findById(id).exec();
  }

  async findAllByService(service: string): Promise<ServiceRubriqueDocument[]> {
    return await (
      await this.serviceRubriqueServiceModel
    )
      .find({ service: service })
      .populate({ path: 'rubrique', model: await this.rubriqueModel })
      .sort({ _id: -1 })
      .exec();
  }

  async findAllByServiceAndRubriqueOnGoing(
    service: string,
  ): Promise<ServiceRubriqueDocument[]> {
    return await (
      await this.serviceRubriqueServiceModel
    )
      .find({ service: service, dateFin: { $exists: false } })
      .populate({ path: 'rubrique', model: await this.rubriqueModel })
      .populate({ path: 'service', model: await this.serviceModel })
      .sort({ _id: -1 })
      .exec();
  }

  async findByPeriod(
    debutMois: Date,
    finMois: Date,
  ): Promise<ServiceRubriqueDocument[]> {
    return await (
      await this.serviceRubriqueServiceModel
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
            dateDebut: { $lte: debutMois },
            dateFin: { $lte: debutMois },
          },
          {
            dateDebut: { $lte: finMois, $gte: debutMois },
            dateFin: { $gte: debutMois },
          },
          {
            dateDebut: { $lte: finMois, $gte: debutMois },
            dateFin: { $exists: false },
          },
          {
            dateDebut: { $lte: debutMois },
            dateFin: { $exists: false },
          },
        ],
      })
      .populate({ path: 'rubrique', model: await this.rubriqueModel });
  }

  async update(
    updateServiceDto: UpdateAffectationRubriqueDTO[],
  ): Promise<BulkWriteResult> {
    const bulkOps = updateServiceDto.map((dto) => ({
      updateMany: {
        filter: { _id: dto._id },
        update: { $set: dto },
      },
    }));

    const result = await (
      await this.serviceRubriqueServiceModel
    ).bulkWrite(bulkOps);
    return result;
  }

  async getMontantCNSSByDirection(): Promise<any[]> {
    const result = await (
      await this.serviceRubriqueServiceModel
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
          _id: '$service',
          montant: { $sum: '$montant' },
        },
      },
      {
        $project: {
          _id: 0,
          rubrique: 'rubriqueDetails._id',
          service: '$_id',
          totalMontant: 1,
        },
      },
    ]);

    return result;
  }

  async getMontantImpotByDirection(): Promise<any[]> {
    const result = await (
      await this.serviceRubriqueServiceModel
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
          _id: '$service',
          montant: { $sum: '$montant' },
        },
      },
      {
        $project: {
          _id: 0,
          rubrique: 'rubriqueDetails._id',
          service: '$_id',
          totalMontant: 1,
        },
      },
    ]);

    return result;
  }
}
