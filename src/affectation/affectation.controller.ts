import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AffectationService } from './affectation.service';
import { CreateAffectationDTO } from 'src/dto/createAffectation.dto';
import { UpdateAffectationDTO } from 'src/dto/updateAffectation.dto';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import { RubriqueService } from 'src/rubrique/rubrique.service';
import { CreateAgentRubriqueDTO } from 'src/dto/createAgentRubrique.dto';
import { formatDate } from 'src/utilities/formatDate';
import { AffectationDocument } from 'src/schemas/users/affectation.schema';

@Controller('affectation')
export class AffectationController {
  constructor(
    private affectationService: AffectationService,
    private readonly agentRubriqueService: AgentRubriqueService,
    private readonly rubriqueService: RubriqueService,
  ) {}

  private listAffectations(affectations: AffectationDocument[]) {
    const response: any[] = [];
    for (const affectation of affectations) {
      const dateFin = affectation.dateFin
        ? formatDate(affectation.dateFin)
        : 'à nos jours';
      response.push({
        matricule: affectation.agent.matricule,
        nomPrenom: `${affectation.agent.nom} ${affectation.agent.prenom}`,
        statut: affectation.statut,
        periode: `${formatDate(affectation.dateDebut)} - ${dateFin}`,
        fonction: affectation.fonction.libelle,
        service:
          affectation.fonction.rattache === 'Service'
            ? affectation.fonction.service.libelle
            : affectation.fonction.direction.libelle,
        grille: affectation.grille.libelle,
        _id: affectation._id,
      });
    }
    return response;
  }

  @Post()
  @HttpCode(201)
  async create(@Body() affectationDto: UpdateAffectationDTO) {
    try {
      const salaireRubrique = await this.rubriqueService.findOneByCode(100);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { salaire, _id, dateFin, ...rest } = affectationDto;
      const rubriqueAgentSalaire = {
        dateDebut: rest.dateDebut,
        agent: rest.agent,
        rubrique: salaireRubrique._id,
        montant: +salaire,
      } as unknown as CreateAgentRubriqueDTO;
      const agentRubrique = await this.agentRubriqueService.create([
        rubriqueAgentSalaire,
      ]);
      const AgentRubriques =
        await this.agentRubriqueService.findAllByAgentAndRubriqueOnGoing(
          rest.agent,
        );
      const agentRubriqueSalaire = AgentRubriques.filter(
        (agentRubrique) => agentRubrique.rubrique.code === 100,
      )[0];
      const udpateRubrique = {
        _id: agentRubriqueSalaire._id,
        dateFin: new Date(),
      } as unknown as UpdateAffectationRubriqueDTO;
      await this.agentRubriqueService.update([udpateRubrique]);

      const latest = (
        await this.affectationService.latestByAgent(rest.agent)
      )[0];
      const updateAffectation = {
        dateFin: new Date(),
        ...latest,
      } as undefined as UpdateAffectationDTO;
      await this.affectationService.update(updateAffectation);

      const datas = {
        ...rest,
        agentRubrique: agentRubrique[0]._id,
      } as unknown as CreateAffectationDTO;
      return await this.affectationService.create(datas);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
    try {
      const affectations = await this.affectationService.findAll();
      return this.listAffectations(affectations);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.affectationService.findOne(id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async update(@Body() updateAffectationDto: UpdateAffectationDTO) {
    const { _id } = updateAffectationDto;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { salaire, ...rest } = updateAffectationDto;
      const datas = rest as unknown as UpdateAffectationDTO;
      const affection =
        await this.affectationService.findOneWithoutPopulate(_id);
      const salaireRubrique = await this.agentRubriqueService.findOne(
        affection.agentRubrique.toString(),
      );
      const updateSalaire = {
        _id: salaireRubrique._id,
        montant: salaire,
        rubrique: salaireRubrique.rubrique,
        agent: salaireRubrique.agent,
        dateDebut: salaireRubrique.dateDebut,
      } as unknown as UpdateAffectationRubriqueDTO;
      await this.agentRubriqueService.update([updateSalaire]);
      return await this.affectationService.update(datas);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get('/agent/:agent')
  async findAllByAgent(@Param('agent') agent: string) {
    try {
      return await this.affectationService.filterByAgent(agent);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
