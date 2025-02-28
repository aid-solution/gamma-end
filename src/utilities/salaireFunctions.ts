import { AgentRubriqueDocument } from 'src/schemas/users/agentRubrique.schema';
import { FonctionRubriqueDocument } from 'src/schemas/users/fonctionRubrique.schema';
import { ServiceRubriqueDocument } from 'src/schemas/users/serviceRubrique.schema';
import { DirectionRubriqueDocument } from 'src/schemas/users/directionRubrique.schema';
import {
  differenceBetweenDates,
  formatDate,
  getLastDayOfMonth,
} from './formatDate';
import { ChargeDocument } from 'src/schemas/users/charge.schema';
import { AgentAccountDocument } from 'src/schemas/users/agentAcount.schema';
import { AbsenceDocument } from 'src/schemas/users/absence.schema';
import { CongeDocument } from 'src/schemas/users/conge.schema';
import { SalaireDocument } from 'src/schemas/users/salaire.schema';
import { RubriqueDocument } from 'src/schemas/users/rubrique.schema';

interface Rubrique {
  _id: string;
  code: number;
  libelle: string;
  montant: number;
  jours?: number;
  assujetiImpot?: boolean;
  assujetiCNSS?: boolean;
}

const salaireImposable = (
  nature: 'IUTS' | 'CNSS' = 'IUTS',
  rubriques: Rubrique[],
) => {
  let montant = 0;
  for (const rubrique of rubriques) {
    if (
      (nature === 'IUTS' && rubrique.assujetiImpot) ||
      (nature === 'CNSS' && rubrique.assujetiCNSS)
    ) {
      montant += rubrique.montant;
    }
  }
  return montant;
};

const pourcentageAbattementEnFonctionDeCharge: Record<number | string, number> =
  {
    1: 0.05,
    2: 0.1,
    3: 0.12,
    4: 0.13,
    5: 0.14,
    6: 0.15,
    7: 0.3,
    n: 0.3,
  };

