import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { BanqueDocument, BanqueSchema } from 'src/schemas/users/banque.schema';
import { CreateBanqueDTO } from 'src/dto/createBanque.dto';

@Injectable()
export class BanqueService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly banqueModel = this.useModel.createModel<BanqueDocument>(
    this.tenantName,
    'Banque',
    BanqueSchema,
  );

  async create(createBanqueDto: CreateBanqueDTO): Promise<BanqueDocument> {
    return await (await this.banqueModel).create(createBanqueDto);
  }

  async findAll(): Promise<BanqueDocument[]> {
    return await (await this.banqueModel).find({}).exec();
  }

  async findOne(id: string): Promise<BanqueDocument> {
    return await (await this.banqueModel).findById(id).exec();
  }

  async update(
    id: string,
    updateBanqueDto: CreateBanqueDTO,
  ): Promise<BanqueDocument> {
    return await (await this.banqueModel)
      .findByIdAndUpdate(id, updateBanqueDto, { new: true })
      .exec();
  }
}
