import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  AgentAccountDocument,
  AgentAccountSchema,
} from 'src/schemas/users/agentAcount.schema';
import { CreateAgentAccountDTO } from 'src/dto/createAgentAccout.dto';
import { BanqueDocument, BanqueSchema } from 'src/schemas/users/banque.schema';
import { AgentDocument, AgentSchema } from 'src/schemas/users/agent.schema';

@Injectable()
export class AgentAccountService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly agentAccountModel =
    this.useModel.createModel<AgentAccountDocument>(
      this.tenantName,
      'AgentAccount',
      AgentAccountSchema,
    );

  private readonly banqueModel = this.useModel.createModel<BanqueDocument>(
    this.tenantName,
    'Banque',
    BanqueSchema,
  );
  private readonly agentModel = this.useModel.createModel<AgentDocument>(
    this.tenantName,
    'Agent',
    AgentSchema,
  );

  async create(
    createAgentAccoutDto: CreateAgentAccountDTO,
  ): Promise<AgentAccountDocument> {
    return await (await this.agentAccountModel).create(createAgentAccoutDto);
  }

  async findAll(): Promise<AgentAccountDocument[]> {
    return await (
      await this.agentAccountModel
    )
      .find({})
      .populate({ path: 'banque', model: await this.banqueModel })
      .sort({ _id: -1 })
      .exec();
  }

  async findOne(id: string): Promise<AgentAccountDocument> {
    return await (await this.agentAccountModel)
      .findById(id)
      .populate({ path: 'banque', model: await this.banqueModel });
  }

  async findByAgent(agent: string): Promise<AgentAccountDocument[]> {
    return await (
      await this.agentAccountModel
    )
      .find({ agent })
      .populate({ path: 'banque', model: await this.banqueModel })
      .sort({ _id: -1 });
  }

  async researchDuplicate(compte: string): Promise<AgentAccountDocument> {
    return await (
      await this.agentAccountModel
    )
      .findOne({ compte })
      .populate({ path: 'agent', model: await this.agentModel })
      .select({ compte: 1, agent: 1 });
  }

  async updateByAgent(
    agent: string,
    createAgentAccoutDto: CreateAgentAccountDTO,
  ): Promise<AgentAccountDocument> {
    return await (await this.agentAccountModel)
      .findOneAndUpdate({ agent }, createAgentAccoutDto, { new: true })
      .exec();
  }
}