export const combineAllRubriqueAgent = (
  calendier: SalaireDocument,
  initialRubriques: RubriqueDocument[],
  affectations: any[],
  agentRubrique: AgentRubriqueDocument[],
  fonctionRubrique: FonctionRubriqueDocument[],
  serviceRubrique: ServiceRubriqueDocument[],
  directionRubrique: DirectionRubriqueDocument[],
  avancePrets: any[],
  charges: ChargeDocument[],
  agentAccount: AgentAccountDocument[],
  absences: AbsenceDocument[],
  conges: CongeDocument[],
) => {
  const debutMois = new Date(
    Date.UTC(calendier.annee, calendier.mois - 1, 1, 0, 0, 0),
  );
  const finMois = getLastDayOfMonth(debutMois);
  const agentAllRubrique: any[] = [];
  for (const affectation of affectations) {
    const filterAgentRubrique = agentRubrique.filter(
      (ar) => ar.agent.toString() === affectation.agent._id.toString(),
    );

    const filterFonctionRubrique = fonctionRubrique.filter(
      (fx) => fx.fonction.toString() === affectation.fonction._id.toString(),
    );

    const filterFonctionRubriqueRattache =
      affectation.fonction.rattache === 'Service'
        ? serviceRubrique.filter(
            (sv) =>
              sv.service.toString() ===
              affectation.fonction.service._id.toString(),
          )
        : directionRubrique.filter(
            (dr) =>
              dr.direction.toString() ===
              affectation.fonction.direction._id.toString(),
          );
    const filterCharge = charges.filter(
      (charge) =>
        charge.agent.toString() === affectation.agent._id.toString() &&
        ((charge.type === 'Conjoint(e)' &&
          !charge.assujetiCNSS) /* conjoint non salarié */ ||
          (charge.type === 'Enfant' &&
            (charge.handicap /* Enfant infirme célibataire, quel que soit son âge */ ||
              (!charge.handicap &&
                !charge.scolarite &&
                differenceBetweenDates(
                  new Date(charge.dateNaissance),
                  new Date(),
                ) <
                  7670.25) /* Enfant mineur célibataire âgés de 21 ans au plus, 21 * 365.25 = 7670.25 */ ||
              (charge.scolarite &&
                differenceBetweenDates(
                  new Date(charge.dateNaissance),
                  new Date(),
                ) <
                  9131.25)))) /* Enfant célibataires âgés de 25 ans au plus, lorsqu’ils poursuivent leurs études, 25 * 365.25 = 9131.25 */,
    );
    const filterAccount = agentAccount.filter(
      (account) =>
        account.agent.toString() === affectation.agent._id.toString(),
    );

    const filterAbsence = absences.filter(
      (absence) =>
        absence.agent.toString() === affectation.agent._id.toString(),
    );

    const findConge = conges.find(
      (cg) => cg.agent.toString() === affectation.agent._id.toString(),
    );

    const congeItem: { type: string; jours: number } = { type: '', jours: 0 };

    if (findConge) {
      const debut =
        findConge.dateDebut.getTime() > debutMois.getTime()
          ? findConge.dateDebut
          : debutMois;
      const fin =
        findConge.dateFin.getTime() < finMois.getTime()
          ? findConge.dateFin
          : finMois;
      const nombreJoursConge = differenceBetweenDates(debut, fin);
      if (nombreJoursConge >= 30 && findConge.type === 'Sans solde') {
        continue;
      }
      congeItem.jours = nombreJoursConge;
      congeItem.type = findConge.type;
    }

    const absenceDeductible = filterAbsence.filter(
      (absence) => absence.deduction === true,
    );

    const nombreJoursAbsence =
      congeItem.jours +
      (absenceDeductible.length === 0
        ? 0
        : totalJoursAbsence(absenceDeductible, debutMois, finMois));
    const gains: Rubrique[] = [];
    const retenues: Rubrique[] = [];

    const salaireBase = filterAgentRubrique.find(
      (ag) => ag.rubrique.code === 100,
    ).montant;

    const primeAnciennete = montantPrimeAnciennete(
      affectation.agent.dateEmbauche,
      calendier.datePaie,
      salaireBase,
    );
    if (
      primeAnciennete > 0 &&
      !agentRubrique.find((affectation) => affectation.rubrique.code === 102)
    ) {
      const anciennete = initialRubriques.find(
        (initial) => initial.code === 102,
      );
      const item = {
        montant: primeAnciennete,
        rubrique: anciennete,
        agent: affectation.agent._id,
        dateDebut: debutMois,
        dateFin: finMois,
      } as unknown as AgentRubriqueDocument;
      filterAgentRubrique.push(item);
      agentRubrique.push(item);
    }

    gainsRetenues(gains, retenues, filterAgentRubrique, nombreJoursAbsence);
    gainsRetenues(gains, retenues, filterFonctionRubrique, nombreJoursAbsence);
    gainsRetenues(
      gains,
      retenues,
      filterFonctionRubriqueRattache,
      nombreJoursAbsence,
    );

    const filterAvancePret = avancePrets.filter(
      (ap) => ap.agent.toString() === affectation.agent._id.toString(),
    );

    for (const rb of filterAvancePret) {
      if (
        !agentRubrique.find(
          (affectation) => affectation.rubrique.code === +rb.rubrique.code,
        )
      ) {
        const item: Rubrique = {
          _id: rb._id.toString(),
          code: rb.rubrique.code,
          libelle: rb.rubrique.libelle,
          montant: rb.type === 'Avance' ? rb.montant : rb.montantEcheance,
        };
        retenues.push(item);
        const rubrique = {
          montant: rb.type === 'Avance' ? rb.montant : rb.montantEcheance,
          rubrique: rb.rubrique._id,
          agent: affectation.agent._id,
          dateDebut: debutMois,
          dateFin: finMois,
        } as unknown as AgentRubriqueDocument;
        agentRubrique.push(rubrique);
      }
    }

    let montantCotisation = 0;
    const cotisation = affectation.agent.cotisation;
    const salaireImposableCNSS = salaireImposable('CNSS', gains);
    if (cotisation === 'CNSS') {
      const rubriqueCNSS = retenues.find((retenue) => retenue.code === 201);
      montantCotisation =
        salaireImposableCNSS >= 500000
          ? 26250
          : Math.floor(salaireImposableCNSS * 0.0525); // 500000*0.525=26250
      if (!rubriqueCNSS) {
        const item: Rubrique = {
          _id: '201',
          code: 201,
          libelle: 'CNSS',
          montant: montantCotisation,
        };
        retenues.unshift(item);

        const cnss = initialRubriques.find((initial) => initial.code === 201);
        const rubrique = {
          montant: montantCotisation,
          rubrique: cnss,
          agent: affectation.agent._id,
          dateDebut: debutMois,
          dateFin: finMois,
        } as unknown as AgentRubriqueDocument;
        agentRubrique.push(rubrique);
      } else {
        if (rubriqueCNSS.montant !== montantCotisation) {
          const index = retenues.findIndex((retenue) => retenue.code === 201);
          retenues[index].montant = montantCotisation;
        }
      }
    } else {
      const rubriqueFNR = retenues.find((retenue) => retenue.code === 220);
      montantCotisation = Math.floor(salaireBase * 0.06);
      if (!rubriqueFNR) {
        const item: Rubrique = {
          _id: '202',
          code: 202,
          libelle: 'FNR',
          montant: montantCotisation,
        };
        retenues.unshift(item);

        const fnr = initialRubriques.find((initial) => initial.code === 220);
        const rubrique = {
          montant: montantCotisation,
          rubrique: fnr,
          agent: affectation.agent._id,
          dateDebut: debutMois,
          dateFin: finMois,
        } as unknown as AgentRubriqueDocument;
        agentRubrique.push(rubrique);
      } else {
        if (rubriqueFNR.montant !== montantCotisation) {
          const index = retenues.findIndex((retenue) => retenue.code === 201);
          retenues[index].montant = montantCotisation;
        }
      }
    }

    const salaireImposableIUTS =
      salaireImposable('IUTS', gains) - montantCotisation;
    const IUTS = grilleIUTS(salaireImposableIUTS, filterCharge.length);
    const rubriqueIUTS = retenues.find((retenue) => retenue.code === 154);

    if (!rubriqueIUTS) {
      const salaireImposableIUTS =
        salaireImposable('IUTS', gains) - montantCotisation;
      const IUTS = grilleIUTS(salaireImposableIUTS, filterCharge.length);
      const item: Rubrique = {
        _id: '154',
        code: 154,
        libelle: 'IU/TS',
        montant: IUTS,
      };
      retenues.unshift(item);

      const iuts = initialRubriques.find((initial) => initial.code === 154);
      const rubrique = {
        montant: IUTS,
        rubrique: iuts,
        agent: affectation.agent._id,
        dateDebut: debutMois,
        dateFin: finMois,
      } as unknown as AgentRubriqueDocument;

      agentRubrique.push(rubrique);
    } else {
      if (rubriqueIUTS.montant !== IUTS) {
        const index = retenues.findIndex((retenue) => retenue.code === 154);
        retenues[index].montant = IUTS;
      }
    }

    if (
      ['Annuel', 'Maternité'].includes(congeItem.type) &&
      congeItem.jours > 0
    ) {
      let montantCotisationConge = 0;
      const salaireConge =
        congeItem.type === 'Maternité'
          ? Math.floor(((salaireBase * 0.5) / 30) * congeItem.jours)
          : Math.floor((salaireBase / 30) * congeItem.jours);

      const rubriqueConge = gains.find((gain) =>
        [110, 111].includes(gain.code),
      );
      if (!rubriqueConge) {
        const item: Rubrique = {
          _id: congeItem.type === 'Annuel' ? '110' : '111',
          code: congeItem.type === 'Annuel' ? 110 : 111,
          libelle:
            congeItem.type === 'Annuel' ? 'Congé payé' : 'Congé de maternité',
          jours: congeItem.jours,
          montant: salaireConge,
        };
        gains.splice(1, 0, item);
        const conge = initialRubriques.find(
          (initial) =>
            (initial.code === 110 && congeItem.type === 'Annuel') ||
            (initial.code === 111 && congeItem.type === 'Maternité'),
        );
        const rubrique = {
          montant: salaireConge,
          rubrique: conge,
          agent: affectation.agent._id,
          dateDebut: debutMois,
          dateFin: finMois,
        } as unknown as AgentRubriqueDocument;

        agentRubrique.push(rubrique);
      } else {
        if (rubriqueConge.montant !== salaireConge) {
          const index = gains.findIndex((gain) =>
            [110, 111].includes(gain.code),
          );
          gains[index].montant = salaireConge;
        }
      }
      const rubriqueCongeCNSS = retenues.find((retenue) =>
        [155, 156].includes(retenue.code),
      );
      montantCotisationConge =
        salaireConge >= 500000 ? 26250 : Math.floor(salaireConge * 0.0525); // 500000*0.525=26250
      if (!rubriqueCongeCNSS) {
        const item: Rubrique = {
          _id: congeItem.type === 'Annuel' ? '202' : '203',
          code: congeItem.type === 'Annuel' ? 202 : 203,
          libelle:
            congeItem.type === 'Annuel'
              ? 'CNSS Congé payé'
              : 'CNSS Congé de maternité',
          montant: montantCotisationConge,
        };
        retenues.splice(2, 0, item);
        const cnss = initialRubriques.find(
          (initial) =>
            (initial.code === 202 && congeItem.type === 'Annuel') ||
            (initial.code === 203 && congeItem.type === 'Maternité'),
        );
        const rubrique = {
          montant: montantCotisationConge,
          rubrique: cnss,
          agent: affectation.agent._id,
          dateDebut: debutMois,
          dateFin: finMois,
        } as unknown as AgentRubriqueDocument;

        agentRubrique.push(rubrique);
      } else {
        if (rubriqueCongeCNSS.montant !== montantCotisationConge) {
          const index = retenues.findIndex((retenue) =>
            [155, 156].includes(retenue.code),
          );
          retenues[index].montant = montantCotisationConge;
        }
      }

      if (!retenues.find((retenue) => [155, 156].includes(retenue.code))) {
        const salaireImposableIUTS = salaireConge - montantCotisationConge;
        const IUTS = grilleIUTS(salaireImposableIUTS, filterCharge.length);
        const item: Rubrique = {
          _id: congeItem.type === 'Annuel' ? '155' : '156',
          code: congeItem.type === 'Annuel' ? 155 : 156,
          libelle:
            congeItem.type === 'Annuel'
              ? 'IU/TS Congé payé'
              : 'IU/TS Congé de maternité',
          montant: IUTS,
        };
        retenues.splice(2, 0, item);
        const iuts = initialRubriques.find(
          (initial) =>
            (initial.code === 155 && congeItem.type === 'Annuel') ||
            (initial.code === 156 && congeItem.type === 'Maternité'),
        );
        const rubrique = {
          montant: IUTS,
          rubrique: iuts,
          agent: affectation.agent._id,
          dateDebut: debutMois,
          dateFin: finMois,
        } as unknown as AgentRubriqueDocument;

        agentRubrique.push(rubrique);
      }
    }

    agentAllRubrique.push({
      _id: affectation.agent._id,
      matricule: affectation.agent.matricule,
      'nom-prenom': `${affectation.agent.nom} ${affectation.agent.prenom}`,
      section:
        affectation.fonction.rattache === 'Service'
          ? affectation.fonction.service.libelle
          : affectation.fonction.direction.libelle,
      emploi: affectation.fonction.libelle,
      cotisation: affectation.agent.cotisation,
      'num-cotisation': affectation.agent.cotisationNumero,
      'cat-profession': affectation.grille.categorie.libelle,
      'date-embauche': formatDate(affectation.agent.dateEmbauche),
      charge: filterCharge.length,
      absence: nombreJoursAbsence,
      gains: gains.sort((a, b) =>
        a.code.toString().localeCompare(b.code.toString()),
      ),
      retenues: retenues.sort((a, b) =>
        a.code.toString().localeCompare(b.code.toString()),
      ),
      position: 'En activité',
      'total-gains': sommeRubrique(gains),
      'total-retenues': sommeRubrique(retenues),
      brut: sommeRubrique(gains),
      imposable: sommeRubrique(gains),
      net: sommeRubrique(gains) - sommeRubrique(retenues),
      'mode-paiement': affectation.agent.modePaiement,
      banque: filterAccount[0] ? filterAccount[0].banque.libelle : 'Caisse',
      'num-compte': filterAccount[0] ? filterAccount[0].compte : '',
    });
  }
  return agentAllRubrique;
};

