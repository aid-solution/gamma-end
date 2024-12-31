import { Module } from '@nestjs/common';
import { SalaireController } from './salaire.controller';
import { SalaireService } from './salaire.service';
import { ConnectionResolver } from 'src/providers/connectionResolver.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { TenantCachingService } from 'src/providers/tenantCaching.service';
import { UseModel } from 'src/providers/useModel.service';
import { AbsenceService } from 'src/absence/absence.service';
import { AffectationService } from 'src/affectation/affectation.service';
import { AgentAccountService } from 'src/agent-account/agent-account.service';
import { AvancePretService } from 'src/avance-pret/avance-pret.service';
import { CongeService } from 'src/conge/conge.service';
import { AgentRubriqueService } from 'src/agent-rubrique/agent-rubrique.service';
import { FonctionRubriqueService } from 'src/fonction-rubrique/fonction-rubrique.service';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';
import { ChargeService } from 'src/charge/charge.service';
import { TenantService } from 'src/tenant/tenant.service';
import { RubriqueService } from 'src/rubrique/rubrique.service';

@Module({
  controllers: [SalaireController],
  providers: [
    SalaireService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    AffectationService,
    AbsenceService,
    CongeService,
    AvancePretService,
    AgentAccountService,
    AgentRubriqueService,
    FonctionRubriqueService,
    ServiceRubriqueService,
    DirectionRubriqueService,
    ChargeService,
    TenantService,
    RubriqueService,
  ],
  exports: [SalaireService],
})
export class SalaireModule {}
