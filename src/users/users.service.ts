import { Inject, Injectable } from '@nestjs/common';
import { UseModel } from '../providers/useModel.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UserDocument, UserSchema } from '../schemas/users/user.schema';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { AgentDocument, AgentSchema } from 'src/schemas/users/agent.schema';
import { ProfilDocument, ProfilSchema } from 'src/schemas/users/profil.schema';
import { CreateUserDTO } from 'src/dto/createUser.dto';
import * as bcrypt from 'bcrypt';

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

  async create(createUserDto: CreateUserDTO) {
    const saltRound = bcrypt.genSaltSync();
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRound);
    createUserDto.password = hashedPassword;
    return await (await this.userModel).create(createUserDto);
  }

  async findOne(id: string, select?: string) {
    const result: any = await (
      await this.userModel
    )
      .findById(id)
      .populate({ path: 'profil', model: await this.profilModel })
      .populate({ path: 'agent', model: await this.agentModel })
      .select(select);

    const user = {
      _id: result._id,
      login: result.login,
      statut: result.statut,
      agent: {
        nom: result.agent ? result.agent.nom : 'Super',
        prenom: result.agent ? result.agent.prenom : 'Admin',
      },
      profil: result.profil,
    } as unknown as UserDocument;

    return user;
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
      .find({ login: { $ne: 'user' } })
      .select('-password')
      .populate({ path: 'agent', model: await this.agentModel })
      .populate({ path: 'profil', model: await this.profilModel })
      .sort({ _id: -1 })
      .lean();
  }

  async findUser(id: string) {
    return await (
      await this.userModel
    )
      .findById(id)
      .populate({ path: 'agent', model: await this.agentModel })
      .populate({ path: 'profil', model: await this.profilModel })
      .lean();
  }

  async update(
    id: string,
    updateUserDto: CreateUserDTO,
  ): Promise<ProfilDocument> {
    return await (await this.profilModel)
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }
}