export const combineAllRubrique = (
  debutMois: Date,
  finMois: Date,
  affectations: any[],
  agentRubrique: AgentRubriqueDocument[],
  fonctionRubrique: FonctionRubriqueDocument[],
  serviceRubrique: ServiceRubriqueDocument[],
  directionRubrique: DirectionRubriqueDocument[],
  charges: ChargeDocument[],
  agentAccount: AgentAccountDocument[],
  absences: AbsenceDocument[],
  conges: CongeDocument[],
) => {
  const agentAllRubrique: any[] = [];
  for (const affectation of affectations) {
    const findConge = conges.find(
      (cg) => cg.agent.toString() === affectation.agent._id.toString(),
    );

    const congeItem: { type: string; jours: number } = { type: '', jours: 0 };

    if (findConge) {
      const debut =
        findConge.dateDebut.getTime() > debutMois.getTime()
          ? findConge.dateDebut
          : debutMois;
      const fin =
        findConge.dateFin.getTime() < finMois.getTime()
          ? findConge.dateFin
          : finMois;
      const nombreJoursConge = differenceBetweenDates(debut, fin);
      if (nombreJoursConge >= 30 && findConge.type === 'Sans solde') {
        continue;
      }
      congeItem.jours = nombreJoursConge;
      congeItem.type = findConge.type;
    }

    const filterAgentRubrique = agentRubrique.filter(
      (ar) => ar.agent.toString() === affectation.agent._id.toString(),
    );

    const filterFonctionRubrique = fonctionRubrique.filter(
      (fx) => fx.fonction.toString() === affectation.fonction._id.toString(),
    );

    const filterFonctionRubriqueRattache =
      affectation.fonction.rattache === 'Service'
        ? serviceRubrique.filter(
            (sv) =>
              sv.service.toString() ===
              affectation.fonction.service._id.toString(),
          )
        : directionRubrique.filter(
            (dr) =>
              dr.direction.toString() ===
              affectation.fonction.direction._id.toString(),
          );

    const filterAbsence = absences.filter(
      (absence) =>
        absence.agent.toString() === affectation.agent._id.toString(),
    );

    const nombreJoursAbsence =
      congeItem.jours +
      (filterAbsence.length === 0
        ? 0
        : totalJoursAbsence(filterAbsence, debutMois, finMois));
    const gains: Rubrique[] = [];
    const retenues: Rubrique[] = [];

    gainsRetenues(gains, retenues, filterAgentRubrique, nombreJoursAbsence);
    gainsRetenues(gains, retenues, filterFonctionRubrique, nombreJoursAbsence);
    gainsRetenues(
      gains,
      retenues,
      filterFonctionRubriqueRattache,
      nombreJoursAbsence,
    );
    gainsRetenues(
      gains,
      retenues,
      filterFonctionRubriqueRattache,
      nombreJoursAbsence,
    );

    const filterCharge = charges.filter(
      (charge) =>
        charge.agent.toString() === affectation.agent._id.toString() &&
        ((charge.type === 'Conjoint(e)' &&
          !charge.assujetiCNSS) /* conjoint non salarié */ ||
          (charge.type === 'Enfant' &&
            (charge.handicap /* Enfant infirme célibataire, quel que soit son âge */ ||
              (!charge.handicap &&
                !charge.scolarite &&
                differenceBetweenDates(
                  new Date(charge.dateNaissance),
                  new Date(),
                ) <
                  7670.25) /* Enfant mineur célibataire âgés de 21 ans au plus, 21 * 365.25 = 7670.25 */ ||
              (charge.scolarite &&
                differenceBetweenDates(
                  new Date(charge.dateNaissance),
                  new Date(),
                ) <
                  9131.25)))) /* Enfant célibataires âgés de 25 ans au plus, lorsqu’ils poursuivent leurs études, 25 * 365.25 = 9131.25 */,
    );
    const filterAccount = agentAccount.filter(
      (account) =>
        account.agent.toString() === affectation.agent._id.toString(),
    );
    agentAllRubrique.push({
      _id: affectation.agent._id,
      matricule: affectation.agent.matricule,
      'nom-prenom': `${affectation.agent.nom} ${affectation.agent.prenom}`,
      section:
        affectation.fonction.rattache === 'Service'
          ? affectation.fonction.service.libelle
          : affectation.fonction.direction.libelle,
      emploi: affectation.fonction.libelle,
      cotisation: affectation.agent.cotisation,
      'num-cotisation': affectation.agent.cotisationNumero,
      'cat-profession': affectation.grille.categorie.libelle,
      'date-embauche': formatDate(affectation.agent.dateEmbauche),
      charge: filterCharge.length,
      absence: nombreJoursAbsence,
      gains: gains,
      retenues: retenues,
      position: 'En activité',
      'total-gains': sommeRubrique(gains),
      'total-retenues': sommeRubrique(retenues),
      brut: sommeRubrique(gains),
      imposable: sommeRubrique(gains),
      net: sommeRubrique(gains) - sommeRubrique(retenues),
      'mode-paiement': affectation.agent.modePaiement,
      banque: filterAccount[0].banque.libelle,
      'num-compte': filterAccount[0].compte,
    });
  }
  return agentAllRubrique;
};

