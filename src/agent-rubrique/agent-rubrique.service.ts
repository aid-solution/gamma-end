import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { BulkWriteResult } from 'mongodb';
import {
  RubriqueDocument,
  RubriqueSchema,
} from 'src/schemas/users/rubrique.schema';
import {
  AgentRubriqueDocument,
  AgentRubriqueSchema,
} from 'src/schemas/users/agentRubrique.schema';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import { CreateAgentRubriqueDTO } from 'src/dto/createAgentRubrique.dto';

@Injectable()
export class AgentRubriqueService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly agentRubriqueModel =
    this.useModel.createModel<AgentRubriqueDocument>(
      this.tenantName,
      'AgentRubrique',
      AgentRubriqueSchema,
    );

  private readonly rubriqueModel = this.useModel.createModel<RubriqueDocument>(
    this.tenantName,
    'Rubrique',
    RubriqueSchema,
  );

  async create(createAgentDto: CreateAgentRubriqueDTO[]) {
    return await (await this.agentRubriqueModel).insertMany(createAgentDto);
  }

  async findAll(): Promise<AgentRubriqueDocument[]> {
    return await (await this.agentRubriqueModel).find({}).exec();
  }

  async findOne(id: string): Promise<AgentRubriqueDocument> {
    return await (await this.agentRubriqueModel).findById(id).exec();
  }

  async findAllAgent(agent: string): Promise<AgentRubriqueDocument[]> {
    return await (
      await this.agentRubriqueModel
    )
      .find({ agent: agent })
      .populate({ path: 'rubrique', model: await this.rubriqueModel })
      .exec();
  }

  async findAllByAgentAndRubriqueOnGoing(
    agent: string,
  ): Promise<AgentRubriqueDocument[]> {
    return await (
      await this.agentRubriqueModel
    )
      .find({ agent: agent, dateFin: { $exists: false } })
      .populate({ path: 'rubrique', model: await this.rubriqueModel })
      .exec();
  }

  async update(
    updateAgentRubriqueDto: UpdateAffectationRubriqueDTO[],
  ): Promise<BulkWriteResult> {
    const bulkOps = updateAgentRubriqueDto.map((dto) => ({
      updateMany: {
        filter: { _id: dto._id },
        update: { $set: dto },
      },
    }));

    const result = await (await this.agentRubriqueModel).bulkWrite(bulkOps);
    return result;
  }
}
