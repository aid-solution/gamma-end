import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { ChargeDocument, ChargeSchema } from 'src/schemas/users/charge.schema';
import { CreateChargeDTO } from 'src/dto/createCharge.dto';
import { BulkWriteResult } from 'mongodb';
import { UpdateChargeDTO } from 'src/dto/updateCharge.dto';

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
  private readonly chargeModel = this.useModel.connectModel<ChargeDocument>(
    this.tenantName,
    'Charge',
    ChargeSchema,
  );

  async create(chargeDto: CreateChargeDTO[]) {
    return await (await this.chargeModel).insertMany(chargeDto);
  }

  async findAll(): Promise<ChargeDocument[]> {
    return await (await this.chargeModel).find({}).exec();
  }

  async findByAgent(agent: string): Promise<ChargeDocument[]> {
    return await (await this.chargeModel)
      .find({ agent })
      .sort({ _id: -1 })
      .exec();
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

  async updateByAgent(
    updateChargeDto: UpdateChargeDTO[],
  ): Promise<BulkWriteResult> {
    const bulkOps = updateChargeDto.map((dto) => ({
      updateMany: {
        filter: { _id: dto._id },
        update: { $set: dto },
      },
    }));

    const result = await (await this.chargeModel).bulkWrite(bulkOps);
    return result;
  }
}
