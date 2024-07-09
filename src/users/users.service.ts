import { Inject, Injectable } from '@nestjs/common';
import { UseModel } from '../providers/useModel.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UserDocument, UserSchema } from '../schemas/users/user.schema';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { AgentDocument, AgentSchema } from 'src/schemas/users/agent.schema';
import { ProfilDocument, ProfilSchema } from 'src/schemas/users/profil.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}

  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private userModel = this.useModel.createModel<UserDocument>(
    this.tenantName,
    'User',
    UserSchema,
  );

  private readonly agentModel = this.useModel.createModel<AgentDocument>(
    this.tenantName,
    'Agent',
    AgentSchema,
  );

  private readonly profilModel = this.useModel.createModel<ProfilDocument>(
    this.tenantName,
    'Profil',
    ProfilSchema,
  );

  async findOne(id: string, select?: string) {
    return (await this.userModel).findById(id).select(select);
  }

  async findOneWithLogin(login: string): Promise<UserDocument> {
    return await (await this.userModel)
      .findOne({ login })
      .populate({ path: 'profil', model: await this.profilModel });
  }

  async findAll() {
    return await (
      await this.userModel
    )
      .find()
      .populate({ path: 'agent', model: await this.agentModel })
      .populate({ path: 'profil', model: await this.profilModel })
      .lean();
  }
}
