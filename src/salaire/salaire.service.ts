import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  SalaireDocument,
  SalaireSchema,
} from 'src/schemas/users/salaire.schema';
import { CreateSalaireDTO } from 'src/dto/createSalaire.dto';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';
import { combineAllRubriqueAgent } from 'src/utilities/salaireFunctions';
import { formatDate } from 'src/utilities/formatDate';
import { CreateAgentRubriqueDTO } from 'src/dto/createAgentRubrique.dto';
import { UpdateSalaireDTO } from 'src/dto/updateSalaire.dto';
import { UpdateAgentRubriqueDTO } from 'src/dto/updateAgentRubrique.dto';
import { AgentAccountDocument } from 'src/schemas/users/agentAcount.schema';
import { AbsenceDocument } from 'src/schemas/users/absence.schema';
import { AgentRubriqueDocument } from 'src/schemas/users/agentRubrique.schema';
import { ChargeDocument } from 'src/schemas/users/charge.schema';
import { CongeDocument } from 'src/schemas/users/conge.schema';
import { DirectionRubriqueDocument } from 'src/schemas/users/directionRubrique.schema';
import { FonctionRubriqueDocument } from 'src/schemas/users/fonctionRubrique.schema';
import { RubriqueDocument } from 'src/schemas/users/rubrique.schema';
import { ServiceRubriqueDocument } from 'src/schemas/users/serviceRubrique.schema';

@Injectable()
export class SalaireService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
    private readonly agentRubriqueService: AgentRubriqueService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly salaireModel = this.useModel.connectModel<SalaireDocument>(
    this.tenantName,
    'Salaire',
    SalaireSchema,
  );

  async create(): Promise<SalaireDocument | string> {
    const lastSalary = await this.findLast();
    let createSalaireDto: CreateSalaireDTO;

    if (lastSalary) {
      if (!lastSalary.isRemunerated) {
        return 'salaire_is_not_remunerate';
      }
      createSalaireDto = {
        mois: lastSalary.mois !== 12 ? lastSalary.mois + 1 : 1,
        annee: lastSalary.mois !== 12 ? lastSalary.annee : lastSalary.annee + 1,
      };

      lastSalary.isClose = true;
      await this.update(lastSalary);
    } else {
      const today = new Date();
      createSalaireDto = {
        mois: today.getMonth() + 1,
        annee: today.getFullYear(),
      };
    }

    return await (await this.salaireModel).create(createSalaireDto);
  }

  async findLast(): Promise<SalaireDocument> {
    const lastSalary: SalaireDocument[] = await (await this.salaireModel)
      .find({})
      .sort({ annee: -1, mois: -1 })
      .limit(1)
      .exec();
    return lastSalary[0];
  }

  async findOne(id: string): Promise<SalaireDocument> {
    return await (await this.salaireModel).findById(id).exec();
  }

  async findAll(): Promise<SalaireDocument[]> {
    return await (await this.salaireModel).find({}).sort({ _id: -1 }).exec();
  }

  async CalculSalaire(
    salary: SalaireDocument,
    initialRubriques: RubriqueDocument[],
    affectations: any[],
    agentRubriques: AgentRubriqueDocument[],
    fonctionRubriques: FonctionRubriqueDocument[],
    serviceRubriques: ServiceRubriqueDocument[],
    directionRubriques: DirectionRubriqueDocument[],
    avancePrets: any[],
    charges: ChargeDocument[],
    agentAccount: AgentAccountDocument[],
    absences: AbsenceDocument[],
    conges: CongeDocument[],
  ) {
    const copy = [...agentRubriques];
    const agentAllRubrique = combineAllRubriqueAgent(
      salary,
      initialRubriques,
      affectations,
      agentRubriques,
      fonctionRubriques,
      serviceRubriques,
      directionRubriques,
      avancePrets,
      charges,
      agentAccount,
      absences,
      conges,
    );

    const newAgentRubriques: CreateAgentRubriqueDTO[] = [];
    const updateAgentRubriques: UpdateAgentRubriqueDTO[] = [];
    for (let index = 0; index < agentRubriques.length; index++) {
      if (index < copy.length) {
        const element = agentRubriques[
          index
        ] as unknown as UpdateAgentRubriqueDTO;
        updateAgentRubriques.push(element);
      } else {
        const element = agentRubriques[
          index
        ] as unknown as CreateAgentRubriqueDTO;
        element.rubrique = element.rubrique._id;
        newAgentRubriques.push(element);
      }
    }

    if (updateAgentRubriques.length > 0) {
      await this.agentRubriqueService.updateAll(updateAgentRubriques);
    }
    if (newAgentRubriques.length > 0) {
      await this.agentRubriqueService.create(newAgentRubriques);
    }

    salary.isRemunerated = true;
    await this.update(salary);

    return {
      datas: agentAllRubrique,
      datePaie: formatDate(salary.datePaie),
    };
  }

  async salairiesByPeriod(start: number, end: number, annee: number) {
    return await (
      await this.salaireModel
    )
      .find({
        $and: [
          {
            mois: { $gte: start, $lte: end },
          },
          { annee: annee },
        ],
      })
      .exec();
  }

  async update(updateSalaireDto: UpdateSalaireDTO): Promise<SalaireDocument> {
    const { _id, ...datas } = updateSalaireDto;
    const update = (await (await this.salaireModel)
      .findByIdAndUpdate(_id, datas, { new: true })
      .exec()) as unknown as SalaireDocument;
    return update;
  }
}
