import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UseModel } from '../providers/useModel.service';
import { AgentDocument, AgentSchema } from '../schemas/users/agent.schema';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AffectationService } from '../affectation/affectation.service';
import { ChargeService } from '../charge/charge.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { AgentDTO } from 'src/dto/agent.dto';
import { CreateAffectationDTO } from 'src/dto/createAffectation.dto';
import { formatDate } from 'src/utilities/formatDate';
import { AgentAccountService } from 'src/agent-account/agent-account.service';
import { CreateAgentAccountDTO } from 'src/dto/createAgentAccout.dto';
import { ObjectId } from 'mongodb';
import { UpdateAgentDTO } from 'src/dto/updateAgent.dto';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';
import { RubriqueService } from 'src/rubrique/rubrique.service';
import { CreateAgentRubriqueDTO } from 'src/dto/createAgentRubrique.dto';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import { UpdateAffectationDTO } from 'src/dto/updateAffectation.dto';
import { CongeService } from 'src/conge/conge.service';

@Injectable()
export class AgentService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
    private readonly affectationService: AffectationService,
    private readonly congeService: CongeService,
    private readonly agentAccountService: AgentAccountService,
    private readonly chargeService: ChargeService,
    private readonly agentRubriqueService: AgentRubriqueService,
    private readonly rubriqueService: RubriqueService,
  ) {}

  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );

  private readonly agentModel = this.useModel.connectModel<AgentDocument>(
    this.tenantName,
    'Agent',
    AgentSchema,
  );

  private positionAgent = (affectation: any, conge: any): string => {
    const today = new Date();
    if (
      affectation.dateFin &&
      today >= affectation.dateDebut &&
      today <= affectation.dateFin
    ) {
      return 'En fin de contrat';
    } else {
      if (conge && today >= conge.dateDebut && today <= conge.dateFin) {
        return 'En congé';
      }
    }
    return 'En activité';
  };

  private listAgents(agents: any[], affectations: any[], conges: any[]) {
    const response: any[] = [];
    for (const agent of agents) {
      const affectation = affectations.find(
        (affecter) => affecter.agent._id.toString() === agent._id.toString(),
      ).fonction;
      const conge = conges.find(
        (conge) => conge.agent._id.toString() === agent._id.toString(),
      );
      response.push({
        matricule: agent.matricule,
        nomPrenom: `${agent.nom} ${agent.prenom}`,
        fonction: affectation.libelle,
        service: affectation.service
          ? affectation.service.libelle
          : affectation.direction.libelle,
        dateEmbauche: formatDate(agent.dateEmbauche),
        position: this.positionAgent(affectation, conge),
        _id: agent._id,
      });
    }
    return response;
  }

  async create(agentDto: AgentDTO) {
    try {
      const {
        affectation: affectationData,
        charges: chargeData,
        agentAccount,
        ...createAgentDto
      } = agentDto;

      const agent = (await (await this.agentModel).create([createAgentDto]))[0];

      const salaireRubrique = await this.rubriqueService.findOneByCode(100);
      const { salaire, ...rest } = affectationData;
      const rubriqueAgentSalaire = {
        dateDebut: agent.dateEmbauche,
        agent: agent._id,
        rubrique: salaireRubrique._id,
        montant: +salaire,
      } as unknown as CreateAgentRubriqueDTO;

      const agentRubrique = await this.agentRubriqueService.create([
        rubriqueAgentSalaire,
      ]);

      const createAffectationDto: CreateAffectationDTO = {
        statut: 'Recrutement',
        agentRubrique: agentRubrique[0]._id,
        agent: agent._id,
        dateDebut: agent.dateEmbauche,
        ...rest,
      };
      await this.affectationService.create(createAffectationDto);

      const createAccountDto: CreateAgentAccountDTO = {
        agent: agent._id,
        banque: new ObjectId(agentAccount.banque),
        compte: agentAccount.compte,
      };
      await this.agentAccountService.create(createAccountDto);

      const chargeDocs = chargeData.map((data: any) => ({
        ...data,
        agent: agent._id,
      }));
      await this.chargeService.create(chargeDocs);

      return { _id: agent._id, ...agentDto };
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'An error occured while creating the agent',
      );
    }
  }

  async findAll(): Promise<AgentDocument[]> {
    const agents = await (await this.agentModel)
      .find({})
      .select({ _id: 1, matricule: 1, nom: 1, prenom: 1, dateEmbauche: 1 })
      .sort({ _id: -1 });
    const affectations: any[] = await this.affectationService.findAll();
    const conges: any[] = await this.congeService.findAll();
    return this.listAgents(agents, affectations, conges);
  }

  async findOne(id: string): Promise<any> {
    try {
      const agentFound = await (await this.agentModel).findById(id);
      if (!agentFound) return 'Aucun agent trouver';
      const agent = agentFound._id.toString();
      const agentAffectations: any[] =
        await this.affectationService.findByAgent(agent);

      const AgentRubriques =
        await this.agentRubriqueService.findAllByAgentAndRubriqueOnGoing(id);

      const agentRubriqueSalaire = AgentRubriques.filter(
        (agentRubrique) => agentRubrique.rubrique.code === 100,
      )[0];
      const affectation = {
        statut: agentAffectations[0].statut,
        fonction: agentAffectations[0].fonction.libelle,
        dateDebut: agentAffectations[0].dateDebut,
        grille: agentAffectations[0].grille.libelle,
        salaire: agentRubriqueSalaire ? `${agentRubriqueSalaire.montant}` : '0',
      };

      const account = await this.agentAccountService.findByAgent(agent);
      const agentAccount = {
        banque: account[0] ? account[0].banque.libelle : '',
        compte: account[0] ? account[0].compte.toString() : '',
      };

      const chargesAgent = await this.chargeService.findByAgent(agent);
      const charges: any[] = [];
      chargesAgent.map((chargeAgent) => {
        const charge = {
          _id: chargeAgent._id,
          type: chargeAgent.type,
          nomPrenom: chargeAgent.nomPrenom,
          lieuNaissance: chargeAgent.lieuNaissance,
          sexe: chargeAgent.sexe,
          dateNaissance: formatDate(chargeAgent.dateNaissance, '/'),
          handicap:
            chargeAgent.handicap === undefined
              ? ''
              : chargeAgent.handicap
                ? 'Oui'
                : 'Non',
          scolarite:
            chargeAgent.scolarite === undefined
              ? ''
              : chargeAgent.scolarite
                ? 'Oui'
                : 'Non',
          assujetiCNSS:
            chargeAgent.assujetiCNSS === undefined
              ? ''
              : chargeAgent.assujetiCNSS
                ? 'Oui'
                : 'Non',
        };
        charges.push(charge);
      });

      return {
        _id: agentFound._id,
        expatrie: agentFound.expatrie || false,
        nom: agentFound.nom,
        prenom: agentFound.prenom,
        dateNaissance: formatDate(agentFound.dateNaissance, '/'),
        lieuNaissance: agentFound.lieuNaissance,
        sexe: agentFound.sexe,
        pays: agentFound.pays,
        situationMatrimoniale: agentFound.situationMatrimoniale,
        telephone: agentFound.telephone,
        email: agentFound.email,
        diplome: agentFound.diplome,
        cotisation: agentFound.cotisation,
        cotisationNumero: agentFound.cotisationNumero,
        contrat: agentFound.contrat,
        matricule: agentFound.matricule,
        dateEmbauche: formatDate(agentFound.dateEmbauche, '/'),
        modePaiement: agentFound.modePaiement,
        affectation,
        agentAccount,
        charges,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'An error occured while creating the agent',
      );
    }
  }

  async researchDuplicate(data: string) {
    const agent = await (
      await this.agentModel
    )
      .findOne({
        $or: [
          { matricule: data },
          { telephone: data },
          { email: data },
          { cotisationNumero: data },
        ],
      })
      .select({
        nom: 1,
        prenom: 1,
        matricule: 1,
        telephone: 1,
        email: 1,
        cotisationNumero: 1,
      });
    return agent;
  }

  async update(id: string, updateAgentDto: UpdateAgentDTO) {
    const {
      affectation: affectationData,
      charges: chargeData,
      agentAccount,
      ...updateAgent
    } = updateAgentDto;
    try {
      const agentUpdated = await (
        await this.agentModel
      ).findByIdAndUpdate(id, updateAgent, { new: true });

      const latest = (await this.affectationService.latestByAgent(id))[0];

      const AgentRubriques =
        await this.agentRubriqueService.findAllByAgentAndRubriqueOnGoing(id);

      const agentRubriqueSalaire = AgentRubriques.filter(
        (agentRubrique) => agentRubrique.rubrique.code === 100,
      )[0];
      const agentRubrique: any[] = [];
      const { salaire, ...rest } = affectationData;
      if (agentRubriqueSalaire && agentRubriqueSalaire.montant !== +salaire) {
        agentRubriqueSalaire.montant = +salaire;
        const udpate = {
          _id: agentRubriqueSalaire._id,
          dateFin: new Date(),
        } as unknown as UpdateAffectationRubriqueDTO;
        await this.agentRubriqueService.update([udpate]);
      }

      if (
        !agentRubriqueSalaire ||
        (agentRubriqueSalaire && agentRubriqueSalaire.montant !== +salaire)
      ) {
        const salaireRubrique = await this.rubriqueService.findOneByCode(100);
        const rubriqueAgentSalaire = {
          dateDebut: agentUpdated.dateEmbauche,
          agent: agentUpdated._id,
          rubrique: salaireRubrique._id,
          montant: +salaire,
        } as unknown as CreateAgentRubriqueDTO;

        const createdAgentRubrique = await this.agentRubriqueService.create([
          rubriqueAgentSalaire,
        ]);
        agentRubrique.push(...createdAgentRubrique);
      }

      const salaireRubrique = agentRubriqueSalaire
        ? agentRubriqueSalaire._id.toString()
        : agentRubrique[0]._id.toString();
      if (
        latest.fonction.toString() !== affectationData.fonction ||
        latest.grille.toString() !== affectationData.grille ||
        String(latest.agentRubrique) !== salaireRubrique
      ) {
        const createAffectationDto: CreateAffectationDTO = {
          agent: new ObjectId(id),
          agentRubrique: salaireRubrique,
          ...rest,
        };
        const update = {
          dateFin: new Date(),
          ...latest,
        } as undefined as UpdateAffectationDTO;
        await this.affectationService.update(update);
        await this.affectationService.create(createAffectationDto);
      }

      const account = await this.agentAccountService.findByAgent(id);
      const accountDto = {
        agent: new ObjectId(id),
        banque: new ObjectId(agentAccount.banque),
        compte: agentAccount.compte,
      };
      if (account[0]) {
        await this.agentAccountService.updateByAgent(id, accountDto);
      } else {
        await this.agentAccountService.create(accountDto);
      }
      const chargeDocs = chargeData.map((data: any) => ({
        ...data,
        agent: new ObjectId(id),
      }));

      const chargeWithEmptyId = chargeDocs.filter(
        (charge) => charge._id === undefined || charge._id === '',
      );

      const chargeWithIdIsNoEmpty = chargeDocs.filter(
        (charge) => charge._id !== '',
      );

      if (chargeWithEmptyId.length > 0)
        await this.chargeService.create(chargeWithEmptyId);

      if (chargeWithIdIsNoEmpty.length > 0)
        await this.chargeService.updateByAgent(chargeWithIdIsNoEmpty);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'An error occured while updating the agent',
      );
    }
    return updateAgentDto;
  }
}
