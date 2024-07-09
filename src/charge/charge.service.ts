import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ClientSession } from 'mongoose';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { ChargeDocument, ChargeSchema } from 'src/schemas/users/charge.schema';
import { CreateChargeDTO } from 'src/dto/createCharge.dto';

@Injectable()
export class ChargeService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly chargeModel = this.useModel.createModel<ChargeDocument>(
    this.tenantName,
    'Charge',
    ChargeSchema,
  );
  async createWithTransaction(
    session: ClientSession,
    chargeDto: CreateChargeDTO[],
  ) {
    return await (await this.chargeModel).insertMany(chargeDto, { session });
  }
  async create(chargeDto: CreateChargeDTO[]) {
    return await (await this.chargeModel).insertMany(chargeDto);
  }

  async findAll(): Promise<ChargeDocument[]> {
    return await (await this.chargeModel).find({}).exec();
  }

  async findOne(id: string): Promise<ChargeDocument> {
    return await (await this.chargeModel).findById(id).exec();
  }

  async update(
    id: string,
    updateCreateDto: CreateChargeDTO,
  ): Promise<ChargeDocument> {
    return await (await this.chargeModel)
      .findByIdAndUpdate(id, updateCreateDto, { new: true })
      .exec();
  }
}