const gainsRetenues = (
  gains: Rubrique[],
  retenues: Rubrique[],
  rubriques:
    | AgentRubriqueDocument[]
    | FonctionRubriqueDocument[]
    | ServiceRubriqueDocument[]
    | DirectionRubriqueDocument[],
  absence: number,
) => {
  for (const rb of rubriques) {
    const item: Rubrique = {
      _id: rb._id ? rb._id.toString() : `${rb.rubrique.code}`,
      code: rb.rubrique.code,
      libelle: rb.rubrique.libelle,
      montant: Math.floor(rb.montant),
    };
    if (
      rb.rubrique.gainRetenue === 'Gain' &&
      !gains.find((gain) => gain.libelle === rb.rubrique.libelle)
    ) {
      item.jours = 30 - absence;
      item.montant = Math.floor((item.montant / 30) * item.jours);
      item.assujetiCNSS = rb.rubrique.assujetiCNSS;
      item.assujetiImpot = rb.rubrique.assujetiImpot;
      gains.push(item);
    }

    if (
      rb.rubrique.gainRetenue === 'Retenue' &&
      !retenues.find((retenu) => retenu.libelle === rb.rubrique.libelle)
    ) {
      retenues.push(item);
    }
  }
};

const sommeRubrique = (rubriques: Rubrique[]): number => {
  let total = 0;
  for (const rubrique of rubriques) {
    total += rubrique.montant;
  }
  return total;
};

