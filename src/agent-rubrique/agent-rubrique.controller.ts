import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { AgentRubriqueService } from './agent-rubrique.service';
import { AffectationService } from 'src/affectation/affectation.service';
import { FonctionRubriqueService } from 'src/fonction-rubrique/fonction-rubrique.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';
import { formatDate } from 'src/utilities/formatDate';
import { AffectationRubriqueAgentDTO } from 'src/dto/affectationRubriqueAgent.dto';
import { AgentRubrique } from 'src/schemas/users/agentRubrique.schema';
import { AffectationRubriqueDTO } from 'src/dto/affectationRubrique.dto';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import { CreateAgentRubriqueDTO } from 'src/dto/createAgentRubrique.dto';

@Controller('agent-rubrique')
export class AgentRubriqueController {
  constructor(
    private readonly agentRubriqueService: AgentRubriqueService,
    private readonly affectationService: AffectationService,
    private readonly fonctionRubriqueService: FonctionRubriqueService,
    private readonly serviceRubriqueService: ServiceRubriqueService,
    private readonly directionRubriqueService: DirectionRubriqueService,
  ) {}

  private combineRubrique(
    agentRubrique: any[],
    fonction: string,
    fonctionRubrique: any[],
    rattacheA: string,
    rattacheRubrique: any[],
  ) {
    return [
      ...this.rubrique(agentRubrique),
      ...this.rubrique(fonctionRubrique, fonction),
      ...this.rubrique(rattacheRubrique, rattacheA),
    ];
  }

  private rubrique(items: any[], origine: string = '') {
    const result: any[] = [];
    items.map((item) => {
      if (![100, 154, 201].includes(item.rubrique.code)) {
        const dateFin = item.dateFin ? formatDate(item.dateFin) : 'à nos jours';
        result.push({
          _id: item.rubrique._id,
          code: item.rubrique.code,
          libelle: item.rubrique.libelle,
          type: item.rubrique.type,
          origine: origine,
          montant: item.montant,
          periode: `${formatDate(item.dateDebut)} - ${dateFin}`,
        });
      }
    });
    return result;
  }

  private getAllRubriqueAgent(
    oldRubrique: AgentRubrique[],
    rubrique: AffectationRubriqueDTO[],
  ) {
    const affectationRubriqueUpdate: UpdateAffectationRubriqueDTO[] = [];
    const idOfUsedRubrique: string[] = [];
    const filterAllInitialRibruques = oldRubrique.filter(
      (item) => ![100, 154, 201].includes(item.rubrique.code),
    );
    filterAllInitialRibruques.map((old: any) => {
      const filter = rubrique.filter(
        (rub: any) => rub._id === old.rubrique._id.toString(),
      );

      if (!filter.length || (filter[0] && filter[0].montant !== old.montant)) {
        const affectation = {
          _id: old._id,
          dateFin: new Date(),
        } as unknown as UpdateAffectationRubriqueDTO;
        affectationRubriqueUpdate.push(affectation);
      } else if (
        filter[0] &&
        filter[0].montant === old.montant &&
        old.dateFin === undefined
      ) {
        idOfUsedRubrique.push(filter[0]._id);
      }
    });
    return { affectationRubriqueUpdate, idOfUsedRubrique };
  }

  private affectationRubriqueAgent(
    id: string,
    rubrique: AffectationRubriqueDTO[],
    idOfUsedRubrique: string[],
  ) {
    const affectationRubrique: CreateAgentRubriqueDTO[] = [];
    rubrique.map((rub) => {
      if (!idOfUsedRubrique.includes(rub._id)) {
        const affectation = {
          rubrique: rub._id,
          agent: id,
          montant: rub.montant,
        } as unknown as CreateAgentRubriqueDTO;
        affectationRubrique.push(affectation);
      }
    });
    return affectationRubrique;
  }

  @Get(':agent')
  async findOne(@Param('agent') agent: string) {
    try {
      const latestAffectation = (
        await this.affectationService.latestByAgentWithPopulate(agent)
      )[0];
      const fonction = latestAffectation.fonction as unknown as {
        _id: string;
        libelle: string;
      };
      const fonctionRubrique =
        await this.fonctionRubriqueService.findAllByFonction(fonction._id);
      const rattacheA = (latestAffectation.fonction.rattache === 'Service'
        ? latestAffectation.fonction.service
        : latestAffectation.fonction.direction) as unknown as {
        _id: string;
        libelle: string;
      };
      const rattacheRubrique =
        latestAffectation.fonction.rattache === 'Service'
          ? await this.serviceRubriqueService.findAllByServiceAndRubriqueOnGoing(
              rattacheA._id,
            )
          : await this.directionRubriqueService.findAllByDirectionAndRubriqueOnGoing(
              rattacheA._id,
            );
      const agentRubrique = await this.agentRubriqueService.findAllAgent(agent);
      const result = this.combineRubrique(
        agentRubrique,
        fonction.libelle,
        fonctionRubrique,
        rattacheA.libelle,
        rattacheRubrique,
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Post()
  async affectationRubrique(
    @Body() affectationRubriqueAgent: AffectationRubriqueAgentDTO,
  ) {
    try {
      const { agent, rubrique } = affectationRubriqueAgent;
      const oneGoing =
        await this.agentRubriqueService.findAllByAgentAndRubriqueOnGoing(agent);
      const { affectationRubriqueUpdate: update, idOfUsedRubrique } =
        this.getAllRubriqueAgent(oneGoing, rubrique);
      const create = this.affectationRubriqueAgent(
        agent,
        rubrique,
        idOfUsedRubrique,
      );

      if (update.length > 0) await this.agentRubriqueService.update(update);
      return await this.agentRubriqueService.create(create);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
