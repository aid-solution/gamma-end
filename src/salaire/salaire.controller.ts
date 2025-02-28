import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { SalaireService } from './salaire.service';
import { SalaireDTO } from 'src/dto/salaire.dto';
import { ConvertToOriginalTypePipe } from 'src/pipes/convertToOriginalType.pipe';
import { ImprimeDTO } from 'src/dto/imprime.dto';
import { AffectationService } from 'src/affectation/affectation.service';
import { AbsenceService } from 'src/absence/absence.service';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';
import { CongeService } from 'src/conge/conge.service';
import { AvancePretService } from 'src/avance-pret/avance-pret.service';
import { AgentAccountService } from 'src/agent-account/agent-account.service';
import { FonctionRubriqueService } from 'src/fonction-rubrique/fonction-rubrique.service';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';
import { ChargeService } from 'src/charge/charge.service';
import { RubriqueService } from 'src/rubrique/rubrique.service';
import { formatDate, getLastDayOfMonth } from 'src/utilities/formatDate';
import {
  combineAllRubrique,
  rubriqueCombineMontant,
} from 'src/utilities/salaireFunctions';

type Periode = 'Mensuelle' | 'Trimestruelle' | 'Annuelle';

@Controller('salaire')
export class SalaireController {
  constructor(
    private readonly salaireService: SalaireService,
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

  @Post('')
  @HttpCode(201)
  async CreateSalaire() {
    try {
      const response = await this.salaireService.create();
      return response;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get('/last-salary')
  async findLast() {
    try {
      return await this.salaireService.findLast();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.salaireService.findOne(id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
  @Get()
  async findAll() {
    try {
      return await this.salaireService.findAll();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Post('/calcul-salaire')
  @HttpCode(201)
  @UsePipes(ConvertToOriginalTypePipe)
  async CalculSalaire(@Body() salaireDto: SalaireDTO) {
    try {
      const salary = await this.salaireService.findLast();
      const debutMois = new Date(
        Date.UTC(salary.annee, salary.mois - 1, 1, 0, 0, 0),
      );
      const finMois = getLastDayOfMonth(debutMois);
      const initialRubriques =
        await this.rubriqueService.findAllInitialRubrique();

      const absences = await this.absenceService.findByPeriod(
        debutMois,
        finMois,
      );
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
      const directionRubriques =
        await this.directionRubriqueService.findByPeriod(debutMois, finMois);

      const avancePrets = await this.avancePretService.findByPeriod(
        debutMois,
        finMois,
      );

      const charges = await this.chargeService.findByPeriod(debutMois, finMois);
      const agentAccount = await this.agentAccountService.findAll();
      return await this.salaireService.CalculSalaire(
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Post('/generate-document')
  @HttpCode(201)
  async generateDocument(@Body() document: ImprimeDTO) {
    try {
      const start: Record<Periode, number> = {
        Mensuelle: +document.mois,
        Trimestruelle:
          document.mois === '1'
            ? 1
            : document.mois === '2'
              ? 4
              : document.mois === '3'
                ? 7
                : 10,
        Annuelle: 1,
      };
      const end: Record<Periode, number> = {
        Mensuelle: +document.mois,
        Trimestruelle:
          document.mois === '1'
            ? 3
            : document.mois === '2'
              ? 6
              : document.mois === '3'
                ? 9
                : 12,
        Annuelle: 12,
      };
      const salaires = await this.salaireService.salairiesByPeriod(
        start[document.periode],
        end[document.periode],
        +document.annee,
      );
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

        const fonctionRubriques =
          await this.fonctionRubriqueService.findByPeriod(debutMois, finMois);
        const serviceRubriques = await this.serviceRubriqueService.findByPeriod(
          debutMois,
          finMois,
        );
        const directionRubriques =
          await this.directionRubriqueService.findByPeriod(debutMois, finMois);

        const charges = await this.chargeService.findByPeriod(
          debutMois,
          finMois,
        );
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
