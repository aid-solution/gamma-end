import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConnectionResolver } from './providers/connectionResolver.service';
import { ManagerDbService } from './providers/managerDb.service';
import { UseModel } from './providers/useModel.service';
import { TenantCachingService } from './providers/tenantCaching.service';
import { TenantNameMiddleware } from './middlewares/tenantName.middleware';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChargeModule } from './charge/charge.module';
import { FonctionModule } from './fonction/fonction.module';
import { AgentModule } from './agent/agent.module';
import { ServiceModule } from './service/service.module';
import { DirectionModule } from './direction/direction.module';
import { EchellonModule } from './echellon/echellon.module';
import { CategorieModule } from './categorie/categorie.module';
import { RubriqueModule } from './rubrique/rubrique.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { AffectationModule } from './affectation/affectation.module';
import { GrilleModule } from './grille/grille.module';
import { BanqueModule } from './banque/banque.module';
import { DirectionRubriqueModule } from './direction-rubrique/direction-rubrique.module';
import { ServiceRubriqueModule } from './service-rubrique/service-rubrique.module';
import { FonctionRubriqueModule } from './fonction-rubrique/fonction-rubrique.module';
import { TenantModule } from './tenant/tenant.module';
import { AgentAccountModule } from './agent-account/agent-account.module';
import { AgentRubriqueModule } from './agent-rubrique/agent-rubrique.module';
import { AbsenceModule } from './absence/absence.module';
import { CongeModule } from './conge/conge.module';
import { AvancePretModule } from './avance-pret/avance-pret.module';
import { SalaireModule } from './salaire/salaire.module';
import { TenantAccountModule } from './tenant-account/tenant-account.module';
import { MotifAbsenceModule } from './motif-absence/motif-absence.module';
import { ProfilModule } from './profil/profil.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AutoUpdateSalaireAfterNewOrUpdateItem } from './interceptors/autoUpdateSalaireAfterNewOrUpdateItem.interceptor';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule.forRoot(),
    UsersModule,
    AuthModule,
    ChargeModule,
    FonctionModule,
    AgentModule,
    ServiceModule,
    DirectionModule,
    EchellonModule,
    CategorieModule,
    RubriqueModule,
    AffectationModule,
    GrilleModule,
    BanqueModule,
    DirectionRubriqueModule,
    ServiceRubriqueModule,
    FonctionRubriqueModule,
    TenantModule,
    AgentAccountModule,
    AgentRubriqueModule,
    AbsenceModule,
    CongeModule,
    AvancePretModule,
    SalaireModule,
    TenantAccountModule,
    MotifAbsenceModule,
    ProfilModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UseModel,
    ConnectionResolver,
    ManagerDbService,
    TenantCachingService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AutoUpdateSalaireAfterNewOrUpdateItem,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantNameMiddleware)
      .exclude('tenant/(.*)', '/admin/(.*)')
      .forRoutes('/*');
    consumer
      .apply(AuthMiddleware)
      .exclude('/users', 'auth/(.*)', 'agent/(.*)')
      .forRoutes('/*');
  }
}
