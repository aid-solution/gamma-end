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
import { AgentDocument, AgentSchema } from 'src/schemas/users/agent.schema';
import {
  MotifAbsenceDocument,
  MotifAbsenceSchema,
} from 'src/schemas/users/motifAbsence.schema';

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

  private readonly agentModel = this.useModel.createModel<AgentDocument>(
    this.tenantName,
    'Agent',
    AgentSchema,
  );

  private readonly motifAbsenceModel =
    this.useModel.createModel<MotifAbsenceDocument>(
      this.tenantName,
      'MotifAbsence',
      MotifAbsenceSchema,
    );

  async create(absenceDto: CreateAbsenceDTO) {
    return await (await this.absenceModel).create(absenceDto);
  }

  async findAllAbsencesExptionnelle(
    agent: string,
    startYear: Date,
    endYear: Date,
  ): Promise<any[]> {
    return await (
      await this.absenceModel
    )
      .find({
        agent: agent,
        dateDebut: { $gte: startYear, $lte: endYear },
        type: 'Exceptionnelle',
      })
      .exec();
  }

  async findAll() {
    const absences: any[] = await (
      await this.absenceModel
    )
      .find({})
      .populate({ path: 'motif', model: await this.motifAbsenceModel })
      .populate({ path: 'agent', model: await this.agentModel })
      .sort({ _id: -1 });
    const result: any[] = [];
    absences.map((absence) => {
      const data = {
        matricule: absence.agent.matricule,
        nomPrenom: `${absence.agent.nom} ${absence.agent.prenom}`,
        motif: absence.motif.libelle,
        periode: `${formatDate(absence.dateDebut)} - ${formatDate(absence.dateFin)}`,
        jours: differenceBetweenDates(absence.dateDebut, absence.dateFin),
        deduction: absence.deduction ? 'Oui' : 'Non',
        /* type: absence.type,
        nature: absence.nature, */
        _id: absence._id,
      };
      result.push(data);
    });

    return result;
  }

  async findOne(id: string): Promise<AbsenceDocument> {
    const absence: any = await (await this.absenceModel)
      .findById(id)
      .populate({ path: 'motif', model: await this.motifAbsenceModel });
    const data = {
      agent: absence.agent,
      motif: absence.motif.libelle,
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

  async findByPeriod(
    debutMois: Date,
    finMois: Date,
  ): Promise<AbsenceDocument[]> {
    return await (
      await this.absenceModel
    ).find({
      $and: [
        { deduction: true },
        { type: 'Non Exceptionnelle' },
        {
          $or: [
            {
              dateDebut: { $gte: debutMois },
              dateFin: { $lte: finMois },
            },
            {
              dateDebut: { $lte: debutMois },
              dateFin: { $gte: finMois },
            },
            {
              dateDebut: { $lte: debutMois },
              dateFin: { $gte: debutMois },
            },
            {
              dateDebut: { $lte: debutMois },
              dateFin: { $lte: debutMois },
            },
            {
              dateDebut: { $lte: finMois, $gte: debutMois },
              dateFin: { $gte: debutMois },
            },
            {
              dateDebut: { $lte: finMois, $gte: debutMois },
              dateFin: { $exists: false },
            },
            {
              dateDebut: { $lte: debutMois },
              dateFin: { $exists: false },
            },
          ],
        },
      ],
    });
  }

  async filterByAgent(agent: string): Promise<AbsenceDocument[]> {
    const absences: any[] = await (await this.absenceModel)
      .find({ agent })
      .populate({ path: 'motif', model: await this.motifAbsenceModel });
    const listAbsence: AbsenceDocument[] = [];
    absences.map((absence) => {
      const data = {
        motif: absence.motif.libelle,
        dateDebut: formatDate(absence.dateDebut),
        dateFin: formatDate(absence.dateFin),
        jours: differenceBetweenDates(absence.dateDebut, absence.dateFin),
        type: absence.type,
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
