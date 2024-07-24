import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UseModel } from '../providers/useModel.service';
import { AgentDocument, AgentSchema } from '../schemas/users/agent.schema';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { ClientSession } from 'mongoose';
import { AffectationService } from '../affectation/affectation.service';
import { ChargeService } from '../charge/charge.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import { AgentDTO } from 'src/dto/agent.dto';
import { CreateAffectationDTO } from 'src/dto/createAffectation.dto';
import { CreateAgentDTO } from 'src/dto/createAgent.dto';
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

@Injectable()
export class AgentService {
  constructor(
    private readonly useModel: UseModel,
    @Inject(REQUEST) private readonly request: Request,
    private managerDbService: ManagerDbService,
    private readonly affectationService: AffectationService,
    private readonly agentAccountService: AgentAccountService,
    private readonly chargeService: ChargeService,
    private readonly agentRubriqueService: AgentRubriqueService,
    private readonly rubriqueService: RubriqueService,
  ) {}

  private readonly tenantName = this.managerDbService.getTenantDbName(
    getTenantName(this.request),
  );

  private readonly agentModel = this.useModel.createModel<AgentDocument>(
    this.tenantName,
    'Agent',
    AgentSchema,
  );

  private async agentTransaction(
    session: ClientSession,
    agentDto: CreateAgentDTO,
  ) {
    return await (
      await this.agentModel
    ).create([agentDto], {
      session,
    });
  }

  private listAgents(agents: any[], affectations: any[]) {
    const response: any[] = [];
    for (const agent of agents) {
      const affectation = affectations.filter(
        (affecter) => affecter.agent._id.toString() === agent._id.toString(),
      )[0].fonction;
      response.push({
        matricule: agent.matricule,
        nomPrenom: `${agent.nom} ${agent.prenom}`,
        fonction: affectation.libelle,
        service: affectation.service
          ? affectation.service.libelle
          : affectation.direction.libelle,
        dateEmbauche: formatDate(agent.dateEmbauche),
        position: 'En activité',
        _id: agent._id,
      });
    }
    return response;
  }

  async createWithTransaction(agentDto: AgentDTO) {
    const session = await (await this.agentModel).startSession();
    try {
      session.startTransaction();
      const {
        affectation: affectationData,
        charges: chargeData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        agentAccount,
        ...createAgentDto
      } = agentDto;

      const agent = (
        await this.agentTransaction(session, createAgentDto)
      )[0] as AgentDocument;

      // Create the affectation document with the session
      const createAffectationDto: CreateAffectationDTO = {
        statut: 'Recruitement',
        agentRubrique: new ObjectId(''),
        agent: agent._id,
        ...affectationData,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const affectation = await this.affectationService.createWithTransaction(
        session,
        createAffectationDto,
      );

      // Prepare charge documents and insert them with the session
      const chargeDocs = chargeData.map((data: any) => ({
        ...data,
        agent: agent._id,
      }));
      const charge = await this.chargeService.createWithTransaction(
        session,
        chargeDocs,
      );

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      const agentCreated = {
        ...agent,
        affectation: { ...affectation },
        charge: { ...charge },
      };
      console.log(agentCreated);
      return agentCreated;
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction aborted due to an error: ', error);
      throw new InternalServerErrorException(
        error,
        'An error occured while creating the agent',
      );
    }
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
        statut: 'Recruitement',
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

      return agent._id;
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
      .select({ _id: 1, matricule: 1, nom: 1, prenom: 1, dateEmbauche: 1 });
    const affectations: any[] = await this.affectationService.findAll();
    return this.listAgents(agents, affectations);
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
        ? agentRubriqueSalaire._id
        : agentRubrique[0]._id;
      if (
        latest.fonction.toString() !== affectationData.fonction ||
        latest.grille.toString() !== affectationData.grille ||
        latest.agentRubrique !== salaireRubrique
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
        (charge) => charge._id === '',
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
