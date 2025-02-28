import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UseModel } from '../providers/useModel.service';
import { ManagerDbService } from 'src/providers/managerDb.service';
import { getTenantName } from 'src/utilities/getTenantName';
import {
  SalaireDocument,
  SalaireSchema,
} from 'src/schemas/users/salaire.schema';

@Injectable()
export class AutoUpdateSalaireAfterNewOrUpdateItem implements NestInterceptor {
  constructor(
    private readonly useModel: UseModel,
    private managerDbService: ManagerDbService,
  ) {}

  private turnOnTheRoutes: string[] = [
    'agent',
    'absence',
    'affectation',
    'conge',
    'avance-pret',
    'fonction',
    'service',
    'direction',
  ];

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!this.turnOnTheRoutes.includes(request.url.replaceAll('/', ''))) {
      return next.handle();
    }

    if (request.method === 'POST' || request.method === 'PATCH') {
      // Récupérer le tenantName dynamiquement
      const tenantName = this.managerDbService.getTenantDbName(
        getTenantName(request),
      );

      // Connexion au modèle `Salaire`
      const salaireModel = await this.useModel.connectModel<SalaireDocument>(
        tenantName,
        'Salaire',
        SalaireSchema,
      );

      await this.updateSalaire(salaireModel);
    }

    return next.handle();
  }

  private async updateSalaire(salaireModel: any) {
    try {
      const lastSalary: SalaireDocument[] = await salaireModel
        .find({})
        .sort({ annee: -1, mois: -1 })
        .limit(1)
        .exec();

      const salaire = lastSalary[0];
      if (salaire) {
        salaire.isClose = false;
        salaire.isRemunerated = false;
        await salaire.save();
      } else {
        console.log('Aucun salaire trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour automatique', error);
    }
  }
}
