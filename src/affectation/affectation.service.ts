import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  AffectationDocument,
  AffectationSchema,
} from 'src/schemas/users/affectation.schema';
import { CreateAffectationDTO } from 'src/dto/createAffectation.dto';
import {
  DirectionDocument,
  DirectionSchema,
} from 'src/schemas/users/direction.schema';
import {
  FonctionDocument,
  FonctionSchema,
} from 'src/schemas/users/fonction.schema';
import {
  ServiceDocument,
  ServiceSchema,
} from 'src/schemas/users/service.schema';
import { GrilleDocument, GrilleSchema } from 'src/schemas/users/grille.schema';
import {
  AgentRubriqueDocument,
  AgentRubriqueSchema,
} from 'src/schemas/users/agentRubrique.schema';
import { formatDate } from 'src/utilities/formatDate';
import { UpdateAffectationDTO } from 'src/dto/updateAffectation.dto';
import { AgentDocument, AgentSchema } from 'src/schemas/users/agent.schema';

@Injectable()
export class AffectationService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}

  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );

  private readonly affectationModel =
    this.useModel.createModel<AffectationDocument>(
      this.tenantName,
      'Affectation',
      AffectationSchema,
    );

  private readonly agentModel = this.useModel.createModel<AgentDocument>(
    this.tenantName,
    'Agent',
    AgentSchema,
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

  private readonly grilleModel = this.useModel.createModel<GrilleDocument>(
    this.tenantName,
    'Grille',
    GrilleSchema,
  );

  private readonly agentRubriqueModel =
    this.useModel.createModel<AgentRubriqueDocument>(
      this.tenantName,
      'AgentRubrique',
      AgentRubriqueSchema,
    );

  async create(
    affectationDto: CreateAffectationDTO,
  ): Promise<AffectationDocument> {
    return await (await this.affectationModel).create(affectationDto);
  }

  async findAll() {
    return await (
      await this.affectationModel
    )
      .find({})
      .populate({ path: 'agent', model: await this.agentModel })
      .populate({
        path: 'fonction',
        model: await this.fonctionModel,
        populate: {
          path: 'direction',
          model: await this.directionModel,
        },
      })
      .populate({
        path: 'fonction',
        model: await this.fonctionModel,
        populate: {
          path: 'service',
          model: await this.serviceModel,
          populate: {
            path: 'direction',
            model: await this.directionModel,
          },
        },
      })
      .populate({ path: 'grille', model: await this.grilleModel })
      .sort({ _id: -1 });
  }

  async findOne(id: string) {
    const affectation = await (
      await this.affectationModel
    )
      .findById(id)
      .populate({
        path: 'fonction',
        model: await this.fonctionModel,
        populate: {
          path: 'service',
          model: await this.serviceModel,
        },
      })
      .populate({
        path: 'fonction',
        model: await this.fonctionModel,
        populate: {
          path: 'direction',
          model: await this.directionModel,
        },
      })
      .populate({ path: 'grille', model: await this.grilleModel })
      .populate({ path: 'agentRubrique', model: await this.agentRubriqueModel })
      .sort({ _id: -1 });
    return {
      agent: affectation.agent,
      statut: affectation.statut,
      dateDebut: formatDate(affectation.dateDebut, '/'),
      dateFin: affectation.dateFin ? formatDate(affectation.dateFin, '/') : '',
      fonction: affectation.fonction.libelle,
      rattache:
        affectation.fonction.rattache === 'Service'
          ? affectation.fonction.service.libelle
          : affectation.fonction.direction.libelle,
      grille: affectation.grille.libelle,
      salaire: affectation.agentRubrique.montant.toString(),
      _id: affectation._id,
    };
  }

  async findOneWithoutPopulate(id: string): Promise<any> {
    return await (await this.affectationModel).findById(id);
  }

  async update(
    updateAffectationDto: UpdateAffectationDTO,
  ): Promise<AffectationDocument> {
    const { _id, ...datas } = updateAffectationDto;
    return await (await this.affectationModel)
      .findByIdAndUpdate(_id, datas, { new: true })
      .exec();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findByAgent(agent: string) {
    return await (
      await this.affectationModel
    )
      .find({ agent })
      .populate({
        path: 'fonction',
        model: await this.fonctionModel,
        populate: {
          path: 'direction',
          model: await this.directionModel,
        },
      })
      .populate({
        path: 'fonction',
        model: await this.fonctionModel,
        populate: {
          path: 'service',
          model: await this.serviceModel,
          populate: {
            path: 'direction',
            model: await this.directionModel,
          },
        },
      })
      .populate({ path: 'grille', model: await this.grilleModel })
      .sort({ _id: -1 });
  }
  async filterByAgent(agent: string): Promise<AffectationDocument[]> {
    const affectations = await (
      await this.affectationModel
    )
      .find({ agent })
      .populate({
        path: 'fonction',
        model: await this.fonctionModel,
        populate: {
          path: 'service',
          model: await this.serviceModel,
        },
      })
      .populate({
        path: 'fonction',
        model: await this.fonctionModel,
        populate: {
          path: 'direction',
          model: await this.directionModel,
        },
      })
      .populate({ path: 'grille', model: await this.grilleModel })
      .populate({ path: 'agentRubrique', model: await this.agentRubriqueModel })
      .sort({ _id: -1 });

    const listAffection: any[] = [];
    affectations.map((affectation) => {
      listAffection.push({
        statut: affectation.statut,
        dateDebut: formatDate(affectation.dateDebut),
        dateFin: affectation.dateFin ? formatDate(affectation.dateFin) : '',
        fonction: affectation.fonction.libelle,
        rattache:
          affectation.fonction.rattache === 'Service'
            ? affectation.fonction.service.libelle
            : affectation.fonction.direction.libelle,
        grille: affectation.grille.libelle,
        salaire: affectation.agentRubrique.montant,
        _id: affectation._id,
      });
    });
    return listAffection;
  }

  async latestByAgent(agent: string): Promise<AffectationDocument[]> {
    return await (await this.affectationModel)
      .find({ agent })
      .sort({ _id: -1 })
      .limit(1);
  }

  async latestByAgentWithPopulate(
    agent: string,
  ): Promise<AffectationDocument[]> {
    return await (
      await this.affectationModel
    )
      .find({ agent })
      .populate({
        path: 'fonction',
        model: await this.fonctionModel,
        populate: {
          path: 'direction',
          model: await this.directionModel,
        },
      })
      .populate({
        path: 'fonction',
        model: await this.fonctionModel,
        populate: {
          path: 'service',
          model: await this.serviceModel,
          populate: {
            path: 'direction',
            model: await this.directionModel,
          },
        },
      })
      .populate({ path: 'grille', model: await this.grilleModel })
      .sort({ _id: -1 })
      .limit(1);
  }
}
