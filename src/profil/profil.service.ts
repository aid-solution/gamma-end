import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { ProfilDocument, ProfilSchema } from 'src/schemas/users/profil.schema';
import { CreateProfilDTO } from 'src/dto/createProfil.dto';

@Injectable()
export class ProfilService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}

  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly profilModel = this.useModel.connectModel<ProfilDocument>(
    this.tenantName,
    'Profil',
    ProfilSchema,
  );

  async create(createProfil: CreateProfilDTO): Promise<ProfilDocument> {
    return await (await this.profilModel).create(createProfil);
  }

  async findAll(): Promise<ProfilDocument[]> {
    return await (
      await this.profilModel
    )
      .find({ libelle: { $ne: 'admin' } })
      .sort({ _id: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ProfilDocument> {
    return await (await this.profilModel).findById(id).exec();
  }

  async researchDuplicate(search: string): Promise<ProfilDocument> {
    return await (await this.profilModel).findOne({ libelle: search }).exec();
  }

  async update(
    id: string,
    updateProfilDto: CreateProfilDTO,
  ): Promise<ProfilDocument> {
    return await (await this.profilModel)
      .findByIdAndUpdate(id, updateProfilDto, { new: true })
      .exec();
  }
}
