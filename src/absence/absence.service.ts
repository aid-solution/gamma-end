import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  AbsenceSchema,
  AbsenceDocument,
} from 'src/schemas/users/absence.schema';
import { CreateAbsenceDTO } from 'src/dto/createAbsence.dto';
import { differenceBetweenDates, formatDate } from 'src/utilities/formatDate';
import { UpdateAbsenceDTO } from 'src/dto/updateAbsence.dto';

@Injectable()
export class AbsenceService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );

  private readonly absenceModel = this.useModel.createModel(
    this.tenantName,
    'Absence',
    AbsenceSchema,
  );

  async create(absenceDto: CreateAbsenceDTO) {
    return await (await this.absenceModel).create(absenceDto);
  }

  async findOne(id: string): Promise<AbsenceDocument> {
    const absence: AbsenceDocument = await (
      await this.absenceModel
    ).findById(id);
    const data = {
      motif: absence.motif,
      dateDebut: formatDate(absence.dateDebut, '/'),
      dateFin: formatDate(absence.dateFin, '/'),
      type: absence.type,
      nature: absence.nature,
      jours: differenceBetweenDates(absence.dateDebut, absence.dateFin),
      deduction: absence.deduction ? 'Oui' : 'Non',
      _id: absence._id,
    } as unknown as AbsenceDocument;
    return data;
  }

  async filterByAgent(agent: string): Promise<AbsenceDocument[]> {
    const absences: AbsenceDocument[] = await (
      await this.absenceModel
    ).find({ agent });
    const listAbsence: AbsenceDocument[] = [];
    absences.map((absence) => {
      const data = {
        motif: absence.motif,
        dateDebut: formatDate(absence.dateDebut),
        dateFin: formatDate(absence.dateFin),
        jours: differenceBetweenDates(absence.dateDebut, absence.dateFin),
        type: absence.type,
        nature: absence.nature,
        deduction: absence.deduction ? 'Oui' : 'Non',
        _id: absence._id,
      } as unknown as AbsenceDocument;
      listAbsence.push(data);
    });
    return listAbsence;
  }

  async update(updateAbsenceDto: UpdateAbsenceDTO): Promise<AbsenceDocument> {
    const { _id, ...datas } = updateAbsenceDto;
    const update = (await (await this.absenceModel)
      .findByIdAndUpdate(_id, datas, { new: true })
      .exec()) as unknown as AbsenceDocument;
    return update;
  }
}
