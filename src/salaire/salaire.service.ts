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
import { AffectationService } from 'src/affectation/affectation.service';
import { AbsenceService } from 'src/absence/absence.service';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';
import { CongeService } from 'src/conge/conge.service';
import { AvancePretService } from 'src/avance-pret/avance-pret.service';
import { AgentAccountService } from 'src/agent-account/agent-account.service';
import { FonctionRubriqueService } from 'src/fonction-rubrique/fonction-rubrique.service';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';
import {
  combineAllRubriqueAgent,
  combineAllRubrique,
  rubriqueCombineMontant,
} from 'src/utilities/salaireFunctions';
import { ChargeService } from 'src/charge/charge.service';
import { formatDate, getLastDayOfMonth } from 'src/utilities/formatDate';
import { RubriqueService } from 'src/rubrique/rubrique.service';
import { CreateAgentRubriqueDTO } from 'src/dto/createAgentRubrique.dto';
import { ImprimeDTO } from 'src/dto/imprime.dto';
import { SalaireDTO } from 'src/dto/salaire.dto';

type Periode = 'Mensuelle' | 'Trimestruelle' | 'Annuelle';

@Injectable()
export class SalaireService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
    private readonly affectationService: AffectationService,
    private readonly absenceService: AbsenceService,
    private readonly congeService: CongeService,
    private readonly agentRubriqueService: AgentRubriqueService,
    private readonly fonctionRubriqueService: FonctionRubriqueService,
    private readonly serviceRubriqueService: ServiceRubriqueService,
    private readonly directionRubriqueService: DirectionRubriqueService,
    private readonly avancePretService: AvancePretService,
    private readonly chargeService: ChargeService,
    private readonly agentAccountService: AgentAccountService,
    private readonly rubriqueService: RubriqueService,
  ) {}
  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );
  private readonly salaireModel = this.useModel.createModel<SalaireDocument>(
    this.tenantName,
    'Salaire',
    SalaireSchema,
  );

  async create(createSalaireDto: CreateSalaireDTO): Promise<SalaireDocument> {
    return await (await this.salaireModel).create(createSalaireDto);
  }

  async find(salaireDto: SalaireDTO) {
    const mois = +salaireDto.mois;
    const annee = +salaireDto.annee;
    const salaire = await (
      await this.salaireModel
    )
      .findOne({
        $and: [{ mois: mois }, { annee: annee }],
      })
      .exec();
    let createdSalary: SalaireDocument;
    if (!salaire) {
      createdSalary = await this.create({ mois, annee });
    }

    const salary = salaire ? salaire : createdSalary;
    const debutMois = new Date(
      Date.UTC(salary.annee, salary.mois - 1, 1, 0, 0, 0),
    );
    const finMois = getLastDayOfMonth(debutMois);

    const initialRubriques =
      await this.rubriqueService.findAllInitialRubrique();

    const absences = await this.absenceService.findByPeriod(debutMois, finMois);

    const conges = await this.congeService.findByPeriod(debutMois, finMois);

    const findAllAffection = await this.affectationService.findByPeriod(
      debutMois,
      finMois,
    );

    const affectations = !salaireDto.service
      ? findAllAffection
      : findAllAffection.filter(
          (affect) =>
            (affect.fonction.service &&
              affect.fonction.service.libelle === salaireDto.service) ||
            (affect.fonction.direction &&
              affect.fonction.direction.libelle === salaireDto.service),
        );

    const agentRubriques = await this.agentRubriqueService.findByPeriod(
      debutMois,
      finMois,
    );

    const fonctionRubriques = await this.fonctionRubriqueService.findByPeriod(
      debutMois,
      finMois,
    );
    const serviceRubriques = await this.serviceRubriqueService.findByPeriod(
      debutMois,
      finMois,
    );
    const directionRubriques = await this.directionRubriqueService.findByPeriod(
      debutMois,
      finMois,
    );

    const avancePrets = await this.avancePretService.findByPeriod(
      debutMois,
      finMois,
    );

    const charges = await this.chargeService.findAll();
    const agentAccount = await this.agentAccountService.findAll();

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

    const changeTypeOfRubriqueAgent = [
      ...agentRubriques,
    ] as unknown as CreateAgentRubriqueDTO[];

    const newAgentRubriques: CreateAgentRubriqueDTO[] = [];
    for (
      let index = copy.length;
      index < changeTypeOfRubriqueAgent.length;
      index++
    ) {
      const element = changeTypeOfRubriqueAgent[index];
      element.rubrique = element.rubrique._id;
      newAgentRubriques.push(element);
    }

    if (newAgentRubriques.length > 0)
      await this.agentRubriqueService.create(newAgentRubriques);

    return {
      datas: agentAllRubrique,
      datePaie: formatDate(salary.datePaie),
    };
  }

  async imprime(params: ImprimeDTO) {
    const start: Record<Periode, number> = {
      Mensuelle: +params.mois,
      Trimestruelle:
        params.mois === '1'
          ? 1
          : params.mois === '2'
            ? 4
            : params.mois === '3'
              ? 7
              : 10,
      Annuelle: 1,
    };
    const end: Record<Periode, number> = {
      Mensuelle: +params.mois,
      Trimestruelle:
        params.mois === '1'
          ? 3
          : params.mois === '2'
            ? 6
            : params.mois === '3'
              ? 9
              : 12,
      Annuelle: 12,
    };

    const salaires = await (
      await this.salaireModel
    )
      .find({
        $and: [
          {
            mois: { $gte: start[params.periode], $lte: end[params.periode] },
          },
          { annee: +params.annee },
        ],
      })
      .exec();
    const agentsAllRubrique: any[] = [];

    for (const salaire of salaires) {
      const debutMois = new Date(
        Date.UTC(salaire.annee, salaire.mois - 1, 1, 0, 0, 0),
      );
      const finMois = getLastDayOfMonth(debutMois);
      const absences = await this.absenceService.findByPeriod(
        debutMois,
        finMois,
      );
      const conges = await this.congeService.findByPeriod(debutMois, finMois);

      const affectations = await this.affectationService.findByPeriod(
        debutMois,
        finMois,
      );

      const agentRubriques = await this.agentRubriqueService.findByPeriod(
        debutMois,
        finMois,
      );

      const fonctionRubriques = await this.fonctionRubriqueService.findByPeriod(
        debutMois,
        finMois,
      );
      const serviceRubriques = await this.serviceRubriqueService.findByPeriod(
        debutMois,
        finMois,
      );
      const directionRubriques =
        await this.directionRubriqueService.findByPeriod(debutMois, finMois);

      const charges = await this.chargeService.findAll();
      const agentAccount = await this.agentAccountService.findAll();

      const results = combineAllRubrique(
        debutMois,
        finMois,
        affectations,
        agentRubriques,
        fonctionRubriques,
        serviceRubriques,
        directionRubriques,
        charges,
        agentAccount,
        absences,
        conges,
      );
      for (const result of results) {
        const findIndex = agentsAllRubrique.findIndex(
          (agent) => agent.matricule === result.matricule,
        );
        if (findIndex !== -1) {
          agentsAllRubrique[findIndex].brut += result.brut;
          agentsAllRubrique[findIndex].imposable += result.imposable;
          agentsAllRubrique[findIndex].net += result.net;
          agentsAllRubrique[findIndex].gains = rubriqueCombineMontant(
            agentsAllRubrique[findIndex].gains,
            result.gains,
          );
          agentsAllRubrique[findIndex].retenues = rubriqueCombineMontant(
            agentsAllRubrique[findIndex].retenues,
            result.retenues,
          );
        } else agentsAllRubrique.push(result);
      }
    }

    return {
      datas: agentsAllRubrique,
      datePaie: salaires[0] ? formatDate(salaires[0].datePaie) : '',
    };
  }
}