const totalJoursAbsence = (
  absences: AbsenceDocument[],
  dateDebut: Date,
  dateFin: Date,
): number => {
  let total = 0;
  for (const absence of absences) {
    const debut =
      absence.dateDebut.getTime() > dateDebut.getTime()
        ? absence.dateDebut
        : dateDebut;
    const fin =
      absence.dateFin.getTime() < dateFin.getTime() ? absence.dateFin : dateFin;
    total += differenceBetweenDates(debut, fin);
  }
  return total;
};

const grilleIUTS = (salaire: number, charge: number | string = 0): number => {
  const baseIUTS = 1000 * Math.floor((salaire * 0.87) / 1000);
  const pourcentage =
    charge === 0 ? 0 : pourcentageAbattementEnFonctionDeCharge[charge];
  const abattement1 = baseIUTS * pourcentage;
  const abattement2 = 0;
  const montant = baseIUTS - abattement1 - abattement2;
  let bareme = 0,
    plafond = 0;

  if (montant <= 25000) {
    bareme = montant * 0.01;
  } else if (montant > 25000 && montant <= 50000) {
    bareme = (montant - 25000) * 0.02;
    plafond = 250;
  } else if (montant > 50000 && montant <= 100000) {
    bareme = (montant - 50000) * 0.06;
    plafond = 750; // 250+500
  } else if (montant > 100000 && montant <= 150000) {
    bareme = (montant - 100000) * 0.13;
    plafond = 3750; // 250+500+3000
  } else if (montant > 150000 && montant <= 300000) {
    bareme = (montant - 150000) * 0.25;
    plafond = 10250; // 250+500+3000+6500
  } else if (montant > 300000 && montant <= 400000) {
    bareme = (montant - 300000) * 0.3;
    plafond = 47750; // 250+500+3000+6500+37500
  } else if (montant > 400000 && montant <= 700000) {
    bareme = (montant - 400000) * 0.32;
    plafond = 77750; // 250+500+3000+6500+37500+30000
  } else if (montant > 700000 && montant <= 1000000) {
    bareme = (montant - 700000) * 0.34;
    plafond = 173750; // 250+500+3000+6500+37500+30000+96000
  } else if (montant > 1000000) {
    bareme = (montant - 1000000) * 0.35;
    plafond = 275750; // 250+500+3000+6500+37500+30000+96000+102000
  }
  return plafond + Math.floor(bareme);
};

