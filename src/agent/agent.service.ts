import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UseModel } from '../providers/useModel.service';
import { AgentDocument, AgentSchema } from '../schemas/users/agent.schema';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import {
  AffectationDocument,
  AffectationSchema,
} from '../schemas/users/affectation.schema';
import { ChargeDocument, ChargeSchema } from 'src/schemas/users/charge.schema';
import {
  AgentAccountDocument,
  AgentAccountSchema,
} from 'src/schemas/users/agentAcount.schema';
import {
  FonctionDocument,
  FonctionSchema,
} from 'src/schemas/users/fonction.schema';
import { ClientSession } from 'mongoose';
import { AffectationService } from '../affectation/affectation.service';
import { ChargeService } from '../charge/charge.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { AgentDTO } from 'src/dto/agent.dto';
import { CreateAffectationDTO } from 'src/dto/createAffectation.dto';
import { CreateAgentDTO } from 'src/dto/createAgent.dto';

@Injectable()
export class AgentService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
    private readonly affectationService: AffectationService,
    private readonly chargeService: ChargeService,
  ) {}

  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );

  private readonly agentModel = this.useModel.createModel<AgentDocument>(
    this.tenantName,
    'Agent',
    AgentSchema,
  );

  private readonly affectationModel =
    this.useModel.createModel<AffectationDocument>(
      this.tenantName,
      'Affectation',
      AffectationSchema,
    );

  private readonly agentAccountModel =
    this.useModel.createModel<AgentAccountDocument>(
      this.tenantName,
      'AgentAccount',
      AgentAccountSchema,
    );

  private readonly chargeModel = this.useModel.createModel<ChargeDocument>(
    this.tenantName,
    'Charge',
    ChargeSchema,
  );

  private readonly fonctionModel = this.useModel.createModel<FonctionDocument>(
    this.tenantName,
    'Fonction',
    FonctionSchema,
  );

  private async agentTransaction(
    session: ClientSession,
    agentDto: CreateAgentDTO,
  ) {
    return await (
      await this.agentModel
    ).create([agentDto], {
      session,
    });
  }

  async createWithTransaction(agentDto: AgentDTO) {
    const session = await (await this.agentModel).startSession();
    try {
      session.startTransaction();
      const {
        affectation: affectationData,
        charges: chargeData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        agentAccount,
        ...createAgentDto
      } = agentDto;

      const agent = (
        await this.agentTransaction(session, createAgentDto)
      )[0] as AgentDocument;

      // Create the affectation document with the session
      const createAffectationDto: CreateAffectationDTO = {
        statut: 'Recruitement',
        agent: agent._id,
        ...affectationData,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const affectation = await this.affectationService.createWithTransaction(
        session,
        createAffectationDto,
      );

      // Prepare charge documents and insert them with the session
      const chargeDocs = chargeData.map((data: any) => ({
        ...data,
        agent: agent._id,
      }));
      const charge = await this.chargeService.createWithTransaction(
        session,
        chargeDocs,
      );

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      const agentCreated = {
        ...agent,
        affectation: { ...affectation },
        charge: { ...charge },
      };
      console.log(agentCreated);
      return agentCreated;
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction aborted due to an error: ', error);
      throw new InternalServerErrorException(
        error,
        'An error occured while creating the agent',
      );
    }
  }

  async create(agentDto: AgentDTO) {
    try {
      const {
        affectation: affectationData,
        charges: chargeData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        agentAccount,
        ...createAgentDto
      } = agentDto;

      const agent = (await (await this.agentModel).create([createAgentDto]))[0];

      const createAffectationDto: CreateAffectationDTO = {
        statut: 'Recruitement',
        agent: agent._id,
        ...affectationData,
      };
      await this.affectationService.create(createAffectationDto);

      const chargeDocs = chargeData.map((data: any) => ({
        ...data,
        agent: agent._id,
      }));
      await this.chargeService.create(chargeDocs);

      return agent._id;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'An error occured while creating the agent',
      );
    }
  }

  async findAll(): Promise<AgentDocument[]> {
    return await (await this.agentModel).find({}).populate({
      path: 'fonction',
      model: await this.fonctionModel,
    });
  }

  async findOne(_id: string): Promise<AgentDocument> {
    return (await (await this.agentModel).findById({ _id })).populate({
      path: 'fonction',
      model: await this.fonctionModel,
    });
  }

  async update(id: string, updateAgentDto: AgentDTO) {
    return updateAgentDto;
  }
}
