import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateAvancePretDTO } from 'src/dto/createAvancePret.dto';
import { UpdateAvancePretDTO } from 'src/dto/updateAvancePret.dto';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { UseModel } from 'src/providers/useModel.service';
import { AgentDocument, AgentSchema } from 'src/schemas/users/agent.schema';
import {
  AvancePretDocument,
  AvancePretSchema,
} from 'src/schemas/users/avancePret.schema';
import {
  RubriqueDocument,
  RubriqueSchema,
} from 'src/schemas/users/rubrique.schema';
import { formatDate } from 'src/utilities/formatDate';
import { getTenantName } from 'src/utilities/getTenantName';

@Injectable()
export class AvancePretService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}

  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );

  private readonly avancePretModel =
    this.useModel.createModel<AvancePretDocument>(
      this.tenantName,
      'AvancePret',
      AvancePretSchema,
    );

  private readonly agentModel = this.useModel.createModel<AgentDocument>(
    this.tenantName,
    'Agent',
    AgentSchema,
  );

  private readonly rubriqueModel = this.useModel.createModel<RubriqueDocument>(
    this.tenantName,
    'Rubrique',
    RubriqueSchema,
  );

  async create(absenceDto: CreateAvancePretDTO) {
    return await (await this.avancePretModel).create(absenceDto);
  }

  async findAll() {
    const avancePrets: any[] = await (
      await this.avancePretModel
    )
      .find({})
      .populate({ path: 'agent', model: await this.agentModel })
      .populate({ path: 'rubrique', model: await this.rubriqueModel });
    const result: any[] = [];
    avancePrets.map((avancePret) => {
      const data = {
        matricule: avancePret.agent.matricule,
        nomPrenom: `${avancePret.agent.nom} ${avancePret.agent.prenom}`,
        creance: avancePret.rubrique.libelle,
        debut: formatDate(avancePret.dateDebut),
        dureeEcheance: avancePret.dureeEcheance || 1,
        montantEcheance: avancePret.montantEcheance || avancePret.montant,
        montant: avancePret.montant,
        _id: avancePret._id,
      };
      result.push(data);
    });

    return result;
  }

  async findOne(id: string): Promise<AvancePretDocument> {
    const avancePret: AvancePretDocument = await (await this.avancePretModel)
      .findById(id)
      .populate({ path: 'rubrique', model: await this.rubriqueModel });
    const data = {
      agent: avancePret.agent,
      type: avancePret.type,
      dateDebut: formatDate(avancePret.dateDebut, '/'),
      dureeEcheance: avancePret.dureeEcheance || '',
      montantEcheance: avancePret.montantEcheance || '',
      rubrique: avancePret.rubrique.libelle,
      montant: avancePret.montant,
      _id: avancePret._id,
    } as unknown as AvancePretDocument;
    return data;
  }

  async update(
    updateAvancePretDto: UpdateAvancePretDTO,
  ): Promise<AvancePretDocument> {
    const { _id, ...datas } = updateAvancePretDto;
    const update = (await (await this.avancePretModel)
      .findByIdAndUpdate(_id, datas, { new: true })
      .exec()) as unknown as AvancePretDocument;
    return update;
  }
}
