import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  TenantAccountDocument,
  TenantAccountSchema,
} from 'src/schemas/users/tenantAccount.schema';
import { CreateTenantAccountDTO } from 'src/dto/createTenantAccount.dto';
import { BanqueDocument, BanqueSchema } from 'src/schemas/users/banque.schema';
import { UpdateTenantAccountDTO } from 'src/dto/updateTenantAccount.dto';

@Injectable()
export class TenantAccountService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly tenantAccountModel =
    this.useModel.createModel<TenantAccountDocument>(
      this.tenantName,
      'TenantAccount',
      TenantAccountSchema,
    );

  private readonly banqueModel = this.useModel.createModel<BanqueDocument>(
    this.tenantName,
    'Banque',
    BanqueSchema,
  );

  async create(
    createTenantAccoutDto: CreateTenantAccountDTO,
  ): Promise<TenantAccountDocument> {
    return await (await this.tenantAccountModel).create(createTenantAccoutDto);
  }

  async findAll(): Promise<TenantAccountDocument[]> {
    return await (
      await this.tenantAccountModel
    )
      .find({})
      .populate({ path: 'banque', model: await this.banqueModel })
      .exec();
  }

  async findOne(id: string): Promise<TenantAccountDocument> {
    return await (await this.tenantAccountModel)
      .findById(id)
      .populate({ path: 'banque', model: await this.banqueModel });
  }

  async update(
    updateAbsenceDto: UpdateTenantAccountDTO,
  ): Promise<TenantAccountDocument> {
    const { _id, ...datas } = updateAbsenceDto;
    const update = (await (await this.tenantAccountModel)
      .findByIdAndUpdate(_id, datas, { new: true })
      .exec()) as unknown as TenantAccountDocument;
    return update;
  }
}