const montantPrimeAnciennete = (
  dateEmbauche: Date,
  datePaie: Date,
  salaire: number,
): number => {
  const anciennete = Math.floor(
    differenceBetweenDates(dateEmbauche, datePaie) / 365.25,
  );
  const primeAnciennete = salaire * 0.01;
  let montantAnciennete = 0;
  if (anciennete >= 3 && anciennete <= 24)
    montantAnciennete = anciennete * primeAnciennete;
  else if (anciennete > 24) montantAnciennete = 24 * primeAnciennete;
  return montantAnciennete;
};

export const rubriqueCombineMontant = (
  rubriques: any[],
  newRubriques: any[],
): Rubrique[] => {
  const result: Rubrique[] = [];
  for (const rubrique of rubriques) {
    const findIndex = newRubriques.findIndex(
      (item) => item.code === rubrique.code,
    );
    result.push({
      _id: rubrique._id,
      code: rubrique.code,
      libelle: rubrique.libelle,
      montant:
        findIndex === -1
          ? rubrique.montant
          : rubrique.montant + newRubriques[findIndex].montant,
    });
  }
  for (const rubrique of newRubriques) {
    if (!result.find((res) => res.code === rubrique.code)) {
      result.push({
        _id: rubrique._id,
        code: rubrique.code,
        libelle: rubrique.libelle,
        montant: rubrique.montant,
      });
    }
  }
  return result.sort((a, b) =>
    a.code.toString().localeCompare(b.code.toString()),
  );
};
