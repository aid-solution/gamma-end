import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { CongeSchema, CongeDocument } from 'src/schemas/users/conge.schema';
import { differenceBetweenDates, formatDate } from 'src/utilities/formatDate';
import { CreateCongeDTO } from 'src/dto/createConge.dto';
import { CongeDTO } from 'src/dto/conge.dto';
import { AgentDocument, AgentSchema } from 'src/schemas/users/agent.schema';

@Injectable()
export class CongeService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}

  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );

  private readonly congeModel = this.useModel.createModel(
    this.tenantName,
    'conge',
    CongeSchema,
  );

  private readonly agentModel = this.useModel.createModel<AgentDocument>(
    this.tenantName,
    'Agent',
    AgentSchema,
  );

  async create(congeDto: CreateCongeDTO) {
    return await (await this.congeModel).create(congeDto);
  }

  async findAll() {
    return await (await this.congeModel)
      .find({})
      .populate({ path: 'agent', model: await this.agentModel });
  }

  async findOne(id: string): Promise<CongeDocument> {
    const conge: CongeDocument = await (await this.congeModel).findById(id);
    const data = {
      agent: conge.agent,
      type: conge.type,
      dateDebut: formatDate(conge.dateDebut, '/'),
      dateFin: formatDate(conge.dateFin, '/'),
      jours: differenceBetweenDates(conge.dateDebut, conge.dateFin),
      _id: conge._id,
    } as unknown as CongeDocument;
    return data;
  }

  async filterByAgent(agent: string): Promise<CongeDocument[]> {
    const conges: CongeDocument[] = await (
      await this.congeModel
    ).find({ agent });
    const listConge: CongeDocument[] = [];
    conges.map((conge) => {
      const data = {
        type: conge.type,
        dateDebut: formatDate(conge.dateDebut),
        dateFin: formatDate(conge.dateFin),
        jours: differenceBetweenDates(conge.dateDebut, conge.dateFin),
        _id: conge._id,
      } as unknown as CongeDocument;
      listConge.push(data);
    });
    return listConge;
  }

  async update(updateCongeDto: CongeDTO): Promise<CongeDocument> {
    const { _id, ...datas } = updateCongeDto;
    const update = (await (await this.congeModel)
      .findByIdAndUpdate(_id, datas, { new: true })
      .exec()) as unknown as CongeDocument;
    return update;
  }
}
