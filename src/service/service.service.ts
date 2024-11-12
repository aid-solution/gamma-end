import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  ServiceDocument,
  ServiceSchema,
} from 'src/schemas/users/service.schema';
import {
  DirectionDocument,
  DirectionSchema,
} from 'src/schemas/users/direction.schema';
import { ServiceDTO } from 'src/dto/service.dto';
import { AffectationRubriqueDTO } from 'src/dto/affectationRubrique.dto';
import { CreateServiceRubriqueDTO } from 'src/dto/createServiceRubrique.dto';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import { ServiceRubrique } from 'src/schemas/users/serviceRubrique.schema';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';

@Injectable()
export class ServiceService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
    private readonly serviceRubriqueService: ServiceRubriqueService,
  ) {}

  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
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

  private getAllRubriqueService(
    oldRubrique: ServiceRubrique[],
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

  private affectationRubriqueService(
    id: string,
    rubrique: AffectationRubriqueDTO[],
    idOfUsedRubrique: string[],
  ) {
    const affectationRubrique: CreateServiceRubriqueDTO[] = [];
    rubrique.map((rub) => {
      if (!idOfUsedRubrique.includes(rub._id)) {
        const affectation = {
          rubrique: rub._id,
          service: id,
          montant: rub.montant,
        } as unknown as CreateServiceRubriqueDTO;
        affectationRubrique.push(affectation);
      }
    });
    return affectationRubrique;
  }

  async create(createServiceDto: ServiceDTO): Promise<ServiceDocument> {
    const { libelle, direction, rubrique } = createServiceDto;
    const service = await (
      await this.serviceModel
    ).create({ libelle, direction });
    const affectationRubrique: CreateServiceRubriqueDTO[] =
      this.affectationRubriqueService(service._id.toString(), rubrique, []);

    await this.serviceRubriqueService.create(affectationRubrique);

    return service;
  }

  async findAll(): Promise<ServiceDocument[]> {
    return await (
      await this.serviceModel
    )
      .find({})
      .populate({ path: 'direction', model: await this.directionModel })
      .sort({ _id: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ServiceDocument> {
    return await (
      await this.serviceModel
    )
      .findById(id)
      .populate({ path: 'direction', model: await this.directionModel })
      .exec();
  }

  async researchDuplicate(libelle: string): Promise<ServiceDocument> {
    return await (await this.serviceModel).findOne({ libelle }).exec();
  }

  async update(id: string, updateServiceDto: ServiceDTO) {
    const oldRubrique = await this.serviceRubriqueService.findAllByService(id);

    const { libelle, direction, rubrique } = updateServiceDto;

    const { affectationRubriqueUpdate, idOfUsedRubrique } =
      this.getAllRubriqueService(oldRubrique, rubrique);

    const affectationRubrique = this.affectationRubriqueService(
      id,
      rubrique,
      idOfUsedRubrique,
    );

    const serviceUpdated = await (await this.serviceModel)
      .findByIdAndUpdate(id, { libelle, direction }, { new: true })
      .exec();

    if (affectationRubriqueUpdate.length > 0)
      await this.serviceRubriqueService.update(affectationRubriqueUpdate);
    if (affectationRubrique.length > 0)
      await this.serviceRubriqueService.create(affectationRubrique);
    return serviceUpdated;
  }
}
